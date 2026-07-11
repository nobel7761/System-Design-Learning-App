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
  /** octal permission digits, e.g. "644" (defaults: file 644, dir 755) */
  mode?: string;
  /** owner user name (default root) */
  owner?: string;
  /** owning group name (default root) */
  group?: string;
}

export function nodeMode(node: FsNode): string {
  return node.mode ?? (node.type === "dir" ? "755" : "644");
}

function modeToRwx(mode: string): string {
  return mode
    .split("")
    .map((d) => {
      const n = Number(d);
      return `${n & 4 ? "r" : "-"}${n & 2 ? "w" : "-"}${n & 1 ? "x" : "-"}`;
    })
    .join("");
}

/** Applies a symbolic chmod spec ("u+x", "go-w,a=r") to octal digits. */
function applySymbolic(mode: string, spec: string): string | null {
  const digits = mode.split("").map(Number);
  for (const clause of spec.split(",")) {
    const m = clause.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
    if (!m) return null;
    const who = m[1] || "a";
    let bits = 0;
    if (m[3].includes("r")) bits |= 4;
    if (m[3].includes("w")) bits |= 2;
    if (m[3].includes("x")) bits |= 1;
    const idxMap: Record<string, number> = { u: 0, g: 1, o: 2 };
    const idxs = who.includes("a") ? [0, 1, 2] : [...who].map((c) => idxMap[c]);
    for (const i of idxs) {
      if (m[2] === "+") digits[i] |= bits;
      else if (m[2] === "-") digits[i] &= ~bits;
      else digits[i] = bits;
    }
  }
  return digits.join("");
}

export interface UserRec {
  uid: number;
  /** primary group name */
  primary: string;
  /** supplementary group names */
  supplementary: string[];
  locked: boolean;
  shell: string;
}

export interface ShellState {
  /** absolute path -> node ("/" and HOME always exist) */
  fs: Record<string, FsNode>;
  cwd: string;
  /** user name -> record (root always exists) */
  users: Record<string, UserRec>;
  /** group name -> GID */
  groups: Record<string, number>;
}

export interface ExecResult {
  state: ShellState;
  output: string;
  error: boolean;
}

export const HOME = "/root";

/** Regenerates /etc/passwd and /etc/group from the user/group tables. */
function syncEtcFiles(state: ShellState): void {
  state.fs["/etc"] = state.fs["/etc"] ?? { type: "dir" };
  const passwd = Object.entries(state.users)
    .sort((a, b) => a[1].uid - b[1].uid)
    .map(([name, u]) => {
      const home = name === "root" ? "/root" : `/home/${name}`;
      return `${name}:x:${u.uid}:${state.groups[u.primary] ?? 0}::${home}:${u.shell}`;
    })
    .join("\n");
  const group = Object.entries(state.groups)
    .sort((a, b) => a[1] - b[1])
    .map(([gname, gid]) => {
      const members = Object.entries(state.users)
        .filter(([, u]) => u.supplementary.includes(gname))
        .map(([uname]) => uname)
        .join(",");
      return `${gname}:x:${gid}:${members}`;
    })
    .join("\n");
  state.fs["/etc/passwd"] = { type: "file", content: passwd };
  state.fs["/etc/group"] = { type: "file", content: group };
}

export function createShell(): ShellState {
  const state: ShellState = {
    fs: {
      "/": { type: "dir" },
      "/etc": { type: "dir" },
      "/home": { type: "dir" },
      [HOME]: { type: "dir" },
    },
    cwd: HOME,
    users: {
      root: {
        uid: 0,
        primary: "root",
        supplementary: [],
        locked: false,
        shell: "/bin/bash",
      },
    },
    groups: { root: 0, sudo: 27 },
  };
  syncEtcFiles(state);
  return state;
}

function nextUid(state: ShellState): number {
  return Math.max(1000, ...Object.values(state.users).map((u) => u.uid)) + 1;
}

function nextGid(state: ShellState): number {
  return Math.max(1000, ...Object.values(state.groups)) + 1;
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
  const perms = (isDir ? "d" : "-") + modeToRwx(nodeMode(node));
  const links = isDir ? 2 : 1;
  const size = isDir ? 4096 : (node.content ?? "").length + 1;
  const owner = node.owner ?? "root";
  const group = node.group ?? "root";
  return `${perms} ${links} ${owner} ${group} ${String(size).padStart(4)} Jan 26 20:42 ${name}`;
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

  let rawToks = tokenize(input.trim());
  if (!rawToks) return fail("bash: syntax error: unclosed quote");
  if (!rawToks.length) return ok();
  // We run as root, so a leading `sudo` is accepted and ignored
  if (rawToks[0].text === "sudo" && !rawToks[0].quoted) {
    rawToks = rawToks.slice(1);
    if (!rawToks.length) return fail("usage: sudo command");
  }
  const cmd = rawToks[0].text;
  const rest = rawToks.slice(1);

  switch (cmd) {
    case "pwd":
      return ok(state.cwd);

    case "whoami":
      return ok("root");

    case "groupadd": {
      let force = false;
      let gid: number | null = null;
      let name: string | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && t.text.startsWith("-")) {
          const letters = t.text.slice(1);
          if (letters.includes("f")) force = true;
          if (letters.includes("g")) gid = Number(rest[++i]?.text ?? NaN);
        } else {
          name = t.text;
        }
      }
      if (!name) return fail("groupadd: missing operand");
      if (state.groups[name] !== undefined) {
        if (force) return ok();
        return fail(`groupadd: group '${name}' already exists`);
      }
      state.groups[name] = gid ?? nextGid(state);
      syncEtcFiles(state);
      return ok();
    }

    case "useradd": {
      let makeHome = false;
      let suppGroups: string[] = [];
      let primaryGroup: string | null = null;
      let shell = "/bin/sh";
      let name: string | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && t.text.startsWith("-")) {
          const letters = t.text.slice(1);
          if (letters.includes("m")) makeHome = true;
          if (letters.includes("G"))
            suppGroups = (rest[++i]?.text ?? "").split(",").filter(Boolean);
          else if (letters.includes("g"))
            primaryGroup = rest[++i]?.text ?? null;
          if (letters.includes("s")) shell = rest[++i]?.text ?? shell;
          if (letters.includes("c")) i++; // comment consumed
        } else {
          name = t.text;
        }
      }
      if (!name) return fail("useradd: missing operand");
      if (state.users[name])
        return fail(`useradd: user '${name}' already exists`);
      for (const g of suppGroups) {
        if (state.groups[g] === undefined)
          return fail(`useradd: group '${g}' does not exist`);
      }
      if (primaryGroup && state.groups[primaryGroup] === undefined)
        return fail(`useradd: group '${primaryGroup}' does not exist`);
      const uid = nextUid(state);
      let primary = primaryGroup;
      if (!primary) {
        // user-private group, same name as the user
        primary = name;
        if (state.groups[name] === undefined)
          state.groups[name] = nextGid(state);
      }
      state.users[name] = {
        uid,
        primary,
        supplementary: suppGroups,
        locked: false,
        shell,
      };
      if (makeHome) state.fs[`/home/${name}`] = { type: "dir" };
      syncEtcFiles(state);
      return ok();
    }

    case "usermod": {
      let primaryGroup: string | null = null;
      let gList: string[] | null = null;
      let append = false;
      let lock: boolean | null = null;
      let name: string | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && t.text.startsWith("-")) {
          const letters = t.text.slice(1);
          if (letters.includes("a")) append = true;
          if (letters.includes("G"))
            gList = (rest[++i]?.text ?? "").split(",").filter(Boolean);
          else if (letters.includes("g"))
            primaryGroup = rest[++i]?.text ?? null;
          if (letters.includes("L")) lock = true;
          if (letters.includes("U")) lock = false;
        } else {
          name = t.text;
        }
      }
      if (!name) return fail("usermod: missing operand");
      const user = state.users[name];
      if (!user) return fail(`usermod: user '${name}' does not exist`);
      if (primaryGroup !== null) {
        if (state.groups[primaryGroup] === undefined)
          return fail(`usermod: group '${primaryGroup}' does not exist`);
        user.primary = primaryGroup;
      }
      if (gList !== null) {
        for (const g of gList) {
          if (state.groups[g] === undefined)
            return fail(`usermod: group '${g}' does not exist`);
        }
        // -aG appends; -G without -a REPLACES the supplementary list (the classic trap)
        user.supplementary = append
          ? [...new Set([...user.supplementary, ...gList])]
          : [...gList];
      }
      if (lock !== null) user.locked = lock;
      syncEtcFiles(state);
      return ok();
    }

    case "userdel": {
      const flags = rest.filter((t) => !t.quoted && t.text.startsWith("-"));
      const removeHome = flags.some((f) => /^-\w*r\w*$/.test(f.text));
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const name = args[0]?.text;
      if (!name) return fail("userdel: missing operand");
      if (!state.users[name])
        return fail(`userdel: user '${name}' does not exist`);
      const wasPrimary = state.users[name].primary;
      delete state.users[name];
      // real userdel also removes the user-private group when unused
      if (
        wasPrimary === name &&
        !Object.values(state.users).some((u) => u.primary === name)
      ) {
        delete state.groups[name];
      }
      if (removeHome) {
        const home = `/home/${name}`;
        for (const p of Object.keys(state.fs)) {
          if (p === home || p.startsWith(home + "/")) delete state.fs[p];
        }
      }
      syncEtcFiles(state);
      return ok();
    }

    case "id": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const name = args[0]?.text ?? "root";
      const user = state.users[name];
      if (!user) return fail(`id: '${name}': no such user`);
      const gid = state.groups[user.primary] ?? 0;
      const parts = [`${gid}(${user.primary})`];
      for (const g of user.supplementary)
        parts.push(`${state.groups[g]}(${g})`);
      return ok(
        `uid=${user.uid}(${name}) gid=${gid}(${user.primary}) groups=${parts.join(",")}`,
      );
    }

    case "groups": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const name = args[0]?.text ?? "root";
      const user = state.users[name];
      if (!user) return fail(`groups: '${name}': no such user`);
      return ok(`${name} : ${[user.primary, ...user.supplementary].join(" ")}`);
    }

    case "chmod": {
      const flagToks = rest.filter(
        (t) =>
          !t.quoted && t.text.startsWith("-") && /^-[A-Za-z]+$/.test(t.text),
      );
      const recursive = flagToks.some((f) => /R/.test(f.text));
      const args = rest
        .filter((t) => !flagToks.includes(t))
        .flatMap((t) => expandGlob(state, t));
      if (args.length < 2) return fail("chmod: missing operand");
      const spec = args[0];
      const octal = /^[0-7]{3}$/.test(spec);
      if (!octal && !/^([ugoa]*[+\-=][rwx]*,?)+$/.test(spec))
        return fail(`chmod: invalid mode: '${spec}'`);
      for (const raw of args.slice(1)) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `chmod: cannot access '${raw}': No such file or directory`,
          );
        const targets = [abs];
        if (recursive && node.type === "dir") {
          targets.push(
            ...Object.keys(state.fs).filter((p) => p.startsWith(abs + "/")),
          );
        }
        for (const p of targets) {
          const n = state.fs[p];
          const next = octal ? spec : applySymbolic(nodeMode(n), spec);
          if (!next) return fail(`chmod: invalid mode: '${spec}'`);
          n.mode = next;
        }
      }
      return ok();
    }

    case "chown": {
      const flagToks = rest.filter(
        (t) =>
          !t.quoted && t.text.startsWith("-") && /^-[A-Za-z]+$/.test(t.text),
      );
      const recursive = flagToks.some((f) => /R/.test(f.text));
      const args = rest
        .filter((t) => !flagToks.includes(t))
        .flatMap((t) => expandGlob(state, t));
      if (args.length < 2) return fail("chown: missing operand");
      const [ownerSpec, ...paths] = args;
      const [ownerName, groupName] = ownerSpec.split(":");
      if (ownerName && !state.users[ownerName])
        return fail(`chown: invalid user: '${ownerSpec}'`);
      if (groupName && state.groups[groupName] === undefined)
        return fail(`chown: invalid group: '${ownerSpec}'`);
      for (const raw of paths) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `chown: cannot access '${raw}': No such file or directory`,
          );
        const targets = [abs];
        if (recursive && node.type === "dir") {
          targets.push(
            ...Object.keys(state.fs).filter((p) => p.startsWith(abs + "/")),
          );
        }
        for (const p of targets) {
          if (ownerName) state.fs[p].owner = ownerName;
          if (groupName) state.fs[p].group = groupName;
        }
      }
      return ok();
    }

    case "chgrp": {
      const flagToks = rest.filter(
        (t) =>
          !t.quoted && t.text.startsWith("-") && /^-[A-Za-z]+$/.test(t.text),
      );
      const recursive = flagToks.some((f) => /R/.test(f.text));
      const args = rest
        .filter((t) => !flagToks.includes(t))
        .flatMap((t) => expandGlob(state, t));
      if (args.length < 2) return fail("chgrp: missing operand");
      const [groupName, ...paths] = args;
      if (state.groups[groupName] === undefined)
        return fail(`chgrp: invalid group: '${groupName}'`);
      for (const raw of paths) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `chgrp: cannot access '${raw}': No such file or directory`,
          );
        const targets = [abs];
        if (recursive && node.type === "dir") {
          targets.push(
            ...Object.keys(state.fs).filter((p) => p.startsWith(abs + "/")),
          );
        }
        for (const p of targets) state.fs[p].group = groupName;
      }
      return ok();
    }

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
  if (check.pathModes) {
    for (const pm of check.pathModes) {
      const abs = resolvePath(HOME, pm.path);
      const node = ctx.result.state.fs[abs];
      if (!node) return { pass: false, reason: `${pm.path} পাওয়া যাচ্ছে না` };
      if (pm.mode && nodeMode(node) !== pm.mode)
        return {
          pass: false,
          reason: `${pm.path}-এর permission ${pm.mode} হওয়ার কথা (এখন ${nodeMode(node)})`,
        };
      if (pm.owner && (node.owner ?? "root") !== pm.owner)
        return {
          pass: false,
          reason: `${pm.path}-এর owner ${pm.owner} হওয়ার কথা`,
        };
      if (pm.group && (node.group ?? "root") !== pm.group)
        return {
          pass: false,
          reason: `${pm.path}-এর group ${pm.group} হওয়ার কথা`,
        };
    }
  }
  if (check.groupsExist) {
    for (const g of check.groupsExist) {
      if (ctx.result.state.groups[g] === undefined)
        return { pass: false, reason: `${g} group-টা এখনো তৈরি হয়নি` };
    }
  }
  if (check.usersState) {
    for (const expect of check.usersState) {
      const user = ctx.result.state.users[expect.name];
      if (expect.exists === false) {
        if (user)
          return { pass: false, reason: `${expect.name} এখনো মুছে যায়নি` };
        continue;
      }
      if (!user)
        return {
          pass: false,
          reason: `${expect.name} user-টা এখনো তৈরি হয়নি`,
        };
      if (expect.primary && user.primary !== expect.primary)
        return {
          pass: false,
          reason: `${expect.name}-এর primary group ${expect.primary} হওয়ার কথা`,
        };
      for (const g of expect.inGroups ?? []) {
        if (user.primary !== g && !user.supplementary.includes(g))
          return {
            pass: false,
            reason: `${expect.name} এখনো ${g} group-এ নেই`,
          };
      }
      for (const g of expect.notInGroups ?? []) {
        if (user.primary === g || user.supplementary.includes(g))
          return {
            pass: false,
            reason: `${expect.name}-এর ${g} group-এ থাকার কথা না`,
          };
      }
      if (expect.locked !== undefined && user.locked !== expect.locked)
        return {
          pass: false,
          reason: expect.locked
            ? `${expect.name} এখনো lock হয়নি`
            : `${expect.name} এখনো unlock হয়নি`,
        };
      if (expect.hasHome !== undefined) {
        const has = ctx.result.state.fs[`/home/${expect.name}`]?.type === "dir";
        if (has !== expect.hasHome)
          return {
            pass: false,
            reason: expect.hasHome
              ? `/home/${expect.name} তৈরি হয়নি — home-সহ বানাতে হবে`
              : `/home/${expect.name} থাকার কথা না`,
          };
      }
    }
  }
  return { pass: true };
}
