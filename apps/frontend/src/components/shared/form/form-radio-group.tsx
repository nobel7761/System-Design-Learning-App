"use client";

import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type RadioOption = {
  label: string;
  value: string;
  description?: string;
};

type FormRadioGroupProps = {
  name: string;
  label: string;
  options: RadioOption[];
  required?: boolean;
  hint?: string;
  className?: string;
};

export function FormRadioGroup({
  name,
  label,
  options,
  required,
  hint,
  className,
}: FormRadioGroupProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={fieldState.error?.message}
      className={className}
    >
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {options.map((option) => {
          const checked = field.value === option.value;
          return (
            <label
              key={option.value}
              className="inline-flex cursor-pointer items-start gap-2.5"
            >
              <input
                type="radio"
                name={field.name}
                value={option.value}
                checked={checked}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  checked ? "border-(--primary-main)" : "border-slate-300",
                )}
                aria-hidden
              >
                {checked && (
                  <span className="h-2 w-2 rounded-full bg-(--primary-main)" />
                )}
              </span>
              <span className="select-none">
                <span className="block text-sm font-medium text-slate-800">
                  {option.label}
                </span>
                {option.description ? (
                  <span className="block text-sm text-slate-500">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </FormField>
  );
}
