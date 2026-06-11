"use client";

import { useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type FormInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "date";
  required?: boolean;
  hint?: string;
  className?: string;
  showPasswordToggle?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  max?: string;
  min?: string;
  step?: string;
};

export function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  required,
  hint,
  className,
  showPasswordToggle = false,
  disabled,
  readOnly,
  autoComplete,
  max,
  min,
  step,
}: FormInputProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const resolvedType =
    type === "password" && showPasswordToggle
      ? passwordVisible
        ? "text"
        : "password"
      : type;

  const inputCls = cn(
    "w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150",
    "focus:border-slate-400",
    fieldState.error
      ? "border-(--form-error-main) focus:border-(--form-error-main)"
      : "border-slate-200 hover:border-slate-300",
    disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
    type === "password" && showPasswordToggle && "pr-11",
  );

  return (
    <FormField
      label={label}
      required={required}
      htmlFor={name}
      hint={hint}
      error={fieldState.error?.message}
      className={className}
    >
      <div className="relative">
        <input
          {...field}
          id={name}
          type={resolvedType}
          placeholder={placeholder}
          value={field.value ?? ""}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          max={max}
          min={min}
          step={step}
          className={inputCls}
        />
        {type === "password" && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setPasswordVisible((v) => !v)}
            tabIndex={-1}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-(--primary-ring)"
          >
            {passwordVisible ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </FormField>
  );
}
