"use client";

import Link from "next/link";
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
import type { SyllabusLesson, SyllabusWorld } from "@/lib/api/types";

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

function WorldSection({ world }: { world: SyllabusWorld }) {
  return (
    <AccordionItem value={world.id} className="rounded-xl border bg-white px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex w-full items-center justify-between pr-2">
          <div className="text-left">
            <p className="font-semibold text-slate-800">
              World {world.order}: {world.title}
            </p>
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

export function SyllabusScreen() {
  const { data, loading, error } = useAPI<SyllabusWorld[]>({
    url: "/progress/syllabus",
  });

  const currentWorldId = data?.find((w) =>
    w.lessons.some((l) => l.status === "current"),
  )?.id;

  return (
    <AppShell>
      <h1 className="mb-1 text-2xl font-bold text-slate-800">
        📚 Full Syllabus
      </h1>
      <p className="mb-4 text-sm text-slate-500">
        ১০টা World · প্রায় ১৩৪টা session · সপ্তাহে ৪ দিন, দিনে ৩০ মিনিট
      </p>
      {loading || (!data && !error) ? (
        <div className="flex justify-center py-24">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <p className="py-24 text-center text-sm text-red-600">
          Syllabus load হয়নি — backend চালু আছে কিনা দেখো।
        </p>
      ) : data ? (
        <Accordion
          type="multiple"
          defaultValue={currentWorldId ? [currentWorldId] : [data[0]?.id]}
          className="space-y-3"
        >
          {data.map((world) => (
            <WorldSection key={world.id} world={world} />
          ))}
        </Accordion>
      ) : null}
    </AppShell>
  );
}
