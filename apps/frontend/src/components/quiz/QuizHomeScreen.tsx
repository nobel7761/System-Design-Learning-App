"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

const TRACKS = [
  {
    value: "system-design",
    label: "System Design",
    emoji: "📐",
    color: "indigo",
    desc: "Networking, Databases, Scaling, Architecture",
  },
  {
    value: "docker",
    label: "Docker & DevOps",
    emoji: "🐳",
    color: "sky",
    desc: "Containers, Images, Compose & Deployment",
  },
  {
    value: "ai-mastery",
    label: "AI Mastery",
    emoji: "🤖",
    color: "violet",
    desc: "LLMs, Prompting, RAG, Agents & Fine-tuning",
  },
  {
    value: "dsa",
    label: "DSA — NeetCode 150",
    emoji: "🧩",
    color: "emerald",
    desc: "Python, Data Structures, Algorithms & 150 Problems",
  },
  {
    value: "devops",
    label: "Mastering AWS & DevOps by Poridhi",
    emoji: "🐧",
    color: "amber",
    desc: "Season 4 — Linux, AWS, Kubernetes & CI/CD",
  },
] as const;

const COLOR_MAP = {
  indigo: {
    card: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50",
    emoji: "bg-indigo-100",
    title: "text-indigo-700",
  },
  sky: {
    card: "border-sky-200 hover:border-sky-400 hover:bg-sky-50",
    emoji: "bg-sky-100",
    title: "text-sky-700",
  },
  violet: {
    card: "border-violet-200 hover:border-violet-400 hover:bg-violet-50",
    emoji: "bg-violet-100",
    title: "text-violet-700",
  },
  emerald: {
    card: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
    emoji: "bg-emerald-100",
    title: "text-emerald-700",
  },
  amber: {
    card: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
    emoji: "bg-amber-100",
    title: "text-amber-700",
  },
};

export function QuizHomeScreen() {
  return (
    <AppShell>
      <h1 className="mb-1 text-2xl font-bold text-slate-800">🎯 Quiz Review</h1>
      <p className="mb-8 text-sm text-slate-500">
        Completed lessons-এ full 60-question quiz দিয়ে নিজেকে test করো।
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TRACKS.map((t) => {
          const c = COLOR_MAP[t.color];
          return (
            <Link
              key={t.value}
              href={`/quiz/${t.value}`}
              className={`flex flex-col gap-4 rounded-2xl border-2 bg-white p-6 transition ${c.card}`}
            >
              <div className={`w-fit rounded-xl p-3 text-3xl ${c.emoji}`}>
                {t.emoji}
              </div>
              <div>
                <p className={`text-lg font-bold ${c.title}`}>{t.label}</p>
                <p className="mt-1 text-xs text-slate-500">{t.desc}</p>
              </div>
              <p className="mt-auto text-xs font-medium text-slate-400">
                Tap করো →
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-800">
          📌 কীভাবে কাজ করে?
        </p>
        <ul className="mt-2 space-y-1 text-sm text-amber-700">
          <li>
            • Main syllabus-এ lesson পড়ো → 20-প্রশ্নের quiz-এ 80% পাও → ✅ Pass
          </li>
          <li>• Pass করা lessons এখানে unlock হবে</li>
          <li>• এখানে সেই lesson-এর full 60টা প্রশ্নে quiz দিতে পারবে</li>
          <li>• এই quiz-এ score progress-এ count হয় না — শুধু practice</li>
        </ul>
      </div>
    </AppShell>
  );
}
