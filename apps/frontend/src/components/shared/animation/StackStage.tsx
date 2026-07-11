"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { StackSpec } from "./types";
import { StepShell } from "./StepShell";

/**
 * Call stack (or plain stack) — frames push in from above and pop out,
 * newest frame on top, highlighted.
 */
export function StackStage({ spec }: { spec: StackSpec }) {
  return (
    <StepShell
      title={spec.title}
      totalSteps={spec.steps.length}
      notes={spec.steps.map((s) => s.note)}
    >
      {(step) => {
        const { frames } = spec.steps[step];
        return (
          <div className="mx-auto flex w-full max-w-xs flex-col items-stretch">
            <div className="flex min-h-[10rem] flex-col-reverse justify-start gap-1.5 rounded-xl border-2 border-slate-300 border-t-transparent bg-slate-50/60 p-2">
              <AnimatePresence mode="popLayout">
                {frames.map((frame, i) => (
                  <motion.div
                    key={`${i}-${frame}`}
                    layout
                    initial={{ y: -24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -24, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className={`rounded-lg border-2 px-3 py-2 text-center font-mono text-xs font-semibold ${
                      i === frames.length - 1
                        ? "border-indigo-400 bg-indigo-100 text-indigo-900 shadow-md"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    {frame}
                  </motion.div>
                ))}
              </AnimatePresence>
              {frames.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-400">
                  stack খালি
                </p>
              )}
            </div>
            <p className="mt-1 text-center text-[10px] uppercase tracking-wide text-slate-400">
              call stack — উপরে সবচেয়ে নতুন frame
            </p>
          </div>
        );
      }}
    </StepShell>
  );
}
