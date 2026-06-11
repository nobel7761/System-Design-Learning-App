"use client";

import React from "react";
import { cn } from "./utils";

type PlainInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "search"
    | "date"
    | "number"
    | "datetime-local";
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

export const PlainInput = React.forwardRef<HTMLInputElement, PlainInputProps>(
  function PlainInput(
    {
      value,
      onChange,
      placeholder,
      className,
      type = "text",
      id,
      disabled,
      readOnly,
      autoComplete,
      autoFocus,
      onFocus,
      onBlur,
      onClick,
      onKeyDown,
    },
    ref,
  ) {
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        id={id}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150",
          "hover:border-slate-300 focus:border-slate-400",
          className,
        )}
      />
    );
  },
);
