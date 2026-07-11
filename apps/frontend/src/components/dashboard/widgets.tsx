"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Card,
  CardContent,
  Progress,
} from "@/components/shared/shadcn";
import type {
  Dashboard,
  Milestone,
  TrackSummary,
  TrackWorldMini,
} from "@/lib/api/types";

const DAY_LABELS = ["সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি", "রবি"];

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const LESSON_TYPE_ICON: Record<string, string> = {
  lesson: "📖",
  workshop: "🔧",
  mock: "🎤",
  boss: "⚔️",
  dojo: "🥋",
};

/** Milestone → Module → Lessons accordion for milestone-based tracks (devops) */
function MilestoneWorldsTree({ worlds }: { worlds: TrackWorldMini[] }) {
  const groups: { milestone: Milestone; worlds: TrackWorldMini[] }[] = [];
  for (const w of worlds) {
    if (!w.milestone) continue;
    const g = groups.find((x) => x.milestone.id === w.milestone!.id);
    if (g) g.worlds.push(w);
    else groups.push({ milestone: w.milestone, worlds: [w] });
  }

  return (
    <Accordion type="multiple" className="space-y-1.5">
      {groups.map((g) => {
        const done = g.worlds.reduce((a, w) => a + w.doneCount, 0);
        const total = g.worlds.reduce((a, w) => a + w.totalCount, 0);
        const milestoneDone = total > 0 && done === total;
        return (
          <AccordionItem
            key={g.milestone.id}
            value={g.milestone.id}
            className="rounded-lg border border-violet-200 bg-violet-50/60 px-2.5"
          >
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex w-full items-center gap-2 pr-2 text-xs">
                <span className="shrink-0 rounded border border-violet-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                  🏁 Milestone {g.milestone.order}
                </span>
                <span className="truncate text-left font-semibold text-slate-700">
                  {g.milestone.title}
                </span>
                {milestoneDone && <span className="shrink-0">✅</span>}
                <span className="ml-auto shrink-0 text-slate-400">
                  {done}/{total}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <Accordion type="multiple" className="space-y-1">
                {g.worlds.map((w) => {
                  const moduleDone = w.totalCount > 0 && w.percent === 100;
                  const moduleEmpty = (w.lessons ?? []).length === 0;
                  return (
                    <AccordionItem
                      key={w.id}
                      value={w.id}
                      className={`rounded-lg border border-slate-200 px-2.5 ${
                        moduleEmpty ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      <AccordionTrigger className="py-1.5 hover:no-underline">
                        <div className="flex w-full items-center gap-2 pr-2 text-xs">
                          {w.moduleNo != null && (
                            <span className="shrink-0 rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-600">
                              Module {w.moduleNo}
                            </span>
                          )}
                          <span
                            className={`truncate text-left font-medium ${
                              moduleDone
                                ? "text-emerald-700"
                                : moduleEmpty
                                  ? "text-slate-400"
                                  : "text-slate-700"
                            }`}
                          >
                            {w.title}
                          </span>
                          {moduleDone && <span className="shrink-0">✅</span>}
                          <span className="ml-auto shrink-0 text-slate-400">
                            {w.totalCount > 0
                              ? `${w.doneCount}/${w.totalCount}`
                              : ""}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-1.5">
                        <div className="flex flex-col gap-0.5">
                          {moduleEmpty && (
                            <p className="px-2 py-1 text-xs text-slate-400">
                              🔒 Content আসছে — পেলেই খুলে যাবে
                            </p>
                          )}
                          {(w.lessons ?? []).map((l) => {
                            const icon = LESSON_TYPE_ICON[l.type] ?? "📖";
                            const clickable =
                              l.contentReady && l.status !== "locked";
                            const inner = (
                              <>
                                <span className="flex min-w-0 items-center gap-1.5">
                                  <span className="shrink-0">{icon}</span>
                                  <span className="truncate">{l.title}</span>
                                </span>
                                {l.status === "done" && (
                                  <span className="shrink-0">✅</span>
                                )}
                              </>
                            );
                            return clickable ? (
                              <Link
                                key={l.id}
                                href={`/lesson/${l.id}`}
                                className="flex items-center justify-between gap-2 rounded px-2 py-1 text-xs text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                {inner}
                              </Link>
                            ) : (
                              <div
                                key={l.id}
                                className="flex items-center justify-between gap-2 rounded px-2 py-1 text-xs text-slate-300"
                                title="Content এখনো আসেনি"
                              >
                                {inner}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function TrackCard({
  emoji,
  title,
  subtitle,
  summary,
  syllabusHref,
  isDark,
  streak,
  xp,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  summary: TrackSummary;
  syllabusHref: string;
  isDark: boolean;
  streak: { current: number };
  xp: { level: number; title: string };
}) {
  const lesson = summary.currentLesson;
  const borderClass = isDark ? "border-sky-200" : "border-indigo-200";
  const btnGradient = isDark
    ? "linear-gradient(135deg, #0ea5e9, #0369a1)"
    : "linear-gradient(135deg, #6366f1, #4338ca)";
  const accentColor = isDark ? "text-sky-700" : "text-indigo-700";
  const accentBg = isDark ? "bg-sky-50" : "bg-indigo-50";
  const studiedDays = summary.weekDays.filter((d) => d.studied).length;
  const weekGoal = 4;

  return (
    <Card className={`border-2 ${borderClass} bg-white shadow-md`}>
      <CardContent className="flex flex-col gap-4 py-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl">{emoji}</p>
            <h2 className="mt-0.5 text-base font-bold text-slate-800">
              {title}
            </h2>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
            🔥 {streak.current} সপ্তাহ
          </span>
        </div>

        {/* ── Top stats: lessons · level · total time ── */}
        <div className="grid grid-cols-3 divide-x rounded-xl border border-slate-100 bg-slate-50 text-center">
          <div className="py-2.5">
            <p className="text-sm font-bold text-slate-800">
              {summary.done}/{summary.total}
            </p>
            <p className="text-[10px] text-slate-500">মোট lessons</p>
          </div>
          <div className="py-2.5">
            <p className={`text-sm font-bold ${accentColor}`}>⭐ {xp.title}</p>
            <p className="text-[10px] text-slate-500">Level {xp.level}</p>
          </div>
          <div className="py-2.5">
            <p className="text-sm font-bold text-slate-800">
              {fmtTime(summary.totalTimeSec)}
            </p>
            <p className="text-[10px] text-slate-500">মোট সময়</p>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>অগ্রগতি</span>
            <span className="font-semibold text-slate-700">
              {summary.percent}%
            </span>
          </div>
          <Progress value={summary.percent} className="h-2" />
        </div>

        {/* ── Next lesson (before XP grid) ── */}
        {lesson ? (
          <Link
            href={`/lesson/${lesson.id}`}
            className="block rounded-lg bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              পরের lesson
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
              {lesson.type === "boss" ? "⚔️ " : "📖 "}
              {lesson.title}
            </p>
          </Link>
        ) : (
          <div className="rounded-lg bg-emerald-50 px-3 py-2">
            <p className="text-sm font-medium text-emerald-700">
              🎉 সব lessons শেষ!
            </p>
          </div>
        )}

        {/* ── Per-session stats: XP · সময় · এ সপ্তাহে ── */}
        <div
          className={`grid grid-cols-3 divide-x rounded-xl ${accentBg} text-center`}
        >
          <div className="py-2.5">
            <p className={`text-base font-bold ${accentColor}`}>
              {summary.xpEarned}
            </p>
            <p className="text-[10px] text-slate-500">XP</p>
          </div>
          <div className="py-2.5">
            <p className={`text-base font-bold ${accentColor}`}>
              {fmtTime(summary.totalTimeSec)}
            </p>
            <p className="text-[10px] text-slate-500">সময়</p>
          </div>
          <div className="py-2.5">
            <p className={`text-base font-bold ${accentColor}`}>
              {summary.sessionsThisWeek}
            </p>
            <p className="text-[10px] text-slate-500">এ সপ্তাহে</p>
          </div>
        </div>

        {/* ── Week tracker (per-track) ── */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600">এই সপ্তাহ</p>
            <Badge
              variant={studiedDays >= weekGoal ? "default" : "secondary"}
              className="text-[10px]"
            >
              {studiedDays}/{weekGoal} দিন
            </Badge>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {summary.weekDays.map((day, i) => (
              <div key={day.date} className="text-center">
                <div
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    day.studied
                      ? isDark
                        ? "bg-sky-500 text-white"
                        : "bg-indigo-500 text-white"
                      : day.isToday
                        ? isDark
                          ? "border-2 border-sky-400 text-sky-600"
                          : "border-2 border-indigo-400 text-indigo-600"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {day.studied ? "✓" : DAY_LABELS[i].slice(0, 2)}
                </div>
                <p className="mt-0.5 text-[9px] text-slate-400">
                  {DAY_LABELS[i]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Worlds + syllabus link ── */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600">Worlds</p>
            <Link
              href={syllabusHref}
              className={`text-xs font-medium hover:underline ${isDark ? "text-sky-600" : "text-indigo-600"}`}
            >
              Full Syllabus →
            </Link>
          </div>
          {summary.worlds.some((w) => w.milestone) ? (
            <MilestoneWorldsTree worlds={summary.worlds} />
          ) : (
            <div className="space-y-2">
              {summary.worlds.map((world) => (
                <div key={world.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={
                        world.percent === 100
                          ? "font-medium text-emerald-700"
                          : world.doneCount > 0
                            ? "font-medium text-slate-700"
                            : "text-slate-400"
                      }
                    >
                      {world.percent === 100
                        ? "✅"
                        : world.doneCount > 0
                          ? "▶"
                          : "🔒"}{" "}
                      {world.title}
                    </span>
                    <span className="text-slate-400">
                      {world.doneCount}/{world.totalCount}
                    </span>
                  </div>
                  <Progress value={world.percent} className="mt-1 h-1.5" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <Link
          href={syllabusHref}
          className="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white shadow transition hover:opacity-90"
          style={{ background: btnGradient }}
        >
          Browse করো →
        </Link>
      </CardContent>
    </Card>
  );
}

export function TrackCards({ dashboard }: { dashboard: Dashboard }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TrackCard
        emoji="📚"
        title="System Design"
        subtitle="Internet থেকে Distributed Systems"
        summary={dashboard.tracks["system-design"]}
        syllabusHref="/syllabus?track=system-design"
        isDark={false}
        streak={dashboard.streak}
        xp={dashboard.xp}
      />
      <TrackCard
        emoji="🐳"
        title="Docker"
        subtitle="Zero থেকে Production-ready"
        summary={dashboard.tracks["docker"]}
        syllabusHref="/syllabus?track=docker"
        isDark={true}
        streak={dashboard.streak}
        xp={dashboard.xp}
      />
      <TrackCard
        emoji="🤖"
        title="AI Mastery"
        subtitle="LLM থেকে Production AI Engineer"
        summary={dashboard.tracks["ai-mastery"]}
        syllabusHref="/syllabus?track=ai-mastery"
        isDark={false}
        streak={dashboard.streak}
        xp={dashboard.xp}
      />
      <TrackCard
        emoji="🧩"
        title="DSA — NeetCode 150"
        subtitle="Python-এ Zero থেকে ১৫০ problems"
        summary={dashboard.tracks["dsa"]}
        syllabusHref="/syllabus?track=dsa"
        isDark={true}
        streak={dashboard.streak}
        xp={dashboard.xp}
      />
      <TrackCard
        emoji="🐧"
        title="Mastering AWS & DevOps by Poridhi"
        subtitle="Season 4 — Milestone ধরে Linux থেকে Production K8s"
        summary={dashboard.tracks["devops"]}
        syllabusHref="/syllabus?track=devops"
        isDark={false}
        streak={dashboard.streak}
        xp={dashboard.xp}
      />
    </div>
  );
}
