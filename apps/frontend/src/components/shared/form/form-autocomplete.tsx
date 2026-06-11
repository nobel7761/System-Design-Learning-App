"use client";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type AutoOption = {
  label: string;
  value: string;
};

type FormAutocompleteProps = {
  name: string;
  label: string;
  options: AutoOption[];
  required?: boolean;
  hint?: string;
  className?: string;
};

export function FormAutocomplete({
  name,
  label,
  options,
  required,
  hint,
  className,
}: FormAutocompleteProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    );
  }, [query, options]);

  const selected =
    options.find((option) => option.value === field.value) ?? null;

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={fieldState.error?.message}
      className={className}
    >
      <Combobox
        value={selected}
        onChange={(option: AutoOption | null) =>
          field.onChange(option?.value ?? "")
        }
      >
        <div className="relative">
          <ComboboxInput
            onBlur={field.onBlur}
            displayValue={(option: AutoOption | null) => option?.label ?? ""}
            onChange={(event) => setQuery(event.target.value)}
            className={cn(
              "w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-xs outline-hidden transition-all",
              "focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)",
              fieldState.error
                ? "border-(--form-error-main)"
                : "border-slate-200 hover:border-slate-300",
            )}
            placeholder="Search and select..."
          />
          <ComboboxOptions className="z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xl outline-hidden">
            {filtered.length ? (
              filtered.map((option) => (
                <ComboboxOption
                  key={option.value}
                  value={option}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-800 transition-colors data-focus:bg-(--primary-soft)"
                >
                  {option.label}
                </ComboboxOption>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">
                No matches found.
              </p>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </FormField>
  );
}
