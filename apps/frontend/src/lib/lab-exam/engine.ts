/**
 * Tiny bash-like shell simulator that powers interactive lab exams.
 * Supports the commands the Linux labs teach: pwd, cd, ls (-l/-a),
 * mkdir (-p), echo (with > and >>), touch, cat, find (-name/-type),
 * grep (-r), plus unquoted-glob expansion — enough to run every task
 * of a navigation lab deterministically in the browser.
 */

import type { LabExamCheck } from "./types";

export interface FsNode {
  type: "dir" | "file";
  content?: string;
}

export interface ShellState {
  /** absolute path -> node ("/" and HOME always exist) */
  fs: Record<string, FsNode>;
  cwd: string;
}

export interface ExecResult {
  state: ShellState;
  output: string;
  error: boolean;
}

export const HOME = "/root";

export function createShell(): ShellState {
  return {
    fs: { "/": { type: "dir" }, [HOME]: { type: "dir" } },
    cwd: HOME,
  };
}

export function displayCwd(cwd: string): string {
  if (cwd === HOME) return "~";
  if (cwd.startsWith(HOME + "/")) return "~" + cwd.slice(HOME.length);
  return cwd;
}

export function resolvePath(cwd: string, raw: string): string {
  let p = raw;
  if (p === "~") p = HOME;
  else if (p.startsWith("~/")) p = HOME + p.slice(1);
  const abs = p.startsWith("/") ? p : cwd + "/" + p;
  const out: string[] = [];
  for (const seg of abs.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return "/" + out.join("/");
}

function parentOf(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx <= 0 ? "/" : path.slice(0, idx);
}

function baseName(path: string): string {
  return path === "/" ? "/" : path.slice(path.lastIndexOf("/") + 1);
}

function childrenOf(fs: Record<string, FsNode>, dir: string): string[] {
  const prefix = dir === "/" ? "/" : dir + "/";
  return Object.keys(fs)
    .filter(
      (p) =>
        p !== "/" &&
        p.startsWith(prefix) &&
        !p.slice(prefix.length).includes("/"),
    )
    .sort();
}

function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp("^" + escaped + "$");
}

interface Token {
  text: string;
  quoted: boolean;
}

function tokenize(input: string): Token[] | null {
  const toks: Token[] = [];
  let i = 0;
  while (i < input.length) {
    while (i < input.length && input[i] === " ") i++;
    if (i >= input.length) break;
    let text = "";
    let quoted = false;
    while (i < input.length && input[i] !== " ") {
      const c = input[i];
      if (c === '"' || c === "'") {
        quoted = true;
        i++;
        while (i < input.length && input[i] !== c) text += input[i++];
        if (i >= input.length) return null; // unclosed quote
        i++;
      } else {
        text += c;
        i++;
      }
    }
    toks.push({ text, quoted });
  }
  return toks;
}

/** Expands an unquoted token containing * or ? against the fs (bash-style). */
function expandGlob(state: ShellState, tok: Token): string[] {
  if (tok.quoted || !/[*?]/.test(tok.text)) return [tok.text];
  let pattern = tok.text;
  if (pattern === "~" || pattern.startsWith("~/"))
    pattern = HOME + pattern.slice(1);
  const absolute = pattern.startsWith("/");
  const segs = pattern.split("/").filter((s) => s.length > 0);
  let candidates: { abs: string; disp: string }[] = absolute
    ? [{ abs: "/", disp: "" }]
    : [{ abs: state.cwd, disp: "" }];
  for (const seg of segs) {
    const next: { abs: string; disp: string }[] = [];
    for (const c of candidates) {
      if (/[*?]/.test(seg)) {
        const re = globToRegex(seg);
        for (const childAbs of childrenOf(state.fs, c.abs)) {
          const name = baseName(childAbs);
          if (re.test(name))
            next.push({
              abs: childAbs,
              disp: c.disp ? c.disp + "/" + name : absolute ? "/" + name : name,
            });
        }
      } else {
        const abs = resolvePath(c.abs, seg);
        if (state.fs[abs])
          next.push({
            abs,
            disp: c.disp ? c.disp + "/" + seg : absolute ? "/" + seg : seg,
          });
      }
    }
    candidates = next;
    if (!candidates.length) break;
  }
  if (!candidates.length) return [tok.text];
  return candidates
    .map((c) => (absolute && !c.disp.startsWith("/") ? "/" + c.disp : c.disp))
    .sort();
}

function lsMetaLine(name: string, node: FsNode): string {
  const isDir = node.type === "dir";
  const perms = isDir ? "drwxr-xr-x" : "-rw-r--r--";
  const links = isDir ? 2 : 1;
  const size = isDir ? 4096 : (node.content ?? "").length + 1;
  return `${perms} ${links} root root ${String(size).padStart(4)} Jan 26 20:42 ${name}`;
}

/** Executes one command line. Never mutates the given state. */
export function execute(prev: ShellState, input: string): ExecResult {
  const state: ShellState = JSON.parse(JSON.stringify(prev));
  const fail = (output: string): ExecResult => ({
    state: prev,
    output,
    error: true,
  });
  const ok = (output = ""): ExecResult => ({ state, output, error: false });

  const rawToks = tokenize(input.trim());
  if (!rawToks) return fail("bash: syntax error: unclosed quote");
  if (!rawToks.length) return ok();
  const cmd = rawToks[0].text;
  const rest = rawToks.slice(1);

  switch (cmd) {
    case "pwd":
      return ok(state.cwd);

    case "cd": {
      const args = rest.filter((t) => !t.text.startsWith("-") || t.quoted);
      if (args.length > 1) return fail("bash: cd: too many arguments");
      const raw = args[0]?.text ?? "~";
      const abs = resolvePath(state.cwd, raw);
      const node = state.fs[abs];
      if (!node) return fail(`bash: cd: ${raw}: No such file or directory`);
      if (node.type !== "dir") return fail(`bash: cd: ${raw}: Not a directory`);
      state.cwd = abs;
      return ok();
    }

    case "mkdir": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text);
      const parents = flags.some((f) => /^-\w*p\w*$/.test(f));
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return fail("mkdir: missing operand");
      for (const a of args) {
        const abs = resolvePath(state.cwd, a.text);
        if (state.fs[abs]) {
          if (parents) continue;
          return fail(
            `mkdir: cannot create directory '${a.text}': File exists`,
          );
        }
        const missing: string[] = [];
        let cur = abs;
        while (!state.fs[cur]) {
          missing.unshift(cur);
          cur = parentOf(cur);
        }
        if (state.fs[cur].type !== "dir")
          return fail(
            `mkdir: cannot create directory '${a.text}': Not a directory`,
          );
        if (missing.length > 1 && !parents)
          return fail(
            `mkdir: cannot create directory '${a.text}': No such file or directory`,
          );
        for (const m of missing) state.fs[m] = { type: "dir" };
      }
      return ok();
    }

    case "touch": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return fail("touch: missing file operand");
      for (const a of args) {
        const abs = resolvePath(state.cwd, a.text);
        if (state.fs[abs]) continue;
        if (!state.fs[parentOf(abs)] || state.fs[parentOf(abs)].type !== "dir")
          return fail(
            `touch: cannot touch '${a.text}': No such file or directory`,
          );
        state.fs[abs] = { type: "file", content: "" };
      }
      return ok();
    }

    case "echo": {
      const parts: string[] = [];
      let mode: ">" | ">>" | null = null;
      let target: string | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && (t.text === ">" || t.text === ">>")) {
          mode = t.text;
          target = rest[i + 1]?.text ?? null;
          if (!target)
            return fail("bash: syntax error near unexpected token `newline'");
          break;
        }
        parts.push(t.text);
      }
      const text = parts.join(" ");
      if (!mode) return ok(text);
      const abs = resolvePath(state.cwd, target!);
      const parent = state.fs[parentOf(abs)];
      if (!parent || parent.type !== "dir")
        return fail(`bash: ${target}: No such file or directory`);
      if (state.fs[abs]?.type === "dir")
        return fail(`bash: ${target}: Is a directory`);
      if (mode === ">" || !state.fs[abs])
        state.fs[abs] = { type: "file", content: text };
      else
        state.fs[abs] = {
          type: "file",
          content: (state.fs[abs].content ?? "") + "\n" + text,
        };
      return ok();
    }

    case "cat": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return fail("cat: missing operand");
      const out: string[] = [];
      for (const a of args) {
        const abs = resolvePath(state.cwd, a.text);
        const node = state.fs[abs];
        if (!node) return fail(`cat: ${a.text}: No such file or directory`);
        if (node.type === "dir") return fail(`cat: ${a.text}: Is a directory`);
        out.push(node.content ?? "");
      }
      return ok(out.join("\n"));
    }

    case "ls": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const long = flags.includes("l");
      const all = flags.includes("a");
      const args = rest
        .filter((t) => t.quoted || !t.text.startsWith("-"))
        .flatMap((t) => expandGlob(state, t));
      const raw = args[0] ?? ".";
      const abs = resolvePath(state.cwd, raw);
      const node = state.fs[abs];
      if (!node)
        return fail(`ls: cannot access '${raw}': No such file or directory`);
      if (node.type === "file") return ok(long ? lsMetaLine(raw, node) : raw);
      const names = childrenOf(state.fs, abs).map(baseName);
      const entries = all ? [".", "..", ...names] : names;
      if (!long) return ok(entries.join("  "));
      const lines = [`total ${entries.length * 4}`];
      for (const name of entries) {
        const n =
          name === "."
            ? node
            : name === ".."
              ? (state.fs[parentOf(abs)] ?? node)
              : state.fs[abs === "/" ? "/" + name : abs + "/" + name];
        lines.push(lsMetaLine(name, n));
      }
      return ok(lines.join("\n"));
    }

    case "find": {
      let startTok: string | null = null;
      let namePat: string | null = null;
      let typeFilter: "f" | "d" | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && t.text === "-name") {
          namePat = rest[++i]?.text ?? null;
          if (namePat === null)
            return fail("find: missing argument to `-name'");
        } else if (!t.quoted && t.text === "-type") {
          const v = rest[++i]?.text;
          if (v !== "f" && v !== "d")
            return fail(
              `find: Arguments to -type should contain only one letter`,
            );
          typeFilter = v;
        } else if (!t.quoted && t.text.startsWith("-")) {
          return fail(`find: unknown predicate '${t.text}'`);
        } else if (startTok === null) {
          startTok = t.text;
        }
      }
      const raw = startTok ?? ".";
      const abs = resolvePath(state.cwd, raw);
      if (!state.fs[abs])
        return fail(`find: '${raw}': No such file or directory`);
      // ~ is expanded by the shell before find runs, so display it absolute
      const dispBase = raw === "~" || raw.startsWith("~/") ? abs : raw;
      const re = namePat ? globToRegex(namePat) : null;
      const results: string[] = [];
      const all = Object.keys(state.fs)
        .filter((p) => p === abs || p.startsWith(abs === "/" ? "/" : abs + "/"))
        .sort();
      for (const p of all) {
        const node = state.fs[p];
        if (typeFilter === "f" && node.type !== "file") continue;
        if (typeFilter === "d" && node.type !== "dir") continue;
        if (re && !re.test(baseName(p))) continue;
        results.push(p === abs ? dispBase : dispBase + p.slice(abs.length));
      }
      return ok(results.join("\n"));
    }

    case "grep": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const recursive = flags.includes("r") || flags.includes("R");
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (args.length < 2) return fail("usage: grep [-r] PATTERN FILE...");
      const pattern = args[0].text;
      const targets = args.slice(1).flatMap((t) => expandGlob(state, t));
      const files: { abs: string; disp: string }[] = [];
      for (const raw of targets) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node) return fail(`grep: ${raw}: No such file or directory`);
        const dispBase = raw === "~" || raw.startsWith("~/") ? abs : raw;
        if (node.type === "dir") {
          if (!recursive) return fail(`grep: ${raw}: Is a directory`);
          for (const p of Object.keys(state.fs)
            .filter((p) => p.startsWith(abs === "/" ? "/" : abs + "/"))
            .sort()) {
            if (state.fs[p].type === "file")
              files.push({ abs: p, disp: dispBase + p.slice(abs.length) });
          }
        } else {
          files.push({ abs, disp: dispBase });
        }
      }
      const prefix = recursive || files.length > 1;
      const out: string[] = [];
      for (const f of files) {
        for (const line of (state.fs[f.abs].content ?? "").split("\n")) {
          if (line.includes(pattern))
            out.push(prefix ? `${f.disp}:${line}` : line);
        }
      }
      return ok(out.join("\n"));
    }

    default:
      return fail(`bash: ${cmd}: command not found`);
  }
}

/** "-x" style requirements match a flag letter anywhere in a dash cluster. */
function matchesToken(command: string, token: string): boolean {
  if (/^-\w$/.test(token)) {
    return new RegExp(`(^|\\s)-\\w*${token[1]}\\w*(\\s|$)`).test(command);
  }
  return command.includes(token);
}

export interface CheckContext {
  input: string;
  prevState: ShellState;
  result: ExecResult;
}

export function evaluateCheck(
  check: LabExamCheck,
  ctx: CheckContext,
): { pass: boolean; reason?: string } {
  const command = ctx.input.trim().replace(/\s+/g, " ");
  if (ctx.result.error)
    return { pass: false, reason: "কমান্ডটা error দিয়েছে" };
  for (const req of check.require ?? []) {
    if (!matchesToken(command, req))
      return { pass: false, reason: `কমান্ডে ${req} ব্যবহার হওয়ার কথা` };
  }
  for (const bad of check.forbid ?? []) {
    if (matchesToken(command, bad))
      return { pass: false, reason: `এই প্রশ্নে ${bad} ব্যবহার করা যাবে না` };
  }
  if (check.style) {
    const arg = command
      .split(" ")
      .slice(1)
      .find((w) => !w.startsWith("-"));
    const isAbs = !!arg && /^[/~]/.test(arg);
    if (check.style === "relative" && isAbs)
      return {
        pass: false,
        reason: "path-টা relative হতে হবে (/ বা ~ দিয়ে শুরু না)",
      };
    if (check.style === "absolute" && !isAbs)
      return {
        pass: false,
        reason: "path-টা absolute হতে হবে (/ বা ~ দিয়ে শুরু)",
      };
  }
  if (check.paths) {
    for (const t of check.paths) {
      const abs = resolvePath(HOME, t.path);
      const node = ctx.result.state.fs[abs];
      if (!node || node.type !== t.type)
        return { pass: false, reason: `${t.path} এখনো তৈরি হয়নি` };
      if (t.content !== undefined && (node.content ?? "") !== t.content)
        return { pass: false, reason: `${t.path}-এর ভেতরের লেখা মিলছে না` };
    }
  }
  if (check.cwd) {
    const expect = resolvePath(HOME, check.cwd);
    if (ctx.result.state.cwd !== expect)
      return { pass: false, reason: "ঠিক জায়গায় পৌঁছাওনি — pwd মিলছে না" };
  }
  if (check.ref) {
    const refRes = execute(ctx.prevState, check.ref);
    if (ctx.result.output.trim() !== refRes.output.trim())
      return { pass: false, reason: "output-টা প্রত্যাশার সাথে মিলছে না" };
  }
  return { pass: true };
}
