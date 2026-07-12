import { existsSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import type { LabExamSpec } from "@/lib/lab-exam/types";
import type { FsExplorerSpec } from "@/lib/fs-explorer/types";

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

/** One command entry in a lesson's quick-reference panel */
export interface LessonCommand {
  /** The command as typed, e.g. `find <path> -name "<pattern>"` */
  command: string;
  /** What this command is used for (Bengali, one-two lines) */
  usage: string;
  /** Breakdown: each token/flag and what it means */
  parts: { token: string; meaning: string }[];
  /** Optional runnable example with expected output */
  example?: string;
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

/**
 * Loads the lesson's command quick-reference from
 * content/worlds/<worldId>/<lessonId>.commands.json — returns [] if absent.
 */
export function loadLessonCommands(lessonId: string): LessonCommand[] {
  const worldId = lessonId.match(/^w[a-z]*\d+/)?.[0];
  if (!worldId || !/^[a-z0-9]+$/.test(lessonId)) {
    return [];
  }
  const filePath = join(
    process.cwd(),
    "content",
    "worlds",
    worldId,
    `${lessonId}.commands.json`,
  );
  if (!existsSync(filePath)) {
    return [];
  }
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf-8"));
    return Array.isArray(parsed.commands) ? parsed.commands : [];
  } catch {
    return [];
  }
}

/**
 * Loads the lesson's interactive lab exam from
 * content/worlds/<worldId>/<lessonId>.labexam.json — null if absent.
 */
export function loadLabExam(lessonId: string): LabExamSpec | null {
  const worldId = lessonId.match(/^w[a-z]*\d+/)?.[0];
  if (!worldId || !/^[a-z0-9]+$/.test(lessonId)) {
    return null;
  }
  const filePath = join(
    process.cwd(),
    "content",
    "worlds",
    worldId,
    `${lessonId}.labexam.json`,
  );
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as LabExamSpec;
  } catch {
    return null;
  }
}

/**
 * Loads the lesson's filesystem hierarchy explorer from
 * content/worlds/<worldId>/<lessonId>.fstree.json — null if absent.
 */
export function loadFsExplorer(lessonId: string): FsExplorerSpec | null {
  const worldId = lessonId.match(/^w[a-z]*\d+/)?.[0];
  if (!worldId || !/^[a-z0-9]+$/.test(lessonId)) {
    return null;
  }
  const filePath = join(
    process.cwd(),
    "content",
    "worlds",
    worldId,
    `${lessonId}.fstree.json`,
  );
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as FsExplorerSpec;
  } catch {
    return null;
  }
}
