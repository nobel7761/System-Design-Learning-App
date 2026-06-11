"use client";

import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";

type FormSliderProps = {
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  className?: string;
};

export function FormSlider({
  name,
  label,
  min = 0,
  max = 100,
  step = 1,
  hint,
  className,
}: FormSliderProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const value = Number(field.value ?? min);

  return (
    <FormField
      label={label}
      hint={hint}
      error={fieldState.error?.message}
      className={className}
    >
      <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">Range</span>
          <span className="font-semibold text-slate-800">{value}</span>
        </div>
        <input
          type="range"
          name={field.name}
          ref={field.ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onBlur={field.onBlur}
          onChange={(event) => field.onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-(--primary-main)"
        />
      </div>
    </FormField>
  );
}
