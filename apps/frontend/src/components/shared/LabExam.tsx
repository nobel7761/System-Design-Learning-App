"use client";

import { useMemo, useRef, useState } from "react";
import { Badge, Progress } from "@/components/shared/shadcn";
import {
  createShell,
  displayCwd,
  evaluateCheck,
  execute,
  resolvePath,
  HOME,
  type ShellState,
} from "@/lib/lab-exam/engine";
import type { LabExamSpec, LabExamTarget } from "@/lib/lab-exam/types";

/* ── Target-tree visualization ─────────────────────────────────────────── */

interface TreeNode {
  name: string;
  abs: string;
  type: "dir" | "file";
  content?: string;
  children: TreeNode[];
}

function buildTree(targets: LabExamTarget[]): TreeNode | null {
  const nodes = new Map<string, TreeNode>();
  const ensure = (
    abs: string,
    type: "dir" | "file",
    content?: string,
  ): TreeNode => {
    let node = nodes.get(abs);
    if (!node) {
      node = {
        name: abs.slice(abs.lastIndexOf("/") + 1),
        abs,
        type,
        content,
        children: [],
      };
      nodes.set(abs, node);
    }
    if (content !== undefined) node.content = content;
    return node;
  };
  let root: TreeNode | null = null;
  for (const t of targets) {
    const abs = resolvePath(HOME, t.path);
    ensure(abs, t.type, t.content);
    // link ancestors up to (excluding) HOME
    let cur = abs;
    while (cur !== HOME && cur !== "/") {
      const parent = cur.slice(0, cur.lastIndexOf("/")) || "/";
      if (parent === HOME || parent === "/") {
        root = nodes.get(cur) ?? root;
        break;
      }
      const parentNode = ensure(parent, "dir");
      const child = nodes.get(cur)!;
      if (!parentNode.children.some((c) => c.abs === cur))
        parentNode.children.push(child);
      cur = parent;
    }
  }
  for (const n of nodes.values())
    n.children.sort((a, b) => a.name.localeCompare(b.name));
  return root;
}

function TreeNodeView({ node, shell }: { node: TreeNode; shell: ShellState }) {
  const fsNode = shell.fs[node.abs];
  const created = !!fsNode && fsNode.type === node.type;
  const contentOk =
    node.content === undefined || (fsNode?.content ?? "") === node.content;
  const done = created && contentOk;
  const isCwd = shell.cwd === node.abs;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex flex-col items-center rounded-full border-2 px-3 py-1 text-xs font-semibold transition-all duration-500 ${
          done
            ? "border-emerald-400 bg-emerald-100 text-emerald-700"
            : created
              ? "border-amber-400 bg-amber-50 text-amber-700"
              : "border-dashed border-slate-300 bg-slate-50 text-slate-400"
        } ${isCwd ? "ring-2 ring-indigo-400 ring-offset-2" : ""}`}
        title={
          node.abs + (node.content !== undefined ? ` — "${node.content}"` : "")
        }
      >
        <span>
          {node.type === "dir" ? "📁" : "📄"} {node.name}
        </span>
        {node.content !== undefined && done && (
          <span className="text-[9px] font-normal text-emerald-600">
            “{node.content}”
          </span>
        )}
      </div>
      {isCwd && (
        <span className="mt-0.5 text-[9px] font-bold text-indigo-500">
          তুমি এখানে
        </span>
      )}
      {node.children.length > 0 && (
        <>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-start gap-3 border-t border-slate-300 pt-3">
            {node.children.map((c) => (
              <TreeNodeView key={c.abs} node={c} shell={shell} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Terminal ──────────────────────────────────────────────────────────── */

interface HistoryEntry {
  prompt: string;
  cmd: string;
  output: string;
  error: boolean;
  verdict?: "pass" | "fail";
  reason?: string;
}

/* ── Main component ────────────────────────────────────────────────────── */

export default function LabExam({ spec }: { spec: LabExamSpec }) {
  const [shell, setShell] = useState<ShellState>(createShell);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [taskIdx, setTaskIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [results, setResults] = useState<boolean[]>([]); // firstTry per solved task
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const termRef = useRef<HTMLDivElement>(null);

  const tree = useMemo(() => buildTree(spec.targets), [spec.targets]);
  const totalPoints = spec.tasks.reduce((a, t) => a + t.points, 0);
  const score = spec.tasks.reduce(
    (a, t, i) => a + (results[i] ? t.points : 0),
    0,
  );
  const finished = taskIdx >= spec.tasks.length;
  const scorePercent = Math.round((score / totalPoints) * 100);
  const passed = scorePercent >= spec.passPercent;
  const task = spec.tasks[taskIdx];

  const submit = () => {
    if (finished || !input.trim()) return;
    const prompt = `root@lab:${displayCwd(shell.cwd)}#`;
    const result = execute(shell, input);
    const check = evaluateCheck(task.check, {
      input,
      prevState: shell,
      result,
    });
    // Only a passing command advances the world — failed attempts show their
    // output but roll back, so every task starts from a known state.
    if (check.pass) setShell(result.state);
    setHistory((h) => [
      ...h,
      {
        prompt,
        cmd: input,
        output: result.output,
        error: result.error,
        verdict: check.pass ? "pass" : "fail",
        reason: check.reason,
      },
    ]);
    if (check.pass) {
      setResults((r) => [...r, attempts === 0]);
      setTaskIdx((i) => i + 1);
      setAttempts(0);
    } else {
      setAttempts((a) => a + 1);
    }
    setCmdHistory((h) => [...h, input]);
    setHistIdx(null);
    setInput("");
    setTimeout(() => {
      termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
      inputRef.current?.focus();
    }, 0);
  };

  const reset = () => {
    setShell(createShell());
    setHistory([]);
    setTaskIdx(0);
    setAttempts(0);
    setResults([]);
    setCmdHistory([]);
    setHistIdx(null);
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

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-800">🖥️ {spec.title}</h2>
        <Badge variant="secondary">
          {Math.min(taskIdx + 1, spec.tasks.length)}/{spec.tasks.length}
        </Badge>
        <span className="ml-auto text-sm font-semibold text-slate-500">
          স্কোর: {score}/{totalPoints}
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-500">{spec.intro}</p>
      <Progress value={(taskIdx / spec.tasks.length) * 100} className="mb-5" />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: task + terminal */}
        <div className="flex flex-col gap-3">
          {!finished ? (
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
              {task.section && (
                <div className="mb-3 border-b border-indigo-200 pb-2">
                  <p className="text-sm font-bold text-slate-800">
                    {task.section.title}
                  </p>
                  {task.section.note && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {task.section.note}
                    </p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-500">
                প্রশ্ন {taskIdx + 1} · {task.points} নম্বর
                {attempts > 0 && (
                  <span className="text-amber-600">
                    · চেষ্টা {attempts + 1} (প্রথম চেষ্টায় না হলে নম্বর নেই)
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-800">
                {task.prompt}
              </p>
              {attempts >= 2 && task.hint && (
                <p className="mt-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs text-amber-800">
                  💡 {task.hint}
                </p>
              )}
            </div>
          ) : (
            <div
              className={`rounded-xl border-2 p-5 text-center ${
                passed
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-rose-300 bg-rose-50"
              }`}
            >
              <div className="text-3xl">{passed ? "🎉" : "😤"}</div>
              <p
                className={`mt-1 text-lg font-bold ${passed ? "text-emerald-700" : "text-rose-700"}`}
              >
                {passed ? "PASSED!" : "এবার হয়নি"} — {scorePercent}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {passed
                  ? "৯৫%-এর দেয়াল টপকে গেছো। পরের লেসন তোমার। 🐧"
                  : `pass mark ${spec.passPercent}%। নতুন container, নতুন শুরু — এটাই অভ্যাস।`}
              </p>
              <button
                onClick={reset}
                className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                ↻ আবার দাও
              </button>
            </div>
          )}

          {/* Terminal */}
          <div className="overflow-hidden rounded-xl bg-slate-950 shadow-lg">
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[10px] text-slate-400">
                linux-lab — exam terminal
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
                    <span className="text-slate-100">{h.cmd}</span>{" "}
                    {h.verdict === "pass" ? (
                      <span className="font-bold text-emerald-400">✓</span>
                    ) : (
                      <span className="font-bold text-rose-400">✗</span>
                    )}
                  </div>
                  {h.output && (
                    <pre
                      className={`whitespace-pre-wrap ${h.error ? "text-rose-300" : "text-slate-300"}`}
                    >
                      {h.output}
                    </pre>
                  )}
                  {h.verdict === "fail" && h.reason && !h.error && (
                    <div className="text-[10px] text-amber-400">
                      → {h.reason}
                    </div>
                  )}
                </div>
              ))}
              {!finished && (
                <div className="flex items-center">
                  <span className="shrink-0 text-emerald-400">
                    root@lab:{displayCwd(shell.cwd)}#
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
              )}
            </div>
          </div>
        </div>

        {/* Right: target tree */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs font-bold text-slate-500">
            🎯 টার্গেট কাঠামো — সঠিক কমান্ডে নোডগুলো সবুজ হবে
          </p>
          <div className="overflow-x-auto pb-2">
            {tree ? (
              <TreeNodeView node={tree} shell={shell} />
            ) : (
              <p className="text-xs text-slate-400">কোনো টার্গেট কাঠামো নেই</p>
            )}
          </div>
          <p className="mt-3 text-[10px] text-slate-400">
            📁 dashed = এখনো হয়নি · সবুজ = তৈরি ✓ · নীল রিং = তুমি এখন যেখানে
            (cd করলে নড়বে)
          </p>
        </div>
      </div>
    </section>
  );
}
