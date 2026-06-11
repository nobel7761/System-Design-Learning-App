"use client";

import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type FormTextareaProps = {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
  className?: string;
  readOnly?: boolean;
};

export function FormTextarea({
  name,
  label,
  placeholder,
  rows = 4,
  required,
  hint,
  className,
  readOnly,
}: FormTextareaProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <FormField
      label={label}
      required={required}
      htmlFor={name}
      hint={hint}
      error={fieldState.error?.message}
      className={className}
    >
      <textarea
        {...field}
        id={name}
        placeholder={placeholder}
        rows={rows}
        value={field.value ?? ""}
        readOnly={readOnly}
        className={cn(
          "w-full resize-y rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150",
          "focus:border-slate-400",
          fieldState.error
            ? "border-(--form-error-main) focus:border-(--form-error-main)"
            : "border-slate-200 hover:border-slate-300",
          readOnly && "cursor-default bg-slate-50",
        )}
      />
    </FormField>
  );
}
