"use client";

import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/shared/shadcn";
import {
  buildNodeMap,
  resolvePath,
  run,
  type FsNodeMap,
} from "@/lib/fs-explorer/engine";
import type { FsExplorerNode, FsExplorerSpec } from "@/lib/fs-explorer/types";

/* ── Tree structure built from the flat node list ─────────────────────── */

interface TreeNode extends FsExplorerNode {
  children: TreeNode[];
}

function buildTree(nodes: FsExplorerNode[]): TreeNode {
  const byPath = new Map<string, TreeNode>();
  for (const n of nodes) byPath.set(n.path, { ...n, children: [] });
  if (!byPath.has("/"))
    byPath.set("/", {
      path: "/",
      type: "dir",
      desc: "root — সব কিছুর শুরু",
      children: [],
    });
  const root = byPath.get("/")!;
  for (const n of byPath.values()) {
    if (n.path === "/") continue;
    const parentPath = n.path.slice(0, n.path.lastIndexOf("/")) || "/";
    const parent = byPath.get(parentPath);
    if (parent) parent.children.push(n);
  }
  const sortRec = (n: TreeNode) => {
    n.children.sort((a, b) => a.path.localeCompare(b.path));
    n.children.forEach(sortRec);
  };
  sortRec(root);
  return root;
}

function TreeRow({
  node,
  depth,
  cwd,
  visited,
  onNavigate,
}: {
  node: TreeNode;
  depth: number;
  cwd: string;
  visited: Set<string>;
  onNavigate: (node: TreeNode) => void;
}) {
  const isCurrent = cwd === node.path;
  const isVisited = visited.has(node.path);
  const state = isCurrent ? "current" : isVisited ? "visited" : "default";

  return (
    <div>
      <button
        type="button"
        onClick={() => onNavigate(node)}
        style={{ paddingLeft: `${depth * 1.1 + 0.5}rem` }}
        className={`flex w-full items-baseline gap-2 rounded-md py-1 pr-2 text-left transition-colors ${
          state === "current"
            ? "bg-indigo-100 ring-1 ring-inset ring-indigo-400"
            : state === "visited"
              ? "bg-emerald-50"
              : "hover:bg-slate-50"
        }`}
      >
        <span
          className={`shrink-0 font-mono text-xs font-semibold ${
            state === "current"
              ? "text-indigo-700"
              : state === "visited"
                ? "text-emerald-700"
                : "text-slate-600"
          }`}
        >
          {node.type === "dir" ? "📁" : "📄"}{" "}
          {node.path === "/" ? "/" : node.path.split("/").pop()}
        </span>
        <span className="truncate text-[11px] text-slate-400">{node.desc}</span>
        {isCurrent && (
          <span className="ml-auto shrink-0 text-[9px] font-bold text-indigo-500">
            তুমি এখানে
          </span>
        )}
      </button>
      {node.children.map((c) => (
        <TreeRow
          key={c.path}
          node={c}
          depth={depth + 1}
          cwd={cwd}
          visited={visited}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

/* ── Terminal ──────────────────────────────────────────────────────────── */

interface HistoryEntry {
  prompt: string;
  cmd: string;
  output: string;
  error: boolean;
}

export default function FsTreeExplorer({ spec }: { spec: FsExplorerSpec }) {
  const nodeMap: FsNodeMap = useMemo(
    () => buildNodeMap(spec.nodes),
    [spec.nodes],
  );
  const tree = useMemo(() => buildTree(spec.nodes), [spec.nodes]);
  const initialCwd = nodeMap["/root"] ? "/root" : "/";

  const [cwd, setCwd] = useState(initialCwd);
  const [visited, setVisited] = useState<Set<string>>(new Set([initialCwd]));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const termRef = useRef<HTMLDivElement>(null);

  const runCommand = (raw: string) => {
    if (!raw.trim()) return;
    const prompt = `you@linux:${cwd}$`;
    const result = run(nodeMap, cwd, raw);
    setCwd(result.cwd);
    if (result.touched.length)
      setVisited((v) => new Set([...v, ...result.touched]));
    setHistory((h) => [
      ...h,
      { prompt, cmd: raw, output: result.output, error: result.error },
    ]);
    setCmdHistory((h) => [...h, raw]);
    setHistIdx(null);
    setTimeout(() => {
      termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
      inputRef.current?.focus();
    }, 0);
  };

  const submit = () => {
    if (!input.trim()) return;
    runCommand(input);
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!cmdHistory.length) return;
      const next =
        histIdx === null ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setInput(cmdHistory[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === null) return;
      const next = histIdx + 1;
      if (next >= cmdHistory.length) {
        setHistIdx(null);
        setInput("");
      } else {
        setHistIdx(next);
        setInput(cmdHistory[next]);
      }
    }
  };

  const onNavigate = (node: TreeNode) => {
    runCommand(node.type === "dir" ? `cd ${node.path}` : `cat ${node.path}`);
  };

  const current = nodeMap[cwd];
  const visitedCount = visited.size;
  const totalCount = spec.nodes.length;

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-800">🗺️ {spec.title}</h2>
        <Badge variant="secondary">
          দেখা হয়েছে {visitedCount}/{totalCount}
        </Badge>
      </div>
      <p className="mb-4 text-sm text-slate-500">{spec.intro}</p>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: terminal + current-node detail */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
            <p className="font-mono text-xs font-bold text-indigo-500">{cwd}</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-800">
              {current?.detail ?? current?.desc ?? ""}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl bg-slate-950 shadow-lg">
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[10px] text-slate-400">
                linux-explorer — pwd, cd, ls, cat, find, grep
              </span>
            </div>
            <div
              ref={termRef}
              className="max-h-72 min-h-40 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
            >
              {history.map((h, i) => (
                <div key={i} className="mb-1.5">
                  <div>
                    <span className="text-emerald-400">{h.prompt}</span>{" "}
                    <span className="text-slate-100">{h.cmd}</span>
                  </div>
                  {h.output && (
                    <pre
                      className={`whitespace-pre-wrap ${h.error ? "text-rose-300" : "text-slate-300"}`}
                    >
                      {h.output}
                    </pre>
                  )}
                </div>
              ))}
              <div className="flex items-center">
                <span className="shrink-0 text-emerald-400">
                  you@linux:{cwd}$
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setHistIdx(null);
                  }}
                  onKeyDown={onKeyDown}
                  className="ml-2 w-full bg-transparent font-mono text-xs text-slate-100 outline-none placeholder:text-slate-600"
                  placeholder="কমান্ড লিখে Enter…"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: full FHS tree */}
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-2 px-2 text-xs font-bold text-slate-500">
            🌳 পুরো Linux File System — ক্লিক করলেও নড়বে
          </p>
          <div className="max-h-[32rem] overflow-y-auto">
            <TreeRow
              node={tree}
              depth={0}
              cwd={cwd}
              visited={visited}
              onNavigate={onNavigate}
            />
          </div>
          <p className="mt-3 px-2 text-[10px] text-slate-400">
            ধূসর = এখনো দেখা হয়নি · সবুজ = দেখেছো (cd/ls/cat) · নীল রিং = তুমি
            এখন যেখানে
          </p>
        </div>
      </div>
    </section>
  );
}
