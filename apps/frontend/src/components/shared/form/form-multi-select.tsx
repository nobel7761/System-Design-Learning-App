"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type MultiSelectOption = {
  label: string;
  value: string;
};

type FormMultiSelectProps = {
  name: string;
  label: string;
  options: MultiSelectOption[];
  required?: boolean;
  hint?: string;
  className?: string;
};

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 01-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function FormMultiSelect({
  name,
  label,
  options,
  required,
  hint,
  className,
}: FormMultiSelectProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const selectedValues: string[] = Array.isArray(field.value)
    ? field.value
    : [];
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  const removeSelectedValue = (valueToRemove: string) => {
    field.onChange(selectedValues.filter((value) => value !== valueToRemove));
  };

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={fieldState.error?.message}
      className={className}
    >
      <Listbox value={selectedValues} onChange={field.onChange} multiple>
        <div className="relative">
          <ListboxButton
            className={cn(
              "w-full rounded-xl border bg-white/80 px-4 py-3 text-left text-sm text-slate-900 shadow-xs",
              "outline-hidden transition-all duration-200 focus:-translate-y-0.5 focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)",
              fieldState.error
                ? "border-(--form-error-main)"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            {selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-2 pr-6">
                {selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1.5 rounded-full border border-(--primary-main-200) bg-(--primary-soft) px-2.5 py-1 text-xs font-semibold text-(--primary-main)"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeSelectedValue(option.value);
                      }}
                      className="rounded-full p-0.5 text-(--primary-main) transition hover:bg-(--primary-soft) hover:text-(--primary-main)"
                      aria-label={`Remove ${option.label}`}
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-500">Select one or more options</span>
            )}
          </ListboxButton>
          <ListboxOptions className="z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xl outline-hidden">
            {options.map((option) => (
              <ListboxOption
                key={option.value}
                value={option.value}
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-slate-800 transition-colors data-focus:bg-(--primary-soft) data-selected:bg-(--primary-soft)"
              >
                {option.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
      <p className="mt-2 text-xs text-slate-500">
        {selectedOptions.length}{" "}
        {selectedOptions.length === 1 ? "item" : "items"} selected
      </p>
    </FormField>
  );
}
