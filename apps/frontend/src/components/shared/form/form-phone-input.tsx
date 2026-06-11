"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import * as FlagIcons from "country-flag-icons/react/3x2";
import type { SVGProps } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type CountryOption = {
  label?: string;
  countryName?: string;
  flag?: string;
  dialCode?: string;
  iso?: string;
  value: string;
};

const FLAGS = FlagIcons as unknown as Record<
  string,
  (props: SVGProps<SVGSVGElement>) => JSX.Element
>;

type FormPhoneInputProps = {
  codeName: string;
  numberName: string;
  label: string;
  countryOptions: CountryOption[];
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

function CountryFlag({ iso, className }: { iso?: string; className?: string }) {
  const code = iso?.toUpperCase() ?? "";
  const Flag = FLAGS[code];
  if (!Flag)
    return <span className={cn("text-2xl leading-none", className)}>🏳️</span>;
  return <Flag className={cn("h-6 w-9 rounded-sm shadow-xs", className)} />;
}

export function FormPhoneInput({
  codeName,
  numberName,
  label,
  countryOptions,
  required,
  hint,
  className,
}: FormPhoneInputProps) {
  const { control, setValue } = useFormContext();
  const { field: codeField } = useController({ name: codeName, control });
  const { field: numberField, fieldState } = useController({
    name: numberName,
    control,
  });
  const selectedOption =
    countryOptions.find((option) => option.value === codeField.value) ??
    countryOptions[0];

  const selectedCode = selectedOption
    ? (selectedOption.label ??
      `${selectedOption.flag ?? ""} ${selectedOption.dialCode ?? selectedOption.value}`.trim())
    : "";

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={fieldState.error?.message}
      className={className}
    >
      <div className="grid grid-cols-[3fr_2fr] gap-3">
        <Listbox
          value={codeField.value ?? countryOptions[0]?.value ?? ""}
          onChange={(value: string) => {
            codeField.onChange(value);
            setValue(codeName, value, { shouldDirty: true, shouldTouch: true });
          }}
        >
          <div className="relative">
            <ListboxButton
              onBlur={codeField.onBlur}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-3 pr-8 text-left text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150 focus:border-slate-400"
            >
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  <CountryFlag iso={selectedOption.iso} />
                  <span className="truncate">
                    {selectedOption.dialCode ?? selectedOption.value} (
                    {selectedOption.iso ?? ""})
                  </span>
                </span>
              ) : (
                <span className="truncate">{selectedCode}</span>
              )}
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronUpDownIcon className="h-4 w-4 text-slate-400" />
              </span>
            </ListboxButton>
            <ListboxOptions
              anchor="bottom start"
              className="z-50 mt-1 max-h-80 w-[300px] overflow-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xl outline-hidden [--anchor-gap:6px]"
            >
              {countryOptions.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-slate-800 transition-colors data-focus:bg-(--primary-soft) data-focus:text-(--primary-main)"
                >
                  {option.countryName && option.dialCode ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <CountryFlag iso={option.iso} className="h-7 w-10" />
                        <span className="truncate">{option.countryName}</span>
                      </div>
                      <span className="shrink-0 text-slate-500">
                        {option.dialCode}
                      </span>
                    </div>
                  ) : (
                    (option.label ?? option.value)
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        <input
          type="hidden"
          name={codeField.name}
          ref={codeField.ref}
          value={codeField.value ?? ""}
          readOnly
        />
        <input
          {...numberField}
          type="tel"
          placeholder="1XXXXXXXXX"
          autoComplete="off"
          className={cn(
            "rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150",
            "focus:border-slate-400",
            fieldState.error
              ? "border-(--form-error-main)"
              : "border-slate-200 hover:border-slate-300",
          )}
        />
      </div>
    </FormField>
  );
}
