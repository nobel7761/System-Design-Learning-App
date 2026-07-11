"use client";

import { useCallback, useEffect, useState } from "react";

/** Step-through state machine with autoplay, shared by all animation stages */
export function useStepper(total: number, intervalMs = 1800) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= total - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(
      () => setStep((s) => Math.min(s + 1, total - 1)),
      intervalMs,
    );
    return () => clearTimeout(t);
  }, [playing, step, total, intervalMs]);

  const next = useCallback(
    () => setStep((s) => Math.min(s + 1, total - 1)),
    [total],
  );
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);
  const reset = useCallback(() => {
    setStep(0);
    setPlaying(false);
  }, []);
  const toggle = useCallback(() => {
    // Pressing play at the end restarts from the beginning
    if (!playing && step >= total - 1) setStep(0);
    setPlaying((p) => !p);
  }, [playing, step, total]);
  const goTo = useCallback(
    (s: number) => setStep(Math.max(0, Math.min(s, total - 1))),
    [total],
  );

  return { step, playing, next, prev, reset, toggle, goTo };
}
