"use client";

import { Switch } from "@headlessui/react";
import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type FormSwitchProps = {
  name: string;
  label: string;
  description?: string;
  className?: string;
};

export function FormSwitch({
  name,
  label,
  description,
  className,
}: FormSwitchProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const enabled = Boolean(field.value);

  return (
    <FormField
      label={label}
      error={fieldState.error?.message}
      className={className}
    >
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 p-4">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          {description ? (
            <p className="text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        <Switch
          checked={enabled}
          onChange={field.onChange}
          onBlur={field.onBlur}
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition",
            enabled ? "bg-(--primary-main)" : "bg-slate-300",
          )}
        >
          <span className="sr-only">{label}</span>
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white transition",
              enabled ? "translate-x-6" : "translate-x-1",
            )}
          />
        </Switch>
      </div>
    </FormField>
  );
}
