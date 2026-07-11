"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { TraceSpec } from "./types";
import { StepShell } from "./StepShell";

/**
 * Line-by-line code trace: pointer slides down the code, the variable
 * table updates, and print output accumulates in a console panel.
 */
export function TraceStage({ spec }: { spec: TraceSpec }) {
  return (
    <StepShell
      title={spec.title}
      totalSteps={spec.steps.length}
      notes={spec.steps.map((s) => s.note)}
    >
      {(step) => {
        const active = spec.steps[step];
        // Variable table + console carry state forward step by step
        const vars: Record<string, string> = {};
        const outputs: string[] = [];
        for (let i = 0; i <= step; i++) {
          Object.assign(vars, spec.steps[i].vars ?? {});
          if (spec.steps[i].out !== undefined) {
            outputs.push(spec.steps[i].out as string);
          }
        }
        return (
          <div className="grid gap-3 md:grid-cols-5">
            {/* Code panel */}
            <div className="md:col-span-3">
              <pre className="relative overflow-x-auto rounded-xl bg-slate-900 p-3 text-[13px] leading-6 text-slate-100">
                {spec.code.map((line, i) => (
                  <div key={i} className="relative flex">
                    {i + 1 === active.line && (
                      <motion.div
                        layoutId="trace-hl"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 32,
                        }}
                        className="absolute inset-0 rounded bg-amber-400/20 ring-1 ring-amber-400/60"
                      />
                    )}
                    <span className="relative z-10 w-7 shrink-0 select-none text-right pr-2 text-slate-500">
                      {i + 1}
                    </span>
                    <code className="relative z-10 whitespace-pre font-mono">
                      {line || " "}
                    </code>
                  </div>
                ))}
              </pre>
            </div>
            {/* State panel */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Variables
                </p>
                {Object.keys(vars).length === 0 ? (
                  <p className="text-xs text-slate-400">এখনো কিছু নেই</p>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(vars).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between gap-2 font-mono text-xs"
                      >
                        <span className="font-bold text-indigo-700">{k}</span>
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={v}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            className="rounded bg-slate-100 px-2 py-0.5 text-slate-800"
                          >
                            {v}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-slate-900 p-2.5">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Output
                </p>
                <div className="min-h-[2rem] font-mono text-xs leading-5 text-emerald-300">
                  {outputs.length === 0 ? (
                    <span className="text-slate-600">—</span>
                  ) : (
                    outputs.map((o, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {o}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </StepShell>
  );
}
