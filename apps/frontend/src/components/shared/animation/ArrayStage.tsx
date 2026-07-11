"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ArraySpec } from "./types";
import { StepShell } from "./StepShell";

/**
 * Array cells with named pointers that slide between indexes.
 * Array state carries forward: a step without `array` keeps the previous one.
 */
export function ArrayStage({ spec }: { spec: ArraySpec }) {
  // Resolve the effective array state at every step (carry-forward)
  const states: (string | number)[][] = [];
  let current = spec.array;
  for (const s of spec.steps) {
    if (s.array) current = s.array;
    states.push(current);
  }

  return (
    <StepShell
      title={spec.title}
      totalSteps={spec.steps.length}
      notes={spec.steps.map((s) => s.note)}
    >
      {(step) => {
        const arr = states[step];
        const { pointers = {}, highlight = [] } = spec.steps[step];
        return (
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex min-w-full flex-col items-center">
              {/* Index row */}
              <div className="flex gap-1.5">
                {arr.map((_, i) => (
                  <div
                    key={i}
                    className="w-14 text-center font-mono text-[10px] text-slate-400"
                  >
                    {i}
                  </div>
                ))}
              </div>
              {/* Cell row */}
              <div className="mt-1 flex gap-1.5">
                {arr.map((v, i) => (
                  <motion.div
                    key={i}
                    layout
                    animate={{
                      scale: highlight.includes(i) ? 1.08 : 1,
                    }}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 font-mono text-sm font-bold transition-colors ${
                      highlight.includes(i)
                        ? "border-amber-400 bg-amber-100 text-amber-900 shadow-md"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={String(v)}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {String(v)}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
              {/* Pointer row — chips fly between columns via layoutId */}
              <div className="mt-1.5 flex gap-1.5">
                {arr.map((_, i) => (
                  <div
                    key={i}
                    className="flex w-14 flex-col items-center gap-0.5"
                  >
                    {Object.entries(pointers)
                      .filter(([, idx]) => idx === i)
                      .map(([name]) => (
                        <motion.div
                          key={name}
                          layoutId={`ptr-${name}`}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-indigo-500">▲</span>
                          <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                            {name}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }}
    </StepShell>
  );
}
