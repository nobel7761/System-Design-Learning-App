"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/shared/Loader";
import { AppShell } from "@/components/layout/AppShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Progress,
} from "@/components/shared/shadcn";
import useAPI from "@/hooks/api";
import type {
  Milestone,
  SyllabusLesson,
  SyllabusWorld,
  Track,
} from "@/lib/api/types";

function LessonRow({ lesson }: { lesson: SyllabusLesson }) {
  const icon =
    lesson.status === "done" ? "✅" : lesson.status === "current" ? "▶" : "🔒";
  const typeBadge =
    lesson.type === "boss"
      ? "⚔️ Boss"
      : lesson.type === "dojo"
        ? "🥋 Dojo"
        : lesson.type === "mock"
          ? "🎤 Mock"
          : lesson.type === "workshop"
            ? "🔧 Workshop"
            : lesson.type === "deep-dive"
              ? "🔬 Deep Dive"
              : lesson.type === "project"
                ? "🚀 Project"
                : null;

  const row = (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2 ${
        lesson.status === "current"
          ? "bg-indigo-50 ring-1 ring-indigo-200"
          : lesson.status === "done"
            ? "bg-emerald-50/50"
            : "opacity-60"
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        <span>{icon}</span>
        <span
          className={
            lesson.status === "locked" ? "text-slate-400" : "text-slate-700"
          }
        >
          {lesson.order}. {lesson.title}
        </span>
        {typeBadge && (
          <Badge variant="outline" className="text-[10px]">
            {typeBadge}
          </Badge>
        )}
        {!lesson.contentReady && (
          <Badge variant="secondary" className="text-[10px]">
            আসছে…
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        {lesson.bestScore !== null && <span>সেরা: {lesson.bestScore}%</span>}
        <span>{lesson.estMinutes} min</span>
      </div>
    </div>
  );

  if (lesson.status !== "locked" && lesson.contentReady) {
    return (
      <Link
        href={`/lesson/${lesson.id}`}
        className="block transition hover:brightness-95"
      >
        {row}
      </Link>
    );
  }
  return row;
}

function MilestoneHeader({
  milestone,
  moduleCount,
}: {
  milestone: Milestone;
  moduleCount: number;
}) {
  return (
    <div className="mt-6 mb-3 flex items-center gap-3 first:mt-0">
      <span className="rounded-lg border border-violet-300 bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
        🏁 Milestone {milestone.order}
      </span>
      <span className="text-sm font-bold text-slate-800">
        {milestone.title}
      </span>
      <span className="text-xs text-slate-400">{moduleCount} Modules</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function WorldSection({ world }: { world: SyllabusWorld }) {
  return (
    <AccordionItem value={world.id} className="rounded-xl border bg-white px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex w-full items-center justify-between pr-2">
          <div className="text-left">
            {world.moduleNo != null && (
              <span className="mb-1 inline-block rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-600">
                Module {world.moduleNo}
              </span>
            )}
            <p className="font-semibold text-slate-800">{world.title}</p>
            <p className="text-xs font-normal text-slate-500">
              {world.description}
            </p>
          </div>
          <div className="ml-4 flex w-32 shrink-0 flex-col items-end gap-1">
            <span className="text-xs text-slate-500">
              {world.doneCount}/{world.totalCount}
            </span>
            <Progress value={world.percent} className="h-1.5 w-full" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-1 pb-2">
          {world.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

const TRACKS: { value: Track; label: string; emoji: string; desc: string }[] = [
  {
    value: "system-design",
    label: "System Design",
    emoji: "📚",
    desc: "৮টা World · ~১১৮টা session",
  },
  {
    value: "docker",
    label: "Docker",
    emoji: "🐳",
    desc: "২টা World · ১৬টা session",
  },
  {
    value: "ai-mastery",
    label: "AI Mastery",
    emoji: "🤖",
    desc: "১১টা World · ৮৫টা session",
  },
  {
    value: "dsa",
    label: "DSA — NeetCode 150",
    emoji: "🧩",
    desc: "২০টা World · ১৮৩টা session",
  },
  {
    value: "devops",
    label: "Mastering AWS & DevOps by Poridhi",
    emoji: "🐧",
    desc: "Season 4 · Milestone-ভিত্তিক",
  },
];

export function SyllabusScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTrack = (searchParams.get("track") as Track) ?? "system-design";

  const { data, loading, error } = useAPI<SyllabusWorld[]>({
    url: "/progress/syllabus",
  });

  const filtered = data?.filter((w) => w.track === activeTrack) ?? [];
  const currentWorldId = filtered.find((w) =>
    w.lessons.some((l) => l.status === "current"),
  )?.id;

  return (
    <AppShell>
      <h1 className="mb-3 text-2xl font-bold text-slate-800">📋 Syllabus</h1>

      {/* Track tabs */}
      <div className="mb-5 flex gap-2">
        {TRACKS.map((t) => (
          <button
            key={t.value}
            onClick={() => router.push(`/syllabus?track=${t.value}`)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              activeTrack === t.value
                ? t.value === "docker"
                  ? "border-sky-400 bg-sky-50 text-sky-700 shadow-sm"
                  : t.value === "ai-mastery"
                    ? "border-violet-400 bg-violet-50 text-violet-700 shadow-sm"
                    : t.value === "dsa"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                      : t.value === "devops"
                        ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                        : "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
            <span className="text-[10px] font-normal opacity-70">{t.desc}</span>
          </button>
        ))}
      </div>

      {loading || (!data && !error) ? (
        <div className="flex justify-center py-24">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <p className="py-24 text-center text-sm text-red-600">
          Syllabus load হয়নি — backend চালু আছে কিনা দেখো।
        </p>
      ) : filtered.length > 0 ? (
        <Accordion
          type="multiple"
          defaultValue={currentWorldId ? [currentWorldId] : [filtered[0]?.id]}
          className="space-y-3"
        >
          {filtered.map((world, i) => {
            const showMilestone =
              world.milestone &&
              world.milestone.id !== filtered[i - 1]?.milestone?.id;
            return (
              <div key={world.id}>
                {showMilestone && world.milestone && (
                  <MilestoneHeader
                    milestone={world.milestone}
                    moduleCount={
                      filtered.filter(
                        (w) => w.milestone?.id === world.milestone?.id,
                      ).length
                    }
                  />
                )}
                <WorldSection world={world} />
              </div>
            );
          })}
        </Accordion>
      ) : null}
    </AppShell>
  );
}
