"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type FormTagsFieldArrayProps = {
  name: string;
  label: string;
  hint?: string;
  className?: string;
};

export function FormTagsFieldArray({
  name,
  label,
  hint,
  className,
}: FormTagsFieldArrayProps) {
  const { control, register, formState } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const fieldError = formState.errors[name];

  return (
    <FormField
      label={label}
      hint={hint}
      error={
        typeof fieldError?.message === "string" ? fieldError.message : undefined
      }
      className={className}
    >
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white/80 p-4">
        {fields.map((item, index) => (
          <div key={item.id} className="flex gap-2">
            <input
              {...register(`${name}.${index}.value`)}
              placeholder={`Tag ${index + 1}`}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-hidden focus:border-(--primary-main) focus:ring-2 focus:ring-(--primary-ring)"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-lg bg-(--form-error-soft) px-3 text-sm font-semibold text-(--form-error-main) transition hover:opacity-90"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ value: "" })}
          className={cn(
            "rounded-lg bg-(--primary-soft) px-3 py-2 text-sm font-semibold text-(--primary-main) transition hover:opacity-90",
          )}
        >
          + Add Tag
        </button>
      </div>
    </FormField>
  );
}
