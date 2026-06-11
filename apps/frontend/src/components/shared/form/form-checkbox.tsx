"use client";

import { useController, useFormContext } from "react-hook-form";
import { cn } from "./utils";

type FormCheckboxProps = {
  name: string;
  label: string;
  description?: string;
  className?: string;
};

export function FormCheckbox({
  name,
  label,
  description,
  className,
}: FormCheckboxProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <label
      htmlFor={name}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border bg-white/80 p-4 shadow-xs transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-(--primary-main-200) hover:shadow-md",
        fieldState.error ? "border-(--form-error-main)" : "border-slate-200",
        className,
      )}
    >
      <input
        id={name}
        type="checkbox"
        checked={Boolean(field.value)}
        onChange={(event) => field.onChange(event.target.checked)}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-(--primary-main) focus:ring-(--primary-ring)"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-slate-800">
          {label}
        </span>
        {description ? (
          <span className="block text-sm text-slate-500">{description}</span>
        ) : null}
        {fieldState.error?.message ? (
          <span className="block text-sm text-(--form-error-main)">
            {fieldState.error.message}
          </span>
        ) : null}
      </span>
    </label>
  );
}
