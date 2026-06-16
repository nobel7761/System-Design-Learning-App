"use client";

import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Recursively extracts plain text from React children */
function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

/**
 * Renders block code (from <pre><code>…</code></pre>) with a copy button.
 * We extract raw text from children so we bypass whatever inline-code
 * styling react-markdown may have applied to the inner <code> element.
 */
function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const rawText = extractText(children);

  function handleCopy() {
    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="group relative my-4">
      <button
        onClick={handleCopy}
        title="Copy code"
        className={`absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition ${
          copied
            ? "bg-emerald-600 text-white opacity-100"
            : "bg-slate-700 text-slate-300 opacity-0 hover:bg-slate-600 group-hover:opacity-100"
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
        <code className="font-mono text-slate-100">{rawText}</code>
      </pre>
    </div>
  );
}

export default function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  return (
    <div className={`text-slate-700 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="mt-8 mb-3 border-b border-slate-200 pb-2 text-xl font-bold text-slate-800">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 text-lg font-semibold text-slate-800">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-3">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-indigo-300 bg-indigo-50/50 px-4 py-2 italic">
              {children}
            </blockquote>
          ),
          // pre handles ALL block code — extract raw text and render cleanly
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          // code: only applies inline styling when NOT wrapped by pre
          // (pre's CodeBlock extracts raw text and never renders this element)
          code: ({ children, className: codeClass }) => {
            if (codeClass?.includes("language-")) {
              // Language-tagged block — rendered via pre above, this shouldn't show
              return <code className="font-mono">{children}</code>;
            }
            // Inline code
            return (
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-rose-600">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
