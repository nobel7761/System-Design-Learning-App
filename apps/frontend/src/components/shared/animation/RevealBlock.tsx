"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { RevealSpec } from "./types";

/**
 * ```reveal block: shows code + a "predict first" prompt; the answer stays
 * hidden until the reader commits by clicking. Powers the simulation pillar.
 */
export function RevealBlock({ raw }: { raw: string }) {
  const [open, setOpen] = useState(false);

  let spec: RevealSpec;
  try {
    spec = JSON.parse(raw) as RevealSpec;
    if (!spec.code || spec.answer === undefined) throw new Error("bad spec");
  } catch {
    return (
      <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
        ⚠️ Reveal spec parse হয়নি — lesson author-এর দেখা দরকার।
      </div>
    );
  }

  return (
    <div className="my-5 overflow-hidden rounded-2xl border-2 border-emerald-100 bg-emerald-50/40">
      <div className="border-b border-emerald-100 bg-white/70 px-4 py-2.5">
        <p className="text-sm font-semibold text-emerald-800">
          🧪 নিজে চেষ্টা করো —{" "}
          {spec.prompt ?? "আগে নিজে predict করো, তারপর উত্তর মেলাও"}
        </p>
      </div>
      <pre className="overflow-x-auto bg-slate-900 p-4 text-[13px] leading-6 text-slate-100">
        <code className="font-mono">{spec.code}</code>
      </pre>
      <div className="px-4 py-3">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
          >
            ✅ উত্তর দেখো
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Output
              </p>
              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs leading-5 text-emerald-300">
                {spec.answer}
              </pre>
              {spec.explanation && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  💡 {spec.explanation}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
