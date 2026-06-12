"use client";

import Link from "next/link";
import { Badge, Card, CardContent, Progress } from "@/components/shared/shadcn";
import type { Dashboard } from "@/lib/api/types";

const DAY_LABELS = ["সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি", "রবি"];

export function TodayCard({ dashboard }: { dashboard: Dashboard }) {
  const lesson = dashboard.todayLesson;

  if (!lesson) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="py-8 text-center">
          <div className="text-3xl">🎉</div>
          <p className="mt-2 font-semibold text-emerald-800">
            সব available lesson শেষ! নতুন World-এর content শীঘ্রই আসছে।
          </p>
        </CardContent>
      </Card>
    );
  }

  const isBoss = lesson.type === "boss";

  return (
    <Card className="border-indigo-200 bg-white shadow-md">
      <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            আজকের Session — {lesson.worldTitle}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-800">
            {isBoss ? "⚔️ " : "📖 "}
            {lesson.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ⏱ ~{lesson.estMinutes} মিনিট
            {dashboard.streak.studiedToday && (
              <span className="ml-2 text-emerald-600">
                ✅ আজকের পড়া হয়ে গেছে — চাইলে এগিয়ে থাকো!
              </span>
            )}
          </p>
        </div>
        {lesson.contentReady ? (
          <Link
            href={`/lesson/${lesson.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow transition hover:bg-indigo-700"
          >
            ▶ শুরু করো
          </Link>
        ) : (
          <Badge variant="secondary">Content আসছে…</Badge>
        )}
      </CardContent>
    </Card>
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
      label: "Course Progress",
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
            পুরো syllabus দেখো →
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
                  W{world.order}: {world.title}
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
