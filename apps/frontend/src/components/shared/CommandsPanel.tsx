"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shared/shadcn";
import type { LessonCommand } from "@/lib/lessons";

/**
 * Side panel listing every command taught in a lesson — the command itself,
 * what it's used for, a token-by-token breakdown, and an example.
 * Renders nothing when the lesson has no commands file.
 */
export default function CommandsPanel({
  commands,
}: {
  commands: LessonCommand[];
}) {
  if (!commands.length) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
          ⌨️ Commands
          <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">
            {commands.length}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>⌨️ এই lesson-এর Commands</SheetTitle>
          <SheetDescription>
            শুধু কমান্ডগুলো — কোন অংশে কী হয়, কোন কাজে লাগে।
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-8">
          {commands.map((cmd) => (
            <div
              key={cmd.command}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <code className="block rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-emerald-300">
                {cmd.command}
              </code>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {cmd.usage}
              </p>

              <div className="mt-2 flex flex-col gap-1">
                {cmd.parts.map((p) => (
                  <div key={p.token} className="flex items-start gap-2 text-xs">
                    <code className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-rose-600">
                      {p.token}
                    </code>
                    <span className="pt-0.5 text-slate-500">{p.meaning}</span>
                  </div>
                ))}
              </div>

              {cmd.example && (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-600">
                  {cmd.example}
                </pre>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
