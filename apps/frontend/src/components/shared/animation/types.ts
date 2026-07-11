/**
 * Spec format for interactive lesson animations.
 * Lessons embed these as fenced code blocks: ```animation { ...json }```
 * MarkdownContent parses the JSON and renders <LessonAnimation spec={...} />.
 */

export interface BaseStep {
  /** Bengali narration shown under the stage for this step */
  note: string;
}

/** Array cells with named pointers walking over them */
export interface ArrayStep extends BaseStep {
  /** New array state; omit to keep the previous state */
  array?: (string | number)[];
  /** pointer name -> cell index (e.g. { "i": 0, "j": 4 }) */
  pointers?: Record<string, number>;
  /** cell indexes to highlight this step */
  highlight?: number[];
}

/** Variables as labels (stickers) pointing at value boxes in memory */
export interface VarsStep extends BaseStep {
  boxes: { id: string; value: string }[];
  labels: { name: string; box: string }[];
}

/** Call stack frames, bottom-up */
export interface StackStep extends BaseStep {
  frames: string[];
}

/** Line-by-line code trace with a variable table and output console */
export interface TraceStep extends BaseStep {
  /** 1-based line number currently executing */
  line: number;
  /** variable name -> current value (as display string) */
  vars?: Record<string, string>;
  /** text appended to the output console this step */
  out?: string;
}

interface SpecBase {
  title?: string;
}

export interface ArraySpec extends SpecBase {
  type: "array";
  array: (string | number)[];
  steps: ArrayStep[];
}

export interface VarsSpec extends SpecBase {
  type: "vars";
  steps: VarsStep[];
}

export interface StackSpec extends SpecBase {
  type: "stack";
  steps: StackStep[];
}

export interface TraceSpec extends SpecBase {
  type: "trace";
  code: string[];
  steps: TraceStep[];
}

export type AnimationSpec = ArraySpec | VarsSpec | StackSpec | TraceSpec;

/** ```reveal block: predict-then-reveal exercise */
export interface RevealSpec {
  /** the code/question shown to the reader */
  code: string;
  /** optional prompt above the button */
  prompt?: string;
  /** the hidden answer (e.g. program output) */
  answer: string;
  /** optional explanation shown after reveal */
  explanation?: string;
}
