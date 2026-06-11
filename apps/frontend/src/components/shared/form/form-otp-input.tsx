"use client";

import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type FormOtpInputProps = {
  name: string;
  label: string;
  length?: number;
  required?: boolean;
  hint?: string;
  className?: string;
};

export function FormOtpInput({
  name,
  label,
  length = 6,
  required,
  hint,
  className,
}: FormOtpInputProps) {
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
      <input
        {...field}
        id={name}
        inputMode="numeric"
        maxLength={length}
        placeholder={"0".repeat(length)}
        onChange={(event) => {
          const value = event.target.value.replace(/\D/g, "").slice(0, length);
          field.onChange(value);
        }}
        className={cn(
          "w-full rounded-xl border bg-white/80 px-4 py-3 font-mono text-lg tracking-[0.5em] text-slate-900 shadow-xs outline-hidden transition-all",
          "focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)",
          fieldState.error
            ? "border-(--form-error-main)"
            : "border-slate-200 hover:border-slate-300",
        )}
      />
    </FormField>
  );
}
