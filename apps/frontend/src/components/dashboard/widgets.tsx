"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Card, CardContent, Progress } from "@/components/shared/shadcn";
import type { Dashboard, HeatmapDay, TrackSummary } from "@/lib/api/types";

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

const GRID_5 =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";

const TRACKS: {
  key: keyof Dashboard["tracks"];
  emoji: string;
  title: string;
  subtitle: string;
  syllabusHref: string;
  isDark: boolean;
}[] = [
  {
    key: "system-design",
    emoji: "📚",
    title: "System Design",
    subtitle: "Internet থেকে Distributed Systems",
    syllabusHref: "/syllabus?track=system-design",
    isDark: false,
  },
  {
    key: "docker",
    emoji: "🐳",
    title: "Docker",
    subtitle: "Zero থেকে Production-ready",
    syllabusHref: "/syllabus?track=docker",
    isDark: true,
  },
  {
    key: "ai-mastery",
    emoji: "🤖",
    title: "AI Mastery",
    subtitle: "LLM থেকে Production AI Engineer",
    syllabusHref: "/syllabus?track=ai-mastery",
    isDark: false,
  },
  {
    key: "dsa",
    emoji: "🧩",
    title: "DSA — NeetCode 150",
    subtitle: "Python-এ Zero থেকে ১৫০ problems",
    syllabusHref: "/syllabus?track=dsa",
    isDark: true,
  },
  {
    key: "devops",
    emoji: "🐧",
    title: "AWS & DevOps by Poridhi",
    subtitle: "Season 4 — Milestone ধরে Linux থেকে Production K8s",
    syllabusHref: "/syllabus?track=devops",
    isDark: false,
  },
];

function SectionHeader({ title, explain }: { title: string; explain: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-bold text-slate-700">{title}</h2>
      <p className="text-right text-xs text-slate-400">{explain}</p>
    </div>
  );
}

function SubLabel({ children }: { children: string }) {
  return (
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  );
}

/**
 * One self-contained course card: progress, this-week grid, next lesson,
 * lesson stats and per-course consistency all stacked in a single card.
 */
function CourseCard({
  emoji,
  title,
  summary,
  syllabusHref,
  isDark,
}: {
  emoji: string;
  title: string;
  summary: TrackSummary;
  syllabusHref: string;
  isDark: boolean;
}) {
  const lesson = summary.currentLesson;
  const borderClass = isDark ? "border-sky-200" : "border-indigo-200";
  const accentColor = isDark ? "text-sky-700" : "text-indigo-700";
  const accentBg = isDark ? "bg-sky-50" : "bg-indigo-50";
  const btnGradient = isDark
    ? "linear-gradient(135deg, #0ea5e9, #0369a1)"
    : "linear-gradient(135deg, #6366f1, #4338ca)";
  const studiedDays = summary.weekDays.filter((d) => d.studied).length;
  const weekGoal = 4;

  return (
    <Card className={`border-2 ${borderClass} bg-white shadow-sm`}>
      <CardContent className="flex flex-col gap-4 py-4">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-lg">{emoji}</p>
            <h3 className="truncate text-sm font-bold text-slate-800">
              {title}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
            🔥 {summary.streak.current}
          </span>
        </div>

        {/* ── Progress ── */}
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>
              {summary.done}/{summary.total} lessons
            </span>
            <span className="font-semibold text-slate-700">
              {summary.percent}%
            </span>
          </div>
          <Progress value={summary.percent} className="h-1.5" />
        </div>

        {/* ── এই সপ্তাহ ── */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <SubLabel>এই সপ্তাহ</SubLabel>
            <Badge
              variant={studiedDays >= weekGoal ? "default" : "secondary"}
              className="text-[9px]"
            >
              {studiedDays}/{weekGoal}
            </Badge>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {summary.weekDays.map((day, i) => (
              <div
                key={day.date}
                title={DAY_LABELS[i]}
                className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-semibold ${
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
                {day.studied ? "✓" : DAY_LABELS[i].slice(0, 1)}
              </div>
            ))}
          </div>
        </div>

        {/* ── পরের Lesson ── */}
        <div>
          <SubLabel>পরের Lesson</SubLabel>
          {lesson ? (
            <Link
              href={`/lesson/${lesson.id}`}
              className="block rounded-lg bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
            >
              <p className="truncate text-xs font-medium text-slate-700">
                {LESSON_TYPE_ICON[lesson.type] ?? "📖"} {lesson.title}
              </p>
            </Link>
          ) : (
            <div className="rounded-lg bg-emerald-50 px-3 py-2">
              <p className="text-xs font-medium text-emerald-700">
                🎉 সব lessons শেষ!
              </p>
            </div>
          )}
        </div>

        {/* ── Lesson Stats ── */}
        <div>
          <SubLabel>Lesson Stats</SubLabel>
          <div className="grid grid-cols-2 gap-1.5 text-center">
            <div className="rounded-lg bg-slate-50 py-1.5">
              <p className="text-xs font-bold text-slate-800">
                {summary.xpEarned}
              </p>
              <p className="text-[8px] text-slate-500">XP</p>
            </div>
            <div className="rounded-lg bg-slate-50 py-1.5">
              <p className="text-xs font-bold text-slate-800">
                {fmtTime(summary.totalTimeSec)}
              </p>
              <p className="text-[8px] text-slate-500">সময়</p>
            </div>
            <div className="rounded-lg bg-slate-50 py-1.5">
              <p className="text-xs font-bold text-slate-800">
                {summary.sessionsThisWeek}
              </p>
              <p className="text-[8px] text-slate-500">এ সপ্তাহে</p>
            </div>
            <div className="rounded-lg bg-slate-50 py-1.5">
              <p className={`text-xs font-bold ${accentColor}`}>
                Lv {summary.level.level}
              </p>
              <p className="truncate text-[8px] text-slate-500">
                {summary.level.title}
              </p>
            </div>
          </div>
        </div>

        {/* ── Consistency (per-course) ── */}
        <div>
          <SubLabel>Consistency</SubLabel>
          <div className="grid grid-cols-2 gap-1.5 text-center">
            <div className={`rounded-lg ${accentBg} py-1.5`}>
              <p className={`text-xs font-bold ${accentColor}`}>
                🏆 {summary.streak.longest}
              </p>
              <p className="text-[8px] text-slate-500">সর্বোচ্চ streak</p>
            </div>
            <div className={`rounded-lg ${accentBg} py-1.5`}>
              <p className={`text-xs font-bold ${accentColor}`}>
                📚 {summary.totalSessions}
              </p>
              <p className="text-[8px] text-slate-500">মোট sessions</p>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <Link
          href={lesson ? `/lesson/${lesson.id}` : syllabusHref}
          className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow transition hover:opacity-90"
          style={{ background: btnGradient }}
        >
          {lesson ? "চালিয়ে যাও →" : "Browse করো →"}
        </Link>
      </CardContent>
    </Card>
  );
}

const HEATMAP_LEVEL_BG = [
  "bg-slate-100",
  "bg-emerald-200",
  "bg-emerald-400",
  "bg-emerald-500",
  "bg-emerald-700",
];

const MONTH_FMT = new Intl.DateTimeFormat("en", { month: "short" });
const TOOLTIP_DATE_FMT = new Intl.DateTimeFormat("en", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const WEEKDAY_ROW_LABELS = ["সোম", "", "বুধ", "", "শুক্র", "", ""];

function dayOfWeekMon0(dateStr: string) {
  return (new Date(`${dateStr}T12:00:00Z`).getUTCDay() + 6) % 7;
}

function heatmapLevel(count: number, maxCount: number) {
  if (count === 0) return 0;
  const ratio = count / maxCount;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

/** GitHub-style calendar heatmap of the last 90 days, combined across all courses. */
function ActivityHeatmap({ heatmap }: { heatmap: HeatmapDay[] }) {
  const [hover, setHover] = useState<{
    day: HeatmapDay;
    x: number;
    y: number;
  } | null>(null);

  if (heatmap.length === 0) return null;

  const leadingPad = dayOfWeekMon0(heatmap[0].date);
  const cells: (HeatmapDay | null)[] = [
    ...Array.from({ length: leadingPad }, () => null),
    ...heatmap,
  ];
  const columns: (HeatmapDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));

  const maxCount = Math.max(1, ...heatmap.map((d) => d.count));
  const lastYear = new Date(
    `${heatmap[heatmap.length - 1].date}T12:00:00Z`,
  ).getUTCFullYear();

  let lastMonthKey = "";
  const colLabels = columns.map((col) => {
    const firstDay = col.find((d): d is HeatmapDay => d !== null);
    if (!firstDay) return "";
    const d = new Date(`${firstDay.date}T12:00:00Z`);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    if (key === lastMonthKey) return "";
    lastMonthKey = key;
    const label = MONTH_FMT.format(d);
    return d.getUTCFullYear() !== lastYear
      ? `${label} '${String(d.getUTCFullYear()).slice(2)}`
      : label;
  });

  return (
    <Card className="relative overflow-visible border border-slate-200 bg-white shadow-sm">
      <CardContent className="flex flex-col gap-3 py-5">
        <div className="overflow-x-auto">
          <div className="flex w-fit gap-1">
            <div className="flex flex-col gap-1 pt-4">
              {WEEKDAY_ROW_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="flex h-[0.85rem] items-center text-[9px] text-slate-400"
                >
                  {label}
                </div>
              ))}
            </div>
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-1">
                <div className="h-4 whitespace-nowrap text-[9px] text-slate-400">
                  {colLabels[ci]}
                </div>
                {col.map((day, ri) =>
                  day ? (
                    <div
                      key={day.date}
                      onMouseEnter={(e) =>
                        setHover({ day, x: e.clientX, y: e.clientY })
                      }
                      onMouseMove={(e) =>
                        setHover({ day, x: e.clientX, y: e.clientY })
                      }
                      onMouseLeave={() => setHover(null)}
                      className={`h-[0.85rem] w-[0.85rem] rounded-sm ${HEATMAP_LEVEL_BG[heatmapLevel(day.count, maxCount)]}`}
                    />
                  ) : (
                    <div
                      key={`pad-${ci}-${ri}`}
                      className="h-[0.85rem] w-[0.85rem]"
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
          <span>কম</span>
          {HEATMAP_LEVEL_BG.map((bg) => (
            <div
              key={bg}
              className={`h-[0.85rem] w-[0.85rem] rounded-sm ${bg}`}
            />
          ))}
          <span>বেশি</span>
        </div>
      </CardContent>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg"
          style={{ left: hover.x + 14, top: hover.y - 12 }}
        >
          {TOOLTIP_DATE_FMT.format(new Date(`${hover.day.date}T12:00:00Z`))} —{" "}
          {hover.day.count} session{hover.day.count === 1 ? "" : "s"}
        </div>
      )}
    </Card>
  );
}

export function TrackCards({ dashboard }: { dashboard: Dashboard }) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionHeader
          title="তোমার Courses"
          explain="প্রতিটা course-এর সম্পূর্ণ progress, streak ও consistency"
        />
        <div className={GRID_5}>
          {TRACKS.map((t) => (
            <CourseCard
              key={t.key}
              emoji={t.emoji}
              title={t.title}
              summary={dashboard.tracks[t.key]}
              syllabusHref={t.syllabusHref}
              isDark={t.isDark}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Activity Heatmap"
          explain="গত ৯০ দিনে কোন দিন কতটা পড়াশোনা করেছো — সব course মিলিয়ে"
        />
        <ActivityHeatmap heatmap={dashboard.heatmap} />
      </section>
    </div>
  );
}
