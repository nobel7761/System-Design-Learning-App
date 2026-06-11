"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { cn } from "./utils";

type PlainSelectOption = {
  value: string;
  label: string;
};

type PlainSelectGroup = {
  label: string;
  options: PlainSelectOption[];
};

type PlainSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options?: PlainSelectOption[];
  groups?: PlainSelectGroup[];
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
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

const allOptions = (
  options?: PlainSelectOption[],
  groups?: PlainSelectGroup[],
): PlainSelectOption[] => [
  ...(options ?? []),
  ...(groups ?? []).flatMap((g) => g.options),
];

export function PlainSelect({
  value,
  onChange,
  options,
  groups,
  placeholder,
  className,
  id,
  disabled,
}: PlainSelectProps) {
  const flat = allOptions(options, groups);
  const selected = flat.find((o) => o.value === value);
  const displayValue = selected?.label ?? placeholder ?? "Select an option";

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={cn("relative", className)}>
        <ListboxButton
          id={id}
          className={cn(
            "w-full rounded-xl border bg-white px-4 py-3 text-left text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150",
            "border-slate-200 hover:border-slate-300 focus:border-slate-400",
            disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
          )}
        >
          <span
            className={cn(
              "block truncate pr-8",
              !selected && placeholder && "text-slate-400",
            )}
          >
            {displayValue}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
          </span>
        </ListboxButton>

        <ListboxOptions
          anchor="bottom start"
          className="z-50 mt-1 max-h-60 w-(--button-width) overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl outline-hidden [--anchor-gap:6px]"
        >
          {placeholder && (
            <ListboxOption
              value=""
              disabled
              className="cursor-default rounded-lg px-3 py-2 text-sm text-slate-400 select-none"
            >
              {placeholder}
            </ListboxOption>
          )}
          {groups
            ? groups.map((group) => (
                <div key={group.label}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {group.label}
                  </div>
                  {group.options.map((opt) => (
                    <ListboxOption
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-800 transition-colors data-focus:bg-(--primary-soft) data-focus:text-(--primary-main)"
                    >
                      {opt.label}
                    </ListboxOption>
                  ))}
                </div>
              ))
            : options?.map((opt) => (
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
  );
}
