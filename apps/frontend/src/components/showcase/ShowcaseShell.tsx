import type { ReactNode } from "react";
import Link from "next/link";

export function ShowcaseShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10">
      <Link
        href="/"
        className="text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        ← Back to overview
      </Link>
      <header className="mt-4 mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
      </header>
      {children}
    </main>
  );
}
