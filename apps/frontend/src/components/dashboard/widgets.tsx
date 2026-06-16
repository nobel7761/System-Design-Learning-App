"use client";

import Link from "next/link";
import { Badge, Card, CardContent, Progress } from "@/components/shared/shadcn";
import type { Dashboard, TrackSummary } from "@/lib/api/types";

const DAY_LABELS = ["সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি", "রবি"];

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function TrackCard({
  emoji,
  title,
  subtitle,
  summary,
  browseHref,
  isDark,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  summary: TrackSummary;
  browseHref: string;
  isDark: boolean;
}) {
  const lesson = summary.currentLesson;
  const borderClass = isDark ? "border-sky-200" : "border-indigo-200";
  const btnGradient = isDark
    ? "linear-gradient(135deg, #0ea5e9, #0369a1)"
    : "linear-gradient(135deg, #6366f1, #4338ca)";
  const xpColor = isDark ? "text-sky-700" : "text-indigo-700";
  const xpBg = isDark ? "bg-sky-50" : "bg-indigo-50";

  return (
    <Card className={`border-2 ${borderClass} bg-white shadow-md`}>
      <CardContent className="flex flex-col gap-4 py-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl">{emoji}</p>
            <h2 className="mt-0.5 text-base font-bold text-slate-800">
              {title}
            </h2>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-slate-800">
              {summary.percent}%
            </p>
            <p className="text-xs text-slate-400">
              {summary.done}/{summary.total} lessons
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={summary.percent} className="h-2" />

        {/* Per-track stats grid */}
        <div
          className={`grid grid-cols-3 divide-x rounded-xl ${xpBg} text-center`}
        >
          <div className="py-3">
            <p className={`text-base font-bold ${xpColor}`}>
              {summary.xpEarned}
            </p>
            <p className="text-[10px] text-slate-500">XP</p>
          </div>
          <div className="py-3">
            <p className={`text-base font-bold ${xpColor}`}>
              {fmtTime(summary.totalTimeSec)}
            </p>
            <p className="text-[10px] text-slate-500">সময়</p>
          </div>
          <div className="py-3">
            <p className={`text-base font-bold ${xpColor}`}>
              {summary.sessionsThisWeek}
            </p>
            <p className="text-[10px] text-slate-500">এ সপ্তাহে</p>
          </div>
        </div>

        {/* Next lesson preview */}
        {lesson ? (
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              পরের lesson
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
              {lesson.type === "boss" ? "⚔️ " : "📖 "}
              {lesson.title}
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-emerald-50 px-3 py-2">
            <p className="text-sm font-medium text-emerald-700">
              🎉 সব lessons শেষ!
            </p>
          </div>
        )}

        {/* CTA */}
        <Link
          href={browseHref}
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
        browseHref="/syllabus?track=system-design"
        isDark={false}
      />
      <TrackCard
        emoji="🐳"
        title="Docker"
        subtitle="Zero থেকে Production-ready"
        summary={dashboard.tracks["docker"]}
        browseHref="/syllabus?track=docker"
        isDark={true}
      />
    </div>
  );
}

export function StatsRow({ dashboard }: { dashboard: Dashboard }) {
  const { streak, xp, totals, activity } = dashboard;
  const hours = Math.floor(totals.totalTimeSec / 3600);
  const minutes = Math.round((totals.totalTimeSec % 3600) / 60);

  const stats = [
    {
      icon: "🔥",
      label: "Streak",
      value: `${streak.current} দিন`,
      sub: `সেরা: ${streak.longest}`,
    },
    {
      icon: "⭐",
      label: `Level ${xp.level}`,
      value: xp.title,
      sub: xp.nextLevelXp
        ? `${xp.total} XP · পরের: ${xp.nextLevelXp}`
        : `${xp.total} XP · Max!`,
    },
    {
      icon: "📖",
      label: "মোট Sessions",
      value: `${totals.doneLessons}`,
      sub: `${totals.totalLessons}-এর মধ্যে`,
    },
    {
      icon: "⏰",
      label: "মোট সময়",
      value: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      sub: `Logins: ${activity.totalLogins}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="py-4">
            <p className="text-xs text-slate-500">
              {stat.icon} {stat.label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800">
              {stat.value}
            </p>
            <p className="text-xs text-slate-400">{stat.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function WeekTracker({ dashboard }: { dashboard: Dashboard }) {
  const { week } = dashboard;
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">এই সপ্তাহ</p>
          <Badge
            variant={week.studiedCount >= week.goal ? "default" : "secondary"}
          >
            {week.studiedCount}/{week.goal} দিন
          </Badge>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {week.days.map((day, i) => (
            <div key={day.date} className="text-center">
              <div
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  day.studied
                    ? "bg-emerald-500 text-white"
                    : day.isToday
                      ? "border-2 border-indigo-400 text-indigo-600"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {day.studied ? "✓" : DAY_LABELS[i].slice(0, 2)}
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{DAY_LABELS[i]}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function WorldMap({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">🗺 World Map</p>
          <Link
            href="/syllabus"
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            পুরো syllabus →
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {dashboard.worlds.map((world) => (
            <div key={world.id}>
              <div className="flex items-center justify-between text-sm">
                <span
                  className={
                    world.percent === 100
                      ? "font-medium text-emerald-700"
                      : world.doneCount > 0
                        ? "font-medium text-slate-800"
                        : "text-slate-400"
                  }
                >
                  {world.percent === 100
                    ? "✅"
                    : world.doneCount > 0
                      ? "▶"
                      : "🔒"}{" "}
                  {world.track === "docker" ? "🐳" : "📚"} {world.title}
                </span>
                <span className="text-xs text-slate-400">
                  {world.doneCount}/{world.totalCount}
                </span>
              </div>
              <Progress value={world.percent} className="mt-1 h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
