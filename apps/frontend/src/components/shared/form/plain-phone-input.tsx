"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import * as FlagIcons from "country-flag-icons/react/3x2";
import type { SVGProps } from "react";
import { PHONE_COUNTRIES_SORTED_AZ } from "@/lib/phone-countries";

const FLAGS = FlagIcons as unknown as Record<
  string,
  (props: SVGProps<SVGSVGElement>) => JSX.Element
>;

export const PLAIN_PHONE_COUNTRY_OPTIONS = PHONE_COUNTRIES_SORTED_AZ.map(
  (c) => ({
    label: `+${c.dial} (${c.iso})`,
    value: `+${c.dial}`,
    countryName: c.name,
    dialCode: `+${c.dial}`,
    iso: c.iso,
  }),
);

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
    return (
      <span className={`text-2xl leading-none ${className ?? ""}`}>🏳️</span>
    );
  return <Flag className={`h-6 w-9 rounded-sm shadow-xs ${className ?? ""}`} />;
}

type PlainPhoneInputProps = {
  codeValue: string;
  numberValue: string;
  onCodeChange: (v: string) => void;
  onNumberChange: (v: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
};

export function PlainPhoneInput({
  codeValue,
  numberValue,
  onCodeChange,
  onNumberChange,
  label,
  required,
  className,
}: PlainPhoneInputProps) {
  const selectedOption =
    PLAIN_PHONE_COUNTRY_OPTIONS.find((o) => o.value === codeValue) ?? null;

  return (
    <div className={className}>
      {label && (
        <span className="block text-xs font-medium text-slate-500 mb-1">
          {label}
          {required && (
            <span className="text-red-500 ml-0.5" aria-hidden>
              *
            </span>
          )}
        </span>
      )}
      <div className="grid grid-cols-[3fr_2fr] gap-3">
        <Listbox value={codeValue} onChange={onCodeChange}>
          <div className="relative">
            <ListboxButton className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-3 pr-8 text-left text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150 focus:border-slate-400">
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  <CountryFlag iso={selectedOption.iso} />
                  <span className="truncate">
                    {selectedOption.dialCode} ({selectedOption.iso})
                  </span>
                </span>
              ) : (
                <span className="truncate text-slate-400">Select country</span>
              )}
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronUpDownIcon className="h-4 w-4 text-slate-400" />
              </span>
            </ListboxButton>
            <ListboxOptions
              anchor="bottom start"
              className="z-50 mt-1 max-h-80 w-[300px] overflow-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xl outline-hidden [--anchor-gap:6px]"
            >
              {PLAIN_PHONE_COUNTRY_OPTIONS.map((option) => (
                <ListboxOption
                  key={`${option.iso}-${option.value}`}
                  value={option.value}
                  className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-slate-800 transition-colors data-focus:bg-(--primary-soft) data-focus:text-(--primary-main)"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <CountryFlag iso={option.iso} className="h-7 w-10" />
                      <span className="truncate">{option.countryName}</span>
                    </div>
                    <span className="shrink-0 text-slate-500">
                      {option.dialCode}
                    </span>
                  </div>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        <input
          type="tel"
          value={numberValue}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder="Phone number"
          autoComplete="off"
          className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150 hover:border-slate-300 focus:border-slate-400"
        />
      </div>
    </div>
  );
}
