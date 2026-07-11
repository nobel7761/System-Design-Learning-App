"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { VarsSpec } from "./types";
import { StepShell } from "./StepShell";

/**
 * The "variable = label, value = box" memory model.
 * Label chips fly between boxes (layoutId), so `b = a` sharing and
 * rebinding are visible as actual movement.
 */
export function VarsStage({ spec }: { spec: VarsSpec }) {
  return (
    <StepShell
      title={spec.title}
      totalSteps={spec.steps.length}
      notes={spec.steps.map((s) => s.note)}
    >
      {(step) => {
        const { boxes, labels } = spec.steps[step];
        return (
          <div className="flex flex-wrap items-start justify-center gap-6">
            <AnimatePresence mode="popLayout">
              {boxes.map((box) => {
                const attached = labels.filter((l) => l.box === box.id);
                return (
                  <motion.div
                    key={box.id}
                    layout
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    {/* Label chips (stickers) */}
                    <div className="flex min-h-[26px] items-end gap-1.5">
                      {attached.map((l) => (
                        <motion.span
                          key={l.name}
                          layoutId={`label-${l.name}`}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 28,
                          }}
                          className="rounded-md bg-indigo-600 px-2 py-0.5 font-mono text-xs font-bold text-white shadow"
                        >
                          {l.name}
                        </motion.span>
                      ))}
                    </div>
                    <span className="text-slate-400">↓</span>
                    {/* Value box */}
                    <div
                      className={`flex min-h-[3.5rem] min-w-[4.5rem] items-center justify-center rounded-xl border-2 px-4 font-mono text-sm font-bold ${
                        attached.length > 0
                          ? "border-slate-300 bg-white text-slate-800"
                          : "border-dashed border-slate-300 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {box.value}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        );
      }}
    </StepShell>
  );
}
