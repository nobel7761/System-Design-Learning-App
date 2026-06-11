"use client";

import React from "react";
import { cn } from "./utils";

type PlainTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
};

export const PlainTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PlainTextareaProps
>(function PlainTextarea(
  {
    value,
    onChange,
    placeholder,
    className,
    id,
    rows = 4,
    disabled,
    readOnly,
    onKeyDown,
    onBlur,
  },
  ref,
) {
  return (
    <textarea
      ref={ref}
      id={id}
      value={value}
      rows={rows}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      className={cn(
        "w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150",
        "hover:border-slate-300 focus:border-slate-400",
        readOnly && "cursor-default bg-slate-50",
        className,
      )}
    />
  );
});
