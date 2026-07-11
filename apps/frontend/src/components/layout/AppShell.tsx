"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import CustomButton from "@/components/shared/CustomButton";
import { ChatDrawer } from "@/components/lesson/ChatDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useChatContext } from "@/contexts/ChatContext";

const NAV_ITEMS = [
  { href: "/", label: "🏠 Dashboard" },
  { href: "/syllabus", label: "📚 Syllabus" },
  { href: "/quiz", label: "🎯 Quiz" },
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
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-slate-800"
          >
            <span className="text-xl">🎓</span>
            <span>Achievement Academy</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <CustomButton
              variant="ghost"
              className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => {
                setToken(null);
                router.push("/login");
              }}
            >
              Logout
            </CustomButton>
            {/* Chat toggle — only when on a lesson page */}
            {lessonId && (
              <button
                onClick={toggle}
                title="Tutor AI"
                className={`ml-1 flex h-8 w-8 items-center justify-center rounded-full text-base transition ${
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
          <div className="mx-auto w-[90%] px-4 py-6">{children}</div>
        </main>

        {/* Inline chat drawer — push layout */}
        <aside
          className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
            isOpen && lessonId ? "w-105" : "w-0"
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
