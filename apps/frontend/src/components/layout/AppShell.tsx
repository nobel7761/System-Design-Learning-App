"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import CustomButton from "@/components/shared/CustomButton";
import { ChatDrawer } from "@/components/lesson/ChatDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useChatContext } from "@/contexts/ChatContext";

const NAV_ITEMS = [
  { href: "/", emoji: "🏠", label: "Dashboard" },
  { href: "/syllabus", emoji: "📚", label: "Syllabus" },
  { href: "/quiz", emoji: "🎯", label: "Quiz" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setToken } = useAuth();
  const { lessonId, lessonTitle, isOpen, toggle, close } = useChatContext();

  return (
    <div className="flex h-screen flex-col bg-linear-to-br from-indigo-50 via-white to-amber-50">
      {/* ── Top nav ── */}
      <header className="shrink-0 sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-bold text-slate-800"
          >
            <span className="text-xl">🎓</span>
            <span className="hidden sm:inline">Achievement Academy</span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`rounded-lg px-2 py-1.5 text-sm font-medium transition sm:px-3 ${
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="sm:hidden">{item.emoji}</span>
                <span className="hidden sm:inline">
                  {item.emoji} {item.label}
                </span>
              </Link>
            ))}
            <CustomButton
              variant="ghost"
              title="Logout"
              className="rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 sm:px-3"
              onClick={() => {
                setToken(null);
                router.push("/login");
              }}
            >
              <span className="sm:hidden">⎋</span>
              <span className="hidden sm:inline">Logout</span>
            </CustomButton>
            {/* Chat toggle — only when on a lesson page */}
            {lessonId && (
              <button
                onClick={toggle}
                title="Tutor AI"
                className={`ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base transition ${
                  isOpen
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                🎓
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* ── Body: main content + push drawer ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-400 px-4 py-6 sm:w-[90%]">
            {children}
          </div>
        </main>

        {/* Chat drawer — full-screen overlay on mobile, pushes layout on desktop */}
        <aside
          className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out md:relative ${
            isOpen && lessonId
              ? "fixed inset-0 z-30 w-full md:static md:z-auto md:w-105"
              : "w-0"
          }`}
        >
          {lessonId && (
            <ChatDrawer
              lessonId={lessonId}
              lessonTitle={lessonTitle}
              onClose={close}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
