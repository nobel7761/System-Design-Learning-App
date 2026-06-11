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

type SelectOption = {
  label: string;
  value: string;
};

type FormSelectProps = {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  hint?: string;
  className?: string;
};

function ChevronUpDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function FormSelect({
  name,
  label,
  options,
  required,
  hint,
  className,
}: FormSelectProps) {
  const { control, setValue } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const selectedOption = options.find((opt) => opt.value === field.value);
  const displayValue =
    selectedOption?.label ?? options[0]?.label ?? "Select an option";

  return (
    <FormField
      label={label}
      required={required}
      htmlFor={name}
      hint={hint}
      error={fieldState.error?.message}
      className={className}
    >
      <Listbox
        value={field.value ?? ""}
        onChange={(value: string) => {
          field.onChange(value);
          setValue(name, value, { shouldDirty: true, shouldTouch: true });
        }}
      >
        <div className="relative">
          <ListboxButton
            id={name}
            onBlur={field.onBlur}
            className={cn(
              "w-full rounded-xl border bg-white/80 px-4 py-3 text-left text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150",
              "focus:border-slate-400",
              fieldState.error
                ? "border-(--form-error-main) focus:border-(--form-error-main)"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            <span className="block truncate pr-8">{displayValue}</span>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
            </span>
          </ListboxButton>
          <ListboxOptions
            anchor="bottom start"
            className="z-50 mt-1 max-h-60 w-(--button-width) overflow-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xl outline-hidden [--anchor-gap:6px]"
          >
            {options.map((opt) => (
              <ListboxOption
                key={opt.value}
                value={opt.value}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-800 transition-colors data-focus:bg-(--primary-soft) data-focus:text-(--primary-main)"
              >
                {opt.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
      <input
        type="hidden"
        name={field.name}
        ref={field.ref}
        value={field.value ?? ""}
        readOnly
        className={cn("sr-only")}
      />
    </FormField>
  );
}
