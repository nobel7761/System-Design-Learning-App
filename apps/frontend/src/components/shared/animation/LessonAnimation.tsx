"use client";

import type { AnimationSpec } from "./types";
import { ArrayStage } from "./ArrayStage";
import { StackStage } from "./StackStage";
import { TraceStage } from "./TraceStage";
import { VarsStage } from "./VarsStage";

/**
 * Entry point for ```animation blocks in lesson markdown.
 * Parses the JSON spec and dispatches to the right stage; malformed
 * specs degrade to a visible error card instead of crashing the lesson.
 */
export function LessonAnimation({ raw }: { raw: string }) {
  let spec: AnimationSpec;
  try {
    spec = JSON.parse(raw) as AnimationSpec;
    if (!spec.type || !Array.isArray(spec.steps) || spec.steps.length === 0) {
      throw new Error("missing type/steps");
    }
  } catch {
    return (
      <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
        ⚠️ Animation spec parse হয়নি — lesson author-এর দেখা দরকার।
      </div>
    );
  }

  switch (spec.type) {
    case "array":
      return <ArrayStage spec={spec} />;
    case "vars":
      return <VarsStage spec={spec} />;
    case "stack":
      return <StackStage spec={spec} />;
    case "trace":
      return <TraceStage spec={spec} />;
    default:
      return (
        <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          ⚠️ অজানা animation type।
        </div>
      );
  }
}
