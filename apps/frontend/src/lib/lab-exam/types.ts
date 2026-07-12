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
  /** Expected octal permission, e.g. "775" — shows a badge that turns green */
  mode?: string;
  /** Expected owner user */
  owner?: string;
  /** Expected owning group */
  group?: string;
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
  /** These groups must exist after the command */
  groupsExist?: string[];
  /** Expected permission/ownership of paths after the command */
  pathModes?: { path: string; mode?: string; owner?: string; group?: string }[];
  /** Expected state of users after the command */
  usersState?: {
    name: string;
    /** set false to require the user to be deleted */
    exists?: boolean;
    /** required primary group */
    primary?: string;
    /** must be a member (primary or supplementary) of each */
    inGroups?: string[];
    /** must NOT be a member of any of these */
    notInGroups?: string[];
    locked?: boolean;
    /** /home/<name> must exist (true) or not (false) */
    hasHome?: boolean;
  }[];
}

export interface LabExamTask {
  id: string;
  points: number;
  /** What to do (Bengali) — never contains the command itself */
  prompt: string;
  check: LabExamCheck;
  /**
   * Progressive nudges, vaguest first. Revealed one at a time via the "Tips"
   * button; the first one also auto-shows after 2 failed attempts. Never the
   * literal answer command.
   */
  hints?: string[];
  /** Starts a new lab section: shown as a header + explanation above the task */
  section?: { title: string; note?: string };
}

/** One group box in the users/groups visualization panel */
export interface LabExamGroupTarget {
  group: string;
  /** users expected to become members of this group */
  users: string[];
}

export interface LabExamSpec {
  lessonId: string;
  title: string;
  /** Score (out of 100) needed to pass */
  passPercent: number;
  intro: string;
  /** Every node of the target structure, used for the tree visualization */
  targets: LabExamTarget[];
  /** Groups/users panel targets (user-management labs) */
  groupTargets?: LabExamGroupTarget[];
  tasks: LabExamTask[];
}
