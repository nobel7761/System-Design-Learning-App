"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { SyllabusLesson, SyllabusWorld, Track } from "@/lib/api/types";

const TRACK_META: Record<
  Track,
  { label: string; emoji: string; color: string }
> = {
  "system-design": { label: "System Design", emoji: "📐", color: "indigo" },
  docker: { label: "Docker & DevOps", emoji: "🐳", color: "sky" },
  "ai-mastery": { label: "AI Mastery", emoji: "🤖", color: "violet" },
  dsa: { label: "DSA — NeetCode 150", emoji: "🧩", color: "emerald" },
  devops: {
    label: "Mastering AWS & DevOps by Poridhi",
    emoji: "🐧",
    color: "amber",
  },
};

const TYPE_BADGE: Record<string, string> = {
  boss: "⚔️ Boss",
  dojo: "🥋 Dojo",
  mock: "🎤 Mock",
  workshop: "🔧 Workshop",
  "deep-dive": "🔬 Deep Dive",
  project: "🚀 Project",
};

function QuizLessonRow({
  lesson,
  track,
}: {
  lesson: SyllabusLesson;
  track: Track;
}) {
  const isDone = lesson.status === "done";
  const typeBadge = TYPE_BADGE[lesson.type] ?? null;

  const inner = (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
        isDone
          ? "bg-emerald-50 hover:bg-emerald-100"
          : "opacity-50 cursor-not-allowed"
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        <span>{isDone ? "✅" : "🔒"}</span>
        <span className={isDone ? "text-slate-700" : "text-slate-400"}>
          {lesson.order}. {lesson.title}
        </span>
        {typeBadge && (
          <Badge variant="outline" className="text-[10px]">
            {typeBadge}
          </Badge>
        )}
      </div>
      {isDone && (
        <span className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
          Quiz দাও →
        </span>
      )}
    </div>
  );

  if (isDone) {
    return (
      <Link href={`/quiz/${track}/${lesson.id}`} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function QuizWorldSection({
  world,
  track,
}: {
  world: SyllabusWorld;
  track: Track;
}) {
  const doneCount = world.lessons.filter((l) => l.status === "done").length;
  return (
    <AccordionItem value={world.id} className="rounded-xl border bg-white px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex w-full items-center justify-between pr-2">
          <div className="text-left">
            <p className="font-semibold text-slate-800">{world.title}</p>
            <p className="text-xs font-normal text-slate-500">
              {world.description}
            </p>
          </div>
          <div className="ml-4 flex w-32 shrink-0 flex-col items-end gap-1">
            <span className="text-xs text-slate-500">
              {doneCount}/{world.totalCount} passed
            </span>
            <Progress
              value={(doneCount / world.totalCount) * 100}
              className="h-1.5 w-full"
            />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-1 pb-2">
          {world.lessons.map((lesson) => (
            <QuizLessonRow key={lesson.id} lesson={lesson} track={track} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function QuizTrackScreen({ track }: { track: Track }) {
  const router = useRouter();
  const meta = TRACK_META[track];

  const { data, loading, error } = useAPI<SyllabusWorld[]>({
    url: "/progress/syllabus",
  });

  const worlds = data?.filter((w) => w.track === track) ?? [];
  const totalDone = worlds.reduce(
    (acc, w) => acc + w.lessons.filter((l) => l.status === "done").length,
    0,
  );
  const totalLessons = worlds.reduce((acc, w) => acc + w.lessons.length, 0);

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => router.push("/quiz")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {meta.emoji} {meta.label} — Quiz Review
          </h1>
          <p className="text-xs text-slate-500">
            {totalDone}/{totalLessons} lessons passed — click any ✅ to take
            full quiz
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <p className="py-24 text-center text-sm text-red-600">
          Load হয়নি — backend চালু আছে কিনা দেখো।
        </p>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={worlds.map((w) => w.id)}
          className="space-y-3"
        >
          {worlds.map((world) => (
            <QuizWorldSection key={world.id} world={world} track={track} />
          ))}
        </Accordion>
      )}
    </AppShell>
  );
}
