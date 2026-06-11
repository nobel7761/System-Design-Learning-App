"use client";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type Option = { label: string; value: string };
type TreeNode = { label: string; value: string; children?: TreeNode[] };
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
const YEAR_END = new Date().getFullYear() + 10;
const YEARS = Array.from(
  { length: YEAR_END - 1900 + 1 },
  (_, idx) => 1900 + idx,
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

export function FormDateRangeInput({
  startName,
  endName,
  label,
}: {
  startName: string;
  endName: string;
  label: string;
}) {
  const { control } = useFormContext();
  const { field: start } = useController({ name: startName, control });
  const { field: end, fieldState } = useController({ name: endName, control });
  const startDate = start.value ? new Date(start.value) : null;
  const endDate = end.value ? new Date(end.value) : null;
  return (
    <FormField label={label} error={fieldState.error?.message}>
      <div className="grid gap-3 sm:grid-cols-2">
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) =>
            start.onChange(date ? format(date, "yyyy-MM-dd") : "")
          }
          onBlur={start.onBlur}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start date"
          dateFormat="dd MMM yyyy"
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
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-(--primary-soft) disabled:opacity-40"
              >
                {"<"}
              </button>
              <div className="flex items-center gap-2">
                <Listbox value={date.getMonth()} onChange={changeMonth}>
                  <div className="relative">
                    <ListboxButton className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                      {MONTHS[date.getMonth()]}
                      <ChevronUpDownIcon className="h-3.5 w-3.5 text-slate-500" />
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
                      <ChevronUpDownIcon className="h-3.5 w-3.5 text-slate-500" />
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
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-(--primary-soft) disabled:opacity-40"
              >
                {">"}
              </button>
            </div>
          )}
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
        />
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) =>
            end.onChange(date ? format(date, "yyyy-MM-dd") : "")
          }
          onBlur={end.onBlur}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate ?? undefined}
          placeholderText="End date"
          dateFormat="dd MMM yyyy"
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
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-(--primary-soft) disabled:opacity-40"
              >
                {"<"}
              </button>
              <div className="flex items-center gap-2">
                <Listbox value={date.getMonth()} onChange={changeMonth}>
                  <div className="relative">
                    <ListboxButton className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                      {MONTHS[date.getMonth()]}
                      <ChevronUpDownIcon className="h-3.5 w-3.5 text-slate-500" />
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
                      <ChevronUpDownIcon className="h-3.5 w-3.5 text-slate-500" />
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
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-(--primary-soft) disabled:opacity-40"
              >
                {">"}
              </button>
            </div>
          )}
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
        />
      </div>
    </FormField>
  );
}

export function FormRichText({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  return (
    <FormField label={label} error={fieldState.error?.message}>
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => field.onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: field.value ?? "" }}
        className="min-h-28 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
      />
    </FormField>
  );
}

export function FormCurrencyInput({
  name,
  label,
  currency = "USD",
}: {
  name: string;
  label: string;
  currency?: string;
}) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  return (
    <FormField label={label} error={fieldState.error?.message}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          {currency}
        </span>
        <input
          value={field.value ?? ""}
          onBlur={field.onBlur}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d.]/g, "");
            const [a, b] = raw.split(".");
            const int = a ? Number(a).toLocaleString() : "";
            field.onChange(b !== undefined ? `${int}.${b.slice(0, 2)}` : int);
          }}
          className="w-full rounded-xl border border-slate-200 bg-white/80 py-3 pl-16 pr-4 text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
          placeholder="1,000.00"
        />
      </div>
    </FormField>
  );
}

export function FormMaskedInput({
  name,
  label,
  mask = "XXX-XXX-XXXX",
}: {
  name: string;
  label: string;
  mask?: string;
}) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  return (
    <FormField
      label={label}
      hint={`Mask: ${mask}`}
      error={fieldState.error?.message}
    >
      <input
        {...field}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
          const chunks = [
            digits.slice(0, 3),
            digits.slice(3, 6),
            digits.slice(6, 10),
          ].filter(Boolean);
          field.onChange(chunks.join("-"));
        }}
        className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
        placeholder="123-456-7890"
      />
    </FormField>
  );
}

export function FormPercentUnitInput({
  percentName,
  unitName,
  label,
  units,
}: {
  percentName: string;
  unitName: string;
  label: string;
  units: Option[];
}) {
  const { control } = useFormContext();
  const { field: percent } = useController({ name: percentName, control });
  const { field: unit } = useController({ name: unitName, control });
  const selectedUnit =
    units.find((u) => u.value === unit.value)?.label ?? units[0]?.label ?? "";
  return (
    <FormField label={label}>
      <div className="grid grid-cols-[1fr_130px] gap-3">
        <div className="relative">
          <input
            type="number"
            min={0}
            max={100}
            {...percent}
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 pr-8 text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            %
          </span>
        </div>
        <Listbox
          value={unit.value ?? units[0]?.value ?? ""}
          onChange={(value: string) => unit.onChange(value)}
        >
          <div className="relative">
            <ListboxButton
              onBlur={unit.onBlur}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-3 pr-8 text-left text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
            >
              {selectedUnit}
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronUpDownIcon className="h-4 w-4 text-slate-400" />
              </span>
            </ListboxButton>
            <ListboxOptions className="z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl outline-hidden">
              {units.map((u) => (
                <ListboxOption
                  key={u.value}
                  value={u.value}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm data-focus:bg-(--primary-soft)"
                >
                  {u.label}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
    </FormField>
  );
}

export function FormRatingInput({
  name,
  label,
  max = 5,
}: {
  name: string;
  label: string;
  max?: number;
}) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const value = Number(field.value ?? 0);
  return (
    <FormField label={label}>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => field.onChange(idx + 1)}
            className={cn(
              "text-2xl transition",
              idx < value ? "text-(--form-warning-main)" : "text-slate-300",
            )}
          >
            ★
          </button>
        ))}
      </div>
    </FormField>
  );
}

export function FormColorInput({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  return (
    <FormField label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          {...field}
          className="h-10 w-14 rounded border border-slate-200 bg-white"
        />
        <input
          {...field}
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
        />
      </div>
    </FormField>
  );
}

export function FormUrlInput({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  return (
    <FormField label={label}>
      <input
        type="url"
        {...field}
        placeholder="https://example.com"
        className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
      />
      {field.value ? (
        <a
          href={field.value}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-xs text-(--primary-main) underline"
        >
          Preview link
        </a>
      ) : null}
    </FormField>
  );
}

export function FormAdvancedFileUpload({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const files: File[] = Array.isArray(field.value) ? field.value : [];
  return (
    <FormField label={label}>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4">
        <input
          type="file"
          multiple
          onChange={(e) => field.onChange(Array.from(e.target.files ?? []))}
          className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-(--primary-soft) file:px-3 file:py-2 file:text-(--primary-main)"
        />
        {files.length ? (
          <div className="mt-3 space-y-2">
            {files.map((file) => (
              <div
                key={file.name}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
              >
                {file.name} - {(file.size / 1024).toFixed(1)} KB
                <div className="mt-1 h-1.5 rounded bg-slate-100">
                  <div className="h-full w-full rounded bg-(--form-success-main)" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </FormField>
  );
}

export function FormAsyncSelect({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: Option[];
}) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Option[]>(options);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setList(
        options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        ),
      );
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query, options]);
  const selected = options.find((o) => o.value === field.value) ?? null;
  return (
    <FormField
      label={label}
      hint={loading ? "Loading options..." : "Async search enabled"}
    >
      <Combobox
        value={selected}
        onChange={(o: Option | null) => field.onChange(o?.value ?? "")}
      >
        <div className="relative">
          <ComboboxInput
            displayValue={(o: Option | null) => o?.label ?? ""}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
          />
          <ComboboxOptions className="z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
            {list.map((o) => (
              <ComboboxOption
                key={o.value}
                value={o}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm data-focus:bg-(--primary-soft)"
              >
                {o.label}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
    </FormField>
  );
}

export function FormCreatableSelect({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const [draft, setDraft] = useState("");
  const values: string[] = Array.isArray(field.value) ? field.value : [];
  return (
    <FormField label={label} hint="Press Add to create new option">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
          placeholder="Type new tag/option"
        />
        <button
          type="button"
          onClick={() => {
            if (!draft.trim()) return;
            field.onChange([...values, draft.trim()]);
            setDraft("");
          }}
          className="rounded-xl bg-(--primary-main) px-4 py-2 text-sm font-semibold text-(--primary-contrast)"
        >
          Add
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => field.onChange(values.filter((x) => x !== v))}
            className="rounded-full border border-(--primary-main-200) bg-(--primary-soft) px-3 py-1 text-xs font-semibold text-(--primary-main)"
          >
            {v} ×
          </button>
        ))}
      </div>
    </FormField>
  );
}

export function FormTreeSelect({
  name,
  label,
  nodes,
}: {
  name: string;
  label: string;
  nodes: TreeNode[];
}) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const selected: string[] = Array.isArray(field.value) ? field.value : [];
  const toggle = (value: string) =>
    field.onChange(
      selected.includes(value)
        ? selected.filter((x) => x !== value)
        : [...selected, value],
    );
  const renderNode = (node: TreeNode, level = 0) => (
    <div key={node.value} className={cn("space-y-2", level > 0 && "ml-6")}>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={selected.includes(node.value)}
          onChange={() => toggle(node.value)}
        />
        {node.label}
      </label>
      {node.children?.map((child) => renderNode(child, level + 1))}
    </div>
  );
  return (
    <FormField label={label}>
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white/80 p-4">
        {nodes.map((n) => renderNode(n))}
      </div>
    </FormField>
  );
}

export function FormSignaturePad({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const getPos = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  return (
    <FormField label={label}>
      <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
        <canvas
          ref={canvasRef}
          width={500}
          height={140}
          className="w-full rounded border border-slate-200 bg-white"
          onMouseDown={(e) => {
            setDrawing(true);
            const ctx = e.currentTarget.getContext("2d");
            if (!ctx) return;
            const p = getPos(e);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
          }}
          onMouseMove={(e) => {
            if (!drawing) return;
            const ctx = e.currentTarget.getContext("2d");
            if (!ctx) return;
            const p = getPos(e);
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#4f46e5";
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            field.onChange(e.currentTarget.toDataURL("image/png"));
          }}
          onMouseUp={() => setDrawing(false)}
          onMouseLeave={() => setDrawing(false)}
        />
        <button
          type="button"
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            field.onChange("");
          }}
          className="mt-2 text-xs font-semibold text-(--primary-main)"
        >
          Clear signature
        </button>
      </div>
    </FormField>
  );
}

export function FormAddressAutocomplete({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: Option[];
}) {
  return <FormAsyncSelect name={name} label={label} options={options} />;
}

export function FormMapPicker({
  latName,
  lngName,
  label,
}: {
  latName: string;
  lngName: string;
  label: string;
}) {
  const { control } = useFormContext();
  const { field: lat } = useController({ name: latName, control });
  const { field: lng } = useController({ name: lngName, control });
  return (
    <FormField label={label}>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white/80 p-4">
        <button
          type="button"
          className="h-28 w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"
          onClick={() => {
            lat.onChange("23.8103");
            lng.onChange("90.4125");
          }}
        >
          Click mock map to pin Dhaka
        </button>
        <div className="grid grid-cols-2 gap-3">
          <input
            {...lat}
            placeholder="Latitude"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            {...lng}
            placeholder="Longitude"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </FormField>
  );
}

export function FormRecurringSchedule({
  frequencyName,
  intervalName,
  daysName,
  label,
}: {
  frequencyName: string;
  intervalName: string;
  daysName: string;
  label: string;
}) {
  const { control } = useFormContext();
  const { field: frequency } = useController({ name: frequencyName, control });
  const { field: interval } = useController({ name: intervalName, control });
  const { field: days } = useController({ name: daysName, control });
  const selected: string[] = Array.isArray(days.value) ? days.value : [];
  const frequencyOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];
  const selectedFrequency =
    frequencyOptions.find((f) => f.value === frequency.value)?.label ??
    frequencyOptions[0].label;
  const week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <FormField label={label}>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white/80 p-4">
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <Listbox
            value={frequency.value ?? "daily"}
            onChange={(value: string) => frequency.onChange(value)}
          >
            <div className="relative">
              <ListboxButton
                onBlur={frequency.onBlur}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-left text-sm outline-hidden focus:border-(--primary-main) focus:ring-4 focus:ring-(--primary-ring)"
              >
                {selectedFrequency}
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <ChevronUpDownIcon className="h-4 w-4 text-slate-400" />
                </span>
              </ListboxButton>
              <ListboxOptions className="z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl outline-hidden">
                {frequencyOptions.map((option) => (
                  <ListboxOption
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer rounded-md px-3 py-2 text-sm data-focus:bg-(--primary-soft)"
                  >
                    {option.label}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
          <input
            type="number"
            min={1}
            {...interval}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {week.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() =>
                days.onChange(
                  selected.includes(d)
                    ? selected.filter((x) => x !== d)
                    : [...selected, d],
                )
              }
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                selected.includes(d)
                  ? "bg-(--primary-soft) text-(--primary-main)"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </FormField>
  );
}
