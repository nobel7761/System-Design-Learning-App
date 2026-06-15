import { existsSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

export interface LessonMeta {
  id: string;
  world: string;
  order: number;
  title: string;
  titleEn: string;
  estMinutes: number;
  type: "lesson" | "boss" | "dojo" | "mock";
}

export interface LessonContent {
  meta: LessonMeta;
  body: string;
}

/**
 * Server-side lesson loader. Lesson files live at
 * content/worlds/<worldId>/<lessonId>.md — worldId is the lessonId's prefix
 * (w0l1 → w0).
 */
export function loadLesson(lessonId: string): LessonContent | null {
  const worldId = lessonId.match(/^w[a-z]*\d+/)?.[0];
  if (!worldId || !/^[a-z0-9]+$/.test(lessonId)) {
    return null;
  }
  const filePath = join(
    process.cwd(),
    "content",
    "worlds",
    worldId,
    `${lessonId}.md`,
  );
  if (!existsSync(filePath)) {
    return null;
  }
  const { data, content } = matter(readFileSync(filePath, "utf-8"));
  return {
    meta: data as LessonMeta,
    body: content,
  };
}
