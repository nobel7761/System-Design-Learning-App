"use client";

import React from "react";

type Segment = { type: "block" | "prose"; content: string };

/** Splits ```fenced code blocks``` out of a quiz string */
function splitFenced(text: string): Segment[] {
  const segments: Segment[] = [];
  const fence = /```[\w-]*\n?([\s\S]*?)```/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: "prose", content: text.slice(last, match.index) });
    }
    segments.push({ type: "block", content: match[1].replace(/\n$/, "") });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ type: "prose", content: text.slice(last) });
  }
  return segments;
}

/** Renders `inline code` spans within a prose segment */
function renderInline(text: string, keyBase: number): React.ReactNode[] {
  return text.split(/`([^`]+)`/g).map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={`${keyBase}-${i}`}
        className="rounded bg-slate-200/70 px-1 py-0.5 font-mono text-[0.85em] text-rose-700"
      >
        {part}
      </code>
    ) : (
      <React.Fragment key={`${keyBase}-${i}`}>{part}</React.Fragment>
    ),
  );
}

/**
 * Lightweight markdown-ish renderer for quiz strings (questions, options,
 * explanations): fenced blocks become real code blocks, backticks become
 * inline code. Parent must NOT be a <p> (code blocks are block-level).
 */
export default function QuizText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const segments = splitFenced(text);
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === "block" ? (
          <pre
            key={i}
            className="my-2 block overflow-x-auto rounded-lg bg-slate-900 px-3 py-2.5 text-left font-mono text-[12.5px] leading-5 text-slate-100"
          >
            <code>{seg.content}</code>
          </pre>
        ) : (
          <span key={i} className="whitespace-pre-wrap">
            {renderInline(seg.content.replace(/^\n+|\n+$/g, ""), i)}
          </span>
        ),
      )}
    </span>
  );
}
