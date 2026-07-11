"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useStepper } from "./useStepper";

/**
 * Common frame for every lesson animation: title bar, stage area,
 * step narration, and playback controls (reset / prev / play / next).
 */
export function StepShell({
  title,
  totalSteps,
  notes,
  children,
}: {
  title?: string;
  totalSteps: number;
  notes: string[];
  children: (step: number) => ReactNode;
}) {
  const { step, playing, next, prev, reset, toggle, goTo } =
    useStepper(totalSteps);

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600";

  return (
    <div className="my-5 overflow-hidden rounded-2xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100 bg-white/70 px-4 py-2.5">
        <p className="text-sm font-semibold text-indigo-800">
          🎞️ {title ?? "Animation"}
        </p>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
          ধাপ {step + 1}/{totalSteps}
        </span>
      </div>

      {/* Stage */}
      <div className="px-4 py-5">{children(step)}</div>

      {/* Narration */}
      <div className="min-h-[3.25rem] px-4 pb-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
          >
            💬 {notes[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t border-indigo-100 bg-white/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button onClick={reset} className={btn} title="শুরু থেকে">
            ⏮
          </button>
          <button
            onClick={prev}
            disabled={step === 0}
            className={btn}
            title="আগের ধাপ"
          >
            ◀
          </button>
          <button
            onClick={toggle}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={next}
            disabled={step === totalSteps - 1}
            className={btn}
            title="পরের ধাপ"
          >
            ▶
          </button>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-5 bg-indigo-600"
                  : i < step
                    ? "w-2 bg-indigo-300"
                    : "w-2 bg-slate-200"
              }`}
              title={`ধাপ ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
