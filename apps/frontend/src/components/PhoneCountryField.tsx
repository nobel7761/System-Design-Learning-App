"use client";

import { useId, useMemo } from "react";
import {
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import {
  PHONE_COUNTRIES_SORTED_AZ,
  buildE164,
  findCountryByIso,
  flagEmoji,
  parseInternationalNumber,
} from "@/lib/phone-countries";

/** Full E.164-style string for the input (+880…), editable character-by-character. */
function inputDisplayE164(value: string): string {
  const p = parseInternationalNumber(value);
  if (p.e164 === "+" || p.e164 === "") return "";
  return p.e164;
}

function outerClassName(hasError: boolean): string {
  return [
    "flex w-full min-h-[42px] items-stretch rounded-lg border bg-white text-sm text-slate-900 shadow-xs transition",
    "focus-within:outline-hidden focus-within:ring-2 focus-within:ring-offset-0",
    hasError
      ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-200"
      : "border-slate-300 hover:border-slate-400 focus-within:border-slate-400 focus-within:ring-slate-200",
  ].join(" ");
}

export function PhoneCountryField({
  id: idProp,
  label,
  required,
  value,
  onChange,
  hasError,
  errorMessage,
}: {
  id?: string;
  label: React.ReactNode;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}) {
  const reactId = useId();
  const inputId = idProp ?? `phone-national-${reactId}`;

  const parsed = useMemo(() => parseInternationalNumber(value), [value]);
  const selectedIso = parsed.country?.iso ?? "";
  const selectedCountry = selectedIso ? findCountryByIso(selectedIso) : null;

  const inputDisplay = useMemo(() => inputDisplayE164(value), [value]);

  function handleInputChange(raw: string) {
    const compact = raw.replace(/\s/g, "");
    if (!compact) {
      onChange("");
      return;
    }
    let s = compact;
    if (!s.startsWith("+")) {
      const digitsOnly = s.replace(/\D/g, "");
      if (!digitsOnly) {
        onChange("");
        return;
      }
      const prev = parseInternationalNumber(value);
      const iso = prev.country?.iso;
      if (iso) {
        onChange(buildE164(iso, digitsOnly));
        return;
      }
      s = `+${digitsOnly}`;
    } else {
      s = `+${s.slice(1).replace(/\D/g, "")}`;
    }
    if (s === "+" || s === "") {
      onChange("");
      return;
    }
    const p = parseInternationalNumber(s);
    onChange(p.e164 === "+" ? "" : p.e164);
  }

  function handleCountryChange(newIso: string) {
    if (!newIso) {
      onChange("");
      return;
    }
    const n = parseInternationalNumber(value).nationalDigits;
    onChange(buildE164(newIso, n));
  }

  return (
    <Field className="block w-full">
      <Label className="block text-sm font-medium text-slate-700 mb-1.5">
        <span>{label}</span>
        {required ? (
          <span className="text-red-500 ml-0.5" aria-hidden>
            *
          </span>
        ) : null}
      </Label>

      <div className={outerClassName(!!hasError)}>
        <Listbox value={selectedIso} onChange={handleCountryChange}>
          <div className="relative flex shrink-0 items-stretch">
            <ListboxButton
              type="button"
              className="flex min-w-12 cursor-default items-center rounded-l-lg border-0 bg-transparent py-2 pl-3 pr-2 text-left outline-hidden focus:outline-hidden data-hover:bg-slate-50/80 data-open:bg-slate-50/80"
              aria-label="Country"
            >
              {selectedCountry ? (
                <span
                  className="text-xl leading-none"
                  aria-hidden
                  title={selectedCountry.name}
                >
                  {flagEmoji(selectedCountry.iso)}
                </span>
              ) : (
                <span
                  className="text-xl leading-none text-slate-400"
                  aria-hidden
                  title="Select country"
                >
                  🌐
                </span>
              )}
            </ListboxButton>
            <ListboxOptions
              anchor="bottom start"
              transition
              modal={false}
              className="z-100 mt-1 max-h-[min(22rem,70vh)] w-[min(100vw-2rem,22rem)] min-w-70 overflow-x-hidden overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg outline-solid outline-1 outline-black/5 [--anchor-gap:6px] data-closed:opacity-0 sm:min-w-[20rem]"
            >
              <ListboxOption
                value=""
                className="relative w-full cursor-default select-none py-2 pl-3 pr-3 text-left text-sm text-slate-500 data-focus:bg-slate-50"
              >
                <span className="block">Select country</span>
              </ListboxOption>
              {PHONE_COUNTRIES_SORTED_AZ.map((c) => (
                <ListboxOption
                  key={c.iso}
                  value={c.iso}
                  className="relative flex w-full cursor-default select-none items-center gap-2.5 py-2.5 pl-3 pr-3 text-left text-sm data-focus:bg-slate-100"
                >
                  <span
                    className="shrink-0 text-[1.125rem] leading-none"
                    aria-hidden
                  >
                    {flagEmoji(c.iso)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-normal text-slate-800">
                    {c.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-700">
                    +{c.dial}
                  </span>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>

        <div
          className="my-2 w-px shrink-0 self-stretch bg-slate-200"
          aria-hidden
        />

        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="min-w-0 flex-1 rounded-r-lg border-0 bg-transparent py-2 pr-3 text-sm text-slate-900 outline-hidden ring-0 placeholder:text-slate-400 focus:ring-0"
          placeholder={
            selectedIso ? "Phone number" : "Number or full +country code"
          }
          value={inputDisplay}
          onChange={(e) => handleInputChange(e.target.value)}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={errorMessage ? `${inputId}-err` : undefined}
        />
      </div>

      {errorMessage ? (
        <p id={`${inputId}-err`} className="mt-1.5 text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </Field>
  );
}
