/**
 * Spec format for interactive lab exams.
 * A lesson gets one at content/worlds/<worldId>/<lessonId>.labexam.json —
 * LessonScreen loads it server-side and renders <LabExam /> when present.
 */

/** A node the exam expects the learner to create (drives the tree viz) */
export interface LabExamTarget {
  /** Path with ~ allowed, e.g. "~/code/lab/projects/website" */
  path: string;
  type: "dir" | "file";
  /** Required file content (exact match) for file targets */
  content?: string;
}

export interface LabExamCheck {
  /** All of these must exist (with matching content) after the command */
  paths?: LabExamTarget[];
  /** The shell's cwd must equal this path after the command */
  cwd?: string;
  /** Command output must equal the output of this reference command */
  ref?: string;
  /** Tokens that must appear in the typed command ("-x" = flag letter) */
  require?: string[];
  /** Tokens that must NOT appear in the typed command */
  forbid?: string[];
  /** For cd tasks: the path argument must be written in this style */
  style?: "relative" | "absolute";
}

export interface LabExamTask {
  id: string;
  points: number;
  /** What to do (Bengali) — never contains the command itself */
  prompt: string;
  check: LabExamCheck;
  /** Shown after 2 failed attempts — a nudge, not the answer */
  hint?: string;
  /** Starts a new lab section: shown as a header + explanation above the task */
  section?: { title: string; note?: string };
}

export interface LabExamSpec {
  lessonId: string;
  title: string;
  /** Score (out of 100) needed to pass */
  passPercent: number;
  intro: string;
  /** Every node of the target structure, used for the tree visualization */
  targets: LabExamTarget[];
  tasks: LabExamTask[];
}
