"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { FullQuizSection } from "@/components/quiz/FullQuizSection";
import type { Track } from "@/lib/api/types";

export function FullQuizScreen({
  lessonId,
  track,
}: {
  lessonId: string;
  track: Track;
}) {
  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/quiz/${track}`}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Full Quiz Review</h1>
          <p className="text-xs text-slate-500">{lessonId}</p>
        </div>
      </div>

      <FullQuizSection lessonId={lessonId} track={track} />
    </AppShell>
  );
}
