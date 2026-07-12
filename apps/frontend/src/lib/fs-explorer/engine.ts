/**
 * Read-only shell over a static, pre-seeded Linux FHS tree — powers the
 * filesystem hierarchy explorer. Unlike the lab-exam engine, nothing here
 * mutates: the tree already exists, commands only move `cwd` around or
 * reveal file content. Supports: pwd, cd, ls (-l/-a), cat, find (-name/-type),
 * grep (-r).
 */

import type { FsExplorerNode } from "./types";

export type FsNodeMap = Record<string, FsExplorerNode>;

export function buildNodeMap(nodes: FsExplorerNode[]): FsNodeMap {
  const map: FsNodeMap = {};
  for (const n of nodes) map[n.path] = n;
  if (!map["/"])
    map["/"] = { path: "/", type: "dir", desc: "root — সব কিছুর শুরু" };
  return map;
}

export function resolvePath(cwd: string, raw: string): string {
  let p = raw;
  if (p === "~") p = "/root";
  else if (p.startsWith("~/")) p = "/root" + p.slice(1);
  const abs = p.startsWith("/") ? p : cwd + "/" + p;
  const out: string[] = [];
  for (const seg of abs.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return "/" + out.join("/");
}

function baseName(path: string): string {
  return path === "/" ? "/" : path.slice(path.lastIndexOf("/") + 1);
}

function childrenOf(map: FsNodeMap, dir: string): string[] {
  const prefix = dir === "/" ? "/" : dir + "/";
  return Object.keys(map)
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
        if (i >= input.length) return null;
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

function lsLine(name: string, node: FsExplorerNode | undefined): string {
  const isDir = node?.type === "dir";
  const perms = isDir ? "drwxr-xr-x" : "-rw-r--r--";
  const size = isDir ? 4096 : (node?.content ?? "").length + 1;
  return `${perms}  root root ${String(size).padStart(5)} Jan 26 20:42 ${name}`;
}

export interface FsExplorerResult {
  cwd: string;
  output: string;
  error: boolean;
  /** Paths this command revealed/visited — caller marks these as "seen" */
  touched: string[];
}

export function run(
  map: FsNodeMap,
  cwd: string,
  input: string,
): FsExplorerResult {
  const fail = (output: string): FsExplorerResult => ({
    cwd,
    output,
    error: true,
    touched: [],
  });
  const ok = (
    output = "",
    nextCwd = cwd,
    touched: string[] = [],
  ): FsExplorerResult => ({
    cwd: nextCwd,
    output,
    error: false,
    touched,
  });

  const toks = tokenize(input.trim());
  if (!toks) return fail("bash: syntax error: unclosed quote");
  if (!toks.length) return ok();
  const cmd = toks[0].text;
  const rest = toks.slice(1);

  switch (cmd) {
    case "pwd":
      return ok(cwd, cwd, [cwd]);

    case "cd": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const raw = args[0]?.text ?? "/root";
      const abs = resolvePath(cwd, raw);
      const node = map[abs];
      if (!node) return fail(`bash: cd: ${raw}: No such file or directory`);
      if (node.type !== "dir") return fail(`bash: cd: ${raw}: Not a directory`);
      return ok("", abs, [abs]);
    }

    case "ls": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const long = flags.includes("l");
      const all = flags.includes("a");
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const raw = args[0]?.text ?? ".";
      const abs = resolvePath(cwd, raw);
      const node = map[abs];
      if (!node)
        return fail(`ls: cannot access '${raw}': No such file or directory`);
      if (node.type === "file")
        return ok(long ? lsLine(baseName(abs), node) : baseName(abs), cwd, [
          abs,
        ]);
      const names = childrenOf(map, abs).map(baseName);
      const entries = all ? [".", "..", ...names] : names;
      if (!long) return ok(entries.join("  "), cwd, [abs]);
      const lines = [`total ${entries.length * 4}`];
      for (const name of entries) {
        const childPath =
          name === "." || name === ".."
            ? abs
            : abs === "/"
              ? "/" + name
              : abs + "/" + name;
        lines.push(lsLine(name, map[childPath] ?? node));
      }
      return ok(lines.join("\n"), cwd, [abs]);
    }

    case "cat": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return fail("cat: missing operand");
      const out: string[] = [];
      const touched: string[] = [];
      for (const a of args) {
        const abs = resolvePath(cwd, a.text);
        const node = map[abs];
        if (!node) return fail(`cat: ${a.text}: No such file or directory`);
        if (node.type === "dir") return fail(`cat: ${a.text}: Is a directory`);
        out.push(node.content ?? "");
        touched.push(abs);
      }
      return ok(out.join("\n"), cwd, touched);
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
              "find: Arguments to -type should contain only one letter",
            );
          typeFilter = v;
        } else if (!t.quoted && t.text.startsWith("-")) {
          return fail(`find: unknown predicate '${t.text}'`);
        } else if (startTok === null) {
          startTok = t.text;
        }
      }
      const raw = startTok ?? ".";
      const abs = resolvePath(cwd, raw);
      if (!map[abs]) return fail(`find: '${raw}': No such file or directory`);
      const re = namePat ? globToRegex(namePat) : null;
      const results: string[] = [];
      const touched: string[] = [];
      const all = Object.keys(map)
        .filter((p) => p === abs || p.startsWith(abs === "/" ? "/" : abs + "/"))
        .sort();
      for (const p of all) {
        const node = map[p];
        if (typeFilter === "f" && node.type !== "file") continue;
        if (typeFilter === "d" && node.type !== "dir") continue;
        if (re && !re.test(baseName(p))) continue;
        results.push(p);
        touched.push(p);
      }
      return ok(results.join("\n"), cwd, touched);
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
      const targets = args.slice(1);
      const files: string[] = [];
      for (const raw of targets) {
        const abs = resolvePath(cwd, raw.text);
        const node = map[abs];
        if (!node) return fail(`grep: ${raw.text}: No such file or directory`);
        if (node.type === "dir") {
          if (!recursive) return fail(`grep: ${raw.text}: Is a directory`);
          files.push(
            ...Object.keys(map)
              .filter(
                (p) =>
                  p.startsWith(abs === "/" ? "/" : abs + "/") &&
                  map[p].type === "file",
              )
              .sort(),
          );
        } else {
          files.push(abs);
        }
      }
      const prefix = recursive || files.length > 1;
      const out: string[] = [];
      const touched: string[] = [];
      for (const f of files) {
        for (const line of (map[f].content ?? "").split("\n")) {
          if (line.includes(pattern)) {
            out.push(prefix ? `${f}:${line}` : line);
            touched.push(f);
          }
        }
      }
      return ok(out.join("\n"), cwd, touched);
    }

    default:
      return fail(`bash: ${cmd}: command not found`);
  }
}
