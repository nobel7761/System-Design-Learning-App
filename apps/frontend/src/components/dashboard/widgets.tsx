"use client";

import Link from "next/link";
import { Badge, Card, CardContent, Progress } from "@/components/shared/shadcn";
import type { Dashboard, TrackSummary } from "@/lib/api/types";

const DAY_LABELS = ["সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি", "রবি"];

function TrackCard({
  emoji,
  title,
  subtitle,
  summary,
  browseHref,
  accentClass,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  summary: TrackSummary;
  browseHref: string;
  accentClass: string;
}) {
  const lesson = summary.currentLesson;

  return (
    <Card className={`border-2 ${accentClass} bg-white shadow-md`}>
      <CardContent className="flex flex-col gap-4 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl">{emoji}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-800">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">
              {summary.percent}%
            </p>
            <p className="text-xs text-slate-400">
              {summary.done}/{summary.total} done
            </p>
          </div>
        </div>

        <Progress value={summary.percent} className="h-2" />

        {lesson ? (
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              পরের lesson
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-700 line-clamp-1">
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

        <Link
          href={browseHref}
          className="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white shadow transition"
          style={{
            background:
              emoji === "🐳"
                ? "linear-gradient(135deg, #0ea5e9, #0369a1)"
                : "linear-gradient(135deg, #6366f1, #4338ca)",
          }}
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
        accentClass="border-indigo-200"
      />
      <TrackCard
        emoji="🐳"
        title="Docker"
        subtitle="Zero থেকে Production-ready"
        summary={dashboard.tracks["docker"]}
        browseHref="/syllabus?track=docker"
        accentClass="border-sky-200"
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
      label: `Level ${xp.level} — ${xp.title}`,
      value: `${xp.total} XP`,
      sub: xp.nextLevelXp ? `পরের level: ${xp.nextLevelXp} XP` : "Max level!",
    },
    {
      icon: "📈",
      label: "Overall Progress",
      value: `${totals.percent}%`,
      sub: `${totals.doneLessons}/${totals.totalLessons} sessions`,
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
