"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { format, parseISO } from "date-fns";
import CustomButton from "@/components/shared/CustomButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "./utils";

type PlainDateInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  min?: string;
  max?: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const YEAR_END = new Date().getFullYear() + 10;
const YEARS = Array.from(
  { length: YEAR_END - 1900 + 1 },
  (_, idx) => 1900 + idx,
);

export function PlainDateInput({
  value,
  onChange,
  placeholder = "Select date",
  className,
  id,
  disabled,
  readOnly,
  min,
  max,
}: PlainDateInputProps) {
  const selectedDate = value ? parseISO(value) : null;
  const minDate = min ? parseISO(min) : undefined;
  const maxDate = max ? parseISO(max) : undefined;

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date: Date | null) => {
        onChange(date ? format(date, "yyyy-MM-dd") : "");
      }}
      dateFormat="dd MMM yyyy"
      placeholderText={placeholder}
      disabled={disabled || readOnly}
      minDate={minDate}
      maxDate={maxDate}
      id={id}
      wrapperClassName="w-full"
      popperPlacement="bottom-start"
      calendarClassName="form-modern-datepicker"
      popperClassName="form-modern-datepicker-popper"
      renderCustomHeader={({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <CustomButton
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            {"<"}
          </CustomButton>
          <div className="flex items-center gap-2">
            <Listbox value={date.getMonth()} onChange={changeMonth}>
              <div className="relative">
                <ListboxButton className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                  {MONTHS[date.getMonth()]}
                  <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500" />
                </ListboxButton>
                <ListboxOptions className="absolute left-0 z-140 mt-1 max-h-52 w-36 overflow-auto rounded-md border border-slate-200 bg-white p-1 text-xs shadow-xl">
                  {MONTHS.map((month, idx) => (
                    <ListboxOption
                      key={month}
                      value={idx}
                      className="cursor-pointer rounded px-2 py-1 data-focus:bg-(--primary-soft)"
                    >
                      {month}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
            <Listbox value={date.getFullYear()} onChange={changeYear}>
              <div className="relative">
                <ListboxButton className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                  {date.getFullYear()}
                  <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500" />
                </ListboxButton>
                <ListboxOptions className="absolute right-0 z-140 mt-1 max-h-52 w-24 overflow-auto rounded-md border border-slate-200 bg-white p-1 text-xs shadow-xl">
                  {YEARS.map((year) => (
                    <ListboxOption
                      key={year}
                      value={year}
                      className="cursor-pointer rounded px-2 py-1 data-focus:bg-(--primary-soft)"
                    >
                      {year}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>
          <CustomButton
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            {">"}
          </CustomButton>
        </div>
      )}
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xs outline-hidden transition-colors duration-150",
        "hover:border-slate-300 focus:border-slate-400",
        (disabled || readOnly) &&
          "cursor-not-allowed bg-slate-50 text-slate-500",
        className,
      )}
    />
  );
}
