import Link from "next/link";
import MarkdownContent from "@/components/shared/MarkdownContent";
import { Badge } from "@/components/shared/shadcn";
import { AppShell } from "@/components/layout/AppShell";
import { loadLesson } from "@/lib/lessons";
import { QuizSection } from "./QuizSection";

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const lesson = loadLesson(lessonId);

  if (!lesson) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <div className="text-4xl">🔍</div>
          <p className="mt-3 font-semibold text-slate-700">
            এই lesson-টা পাওয়া যায়নি বা content এখনো ready হয়নি।
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            ← Dashboard-এ ফিরে যাও
          </Link>
        </div>
      </AppShell>
    );
  }

  const { meta, body } = lesson;
  const isBoss = meta.type === "boss";

  return (
    <AppShell>
      <article className="mx-auto max-w-3xl">
        <header className="mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={isBoss ? "destructive" : "secondary"}>
              {isBoss ? "⚔️ BOSS" : `Lesson ${meta.order}`}
            </Badge>
            <span className="text-xs text-slate-400">
              ⏱ ~{meta.estMinutes} min
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {meta.title}
          </h1>
          <p className="text-sm text-slate-400">{meta.titleEn}</p>
        </header>

        <MarkdownContent content={body} className="mt-6" />

        <hr className="my-10 border-slate-200" />

        <QuizSection lessonId={lessonId} />
      </article>
    </AppShell>
  );
}
