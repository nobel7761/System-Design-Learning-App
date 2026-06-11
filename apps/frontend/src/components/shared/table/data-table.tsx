"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlainInput } from "@/components/shared/form";
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  SortingState,
  VisibilityState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  ColumnOrderState,
  ColumnSizingState,
  useReactTable,
} from "@tanstack/react-table";

// ---------------------------------------------------------------------------
// Column meta type augmentation
// ---------------------------------------------------------------------------

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    type?: "email" | "enum";
  }
}

type RowActions<TData> = {
  show?: {
    view?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
};

// ---------------------------------------------------------------------------
// Smart cell helpers
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ENUM_COLORS: Record<string, { bg: string; text: string }> = {
  paid: { bg: "bg-emerald-100", text: "text-emerald-700" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700" },
  success: { bg: "bg-emerald-100", text: "text-emerald-700" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-700" },
  enabled: { bg: "bg-emerald-100", text: "text-emerald-700" },
  pending: { bg: "bg-amber-100", text: "text-amber-700" },
  processing: { bg: "bg-amber-100", text: "text-amber-700" },
  draft: { bg: "bg-amber-100", text: "text-amber-700" },
  review: { bg: "bg-amber-100", text: "text-amber-700" },
  failed: { bg: "bg-rose-100", text: "text-rose-700" },
  error: { bg: "bg-rose-100", text: "text-rose-700" },
  rejected: { bg: "bg-rose-100", text: "text-rose-700" },
  cancelled: { bg: "bg-rose-100", text: "text-rose-700" },
  canceled: { bg: "bg-rose-100", text: "text-rose-700" },
  inactive: { bg: "bg-slate-100", text: "text-slate-600" },
  refunded: { bg: "bg-slate-100", text: "text-slate-600" },
  expired: { bg: "bg-slate-100", text: "text-slate-600" },
  archived: { bg: "bg-slate-100", text: "text-slate-600" },
};

const ENUM_FALLBACK_PALETTE: Array<{ bg: string; text: string }> = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
];

function enumColor(value: string): { bg: string; text: string } {
  const key = value.toLowerCase().replace(/[\s_-]+/g, "");
  if (ENUM_COLORS[key]) return ENUM_COLORS[key];
  let hash = 0;
  for (let i = 0; i < value.length; i++)
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return ENUM_FALLBACK_PALETTE[hash % ENUM_FALLBACK_PALETTE.length];
}

function EmailText({ value }: { value: string }) {
  return <span className="font-medium text-blue-700">{value}</span>;
}

function EnumChip({ value }: { value: string }) {
  const { bg, text } = enumColor(value);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      {value}
    </span>
  );
}

type DataTableProps<TData> = {
  tableId: string;
  title?: string;
  description?: string;
  columns: ColumnDef<TData, any>[];
  data: TData[];
  loading?: boolean;
  emptyMessage?: string;
  initialPageSize?: number;
  enableColumnFilters?: boolean;
  enableExport?: boolean;
  getRowId?: (row: TData, index: number) => string;
  onBulkDeleteSelected?: (rows: TData[]) => void | Promise<void>;
  enableBulkDelete?: boolean;
  syncStateToUrl?: boolean;
  enableSavedViews?: boolean;
  serverSide?: boolean;
  totalRows?: number;
  onQueryChange?: (query: {
    sorting: SortingState;
    globalFilter: string;
    columnFilters: ColumnFiltersState;
    pagination: PaginationState;
  }) => void;
  rowActions?: RowActions<TData>;
};

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function DtTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group/dtt">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover/dtt:opacity-100 transition-opacity duration-150">
        <div className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800" />
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
      />
    </svg>
  );
}

function ColumnsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5h16M4 12h16M4 19h16M8 5v14m8-14v14"
      />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M7 12h10m-7 6h4"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 20h14"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7h16M10 11v6m4-6v6M6 7l1 12h10l1-12M9 7V4h6v3"
      />
    </svg>
  );
}

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
        d="M10 3a1 1 0 0 1 .707.293l3 3a1 1 0 1 1-1.414 1.414L10 5.414 7.707 7.707a1 1 0 0 1-1.414-1.414l3-3A1 1 0 0 1 10 3Zm-3.707 9.293a1 1 0 0 1 1.414 0L10 14.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m15 18-6-6 6-6"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m9 18 6-6-6-6"
      />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

function EyeActionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function PencilActionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function toCsvSafe(value: unknown): string {
  const raw =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

function makeCsv<TData>(
  rows: TData[],
  visibleColumns: {
    id: string;
    header: string;
    read: (row: TData) => unknown;
  }[],
): string {
  const header = visibleColumns.map((c) => toCsvSafe(c.header)).join(",");
  const body = rows
    .map((row) => visibleColumns.map((c) => toCsvSafe(c.read(row))).join(","))
    .join("\r\n");
  return `${header}\r\n${body}`;
}

function downloadTextFile(fileName: string, content: string): void {
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTable<TData>({
  tableId,
  title,
  description,
  columns,
  data,
  loading = false,
  emptyMessage = "No rows found.",
  initialPageSize = 10,
  enableColumnFilters = true,
  enableExport = true,
  getRowId,
  onBulkDeleteSelected,
  enableBulkDelete = true,
  syncStateToUrl = true,
  enableSavedViews = true,
  serverSide = false,
  totalRows: totalRowsProp,
  onQueryChange,
  rowActions,
}: DataTableProps<TData>) {
  const storageKey = `crm-data-table:${tableId}`;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });
  const [rowSelection, setRowSelection] = useState({});
  const [showSelectColumn, setShowSelectColumn] = useState(false);
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [bulkDeleteBusy, setBulkDeleteBusy] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState("");
  const [savedViews, setSavedViews] = useState<string[]>([]);
  const [viewNameInput, setViewNameInput] = useState("");
  const [selectedSavedView, setSelectedSavedView] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const columnsMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const prevQuerySnapshotRef = useRef<string | null>(null);

  const rowActionsRef = useRef(rowActions);
  rowActionsRef.current = rowActions;
  const hasView = rowActions?.show?.view ?? !!rowActions?.onView;
  const hasEdit = rowActions?.show?.edit ?? !!rowActions?.onEdit;
  const hasDelete = rowActions?.show?.delete ?? !!rowActions?.onDelete;

  const actionColumns = useMemo((): ColumnDef<TData, unknown>[] => {
    if (!hasView && !hasEdit && !hasDelete) return [];
    return [
      {
        id: "__dt_actions",
        header: "Actions",
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            {hasView && (
              <button
                type="button"
                onClick={() => rowActionsRef.current?.onView?.(row.original)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-150"
                title="View"
                aria-label="View"
              >
                <EyeActionIcon className="w-[17px] h-[17px]" />
              </button>
            )}
            {hasEdit && (
              <button
                type="button"
                onClick={() => rowActionsRef.current?.onEdit?.(row.original)}
                className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all duration-150"
                title="Edit"
                aria-label="Edit"
              >
                <PencilActionIcon className="w-[17px] h-[17px]" />
              </button>
            )}
            {hasDelete && (
              <button
                type="button"
                onClick={() => rowActionsRef.current?.onDelete?.(row.original)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150"
                title="Delete"
                aria-label="Delete"
              >
                <TrashIcon className="w-[17px] h-[17px]" />
              </button>
            )}
          </div>
        ),
      },
    ];
  }, [hasView, hasEdit, hasDelete]);

  const allColumns = useMemo(
    () => [...columns, ...actionColumns],
    [columns, actionColumns],
  );

  useEffect(() => {
    if (globalFilter === "") {
      setDebouncedGlobalFilter("");
      return;
    }
    const timer = window.setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [globalFilter]);

  useEffect(() => {
    if (searchOpen) {
      const t = window.setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!enableSavedViews || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`${storageKey}:saved-views`);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setSavedViews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSavedViews([]);
    }
  }, [enableSavedViews, storageKey]);

  function saveCurrentView(name: string): void {
    const trimmed = name.trim();
    if (!trimmed || typeof window === "undefined") return;
    const payload = {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      columnPinning,
      columnOrder,
      columnSizing,
      pageSize: pagination.pageSize,
    };
    window.localStorage.setItem(
      `${storageKey}:view:${trimmed}`,
      JSON.stringify(payload),
    );
    const next = Array.from(new Set([trimmed, ...savedViews]));
    setSavedViews(next);
    window.localStorage.setItem(
      `${storageKey}:saved-views`,
      JSON.stringify(next),
    );
    setViewNameInput("");
  }

  function applySavedView(name: string): void {
    if (!name || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`${storageKey}:view:${name}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        columnVisibility?: VisibilityState;
        columnPinning?: ColumnPinningState;
        columnOrder?: ColumnOrderState;
        columnSizing?: ColumnSizingState;
      };
      setColumnVisibility(parsed.columnVisibility ?? {});
      setColumnPinning(parsed.columnPinning ?? { left: [], right: [] });
      setColumnOrder(parsed.columnOrder ?? []);
      setColumnSizing(parsed.columnSizing ?? {});
    } catch {
      // Ignore malformed saved views.
    }
  }

  function deleteSavedView(name: string): void {
    if (!name || typeof window === "undefined") return;
    window.localStorage.removeItem(`${storageKey}:view:${name}`);
    const next = savedViews.filter((view) => view !== name);
    setSavedViews(next);
    window.localStorage.setItem(
      `${storageKey}:saved-views`,
      JSON.stringify(next),
    );
    if (selectedSavedView === name) {
      setSelectedSavedView("");
    }
  }

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      globalFilter: debouncedGlobalFilter,
      columnFilters,
      columnVisibility,
      columnOrder,
      columnSizing,
      rowSelection,
      columnPinning,
      pagination,
    },
    getRowId,
    enableRowSelection: true,
    onSortingChange: (updater) =>
      setSorting((old) => functionalUpdate(updater, old)),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: (updater) =>
      setColumnFilters((old) => functionalUpdate(updater, old)),
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility((old) => functionalUpdate(updater, old)),
    onColumnOrderChange: (updater) =>
      setColumnOrder((old) => functionalUpdate(updater, old)),
    onColumnSizingChange: (updater) =>
      setColumnSizing((old) => functionalUpdate(updater, old)),
    onRowSelectionChange: setRowSelection,
    onColumnPinningChange: (updater) =>
      setColumnPinning((old) => functionalUpdate(updater, old)),
    onPaginationChange: (updater) =>
      setPagination((old) => functionalUpdate(updater, old)),
    globalFilterFn: "includesString",
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
    getPaginationRowModel: serverSide ? undefined : getPaginationRowModel(),
    pageCount:
      serverSide && typeof totalRowsProp === "number"
        ? Math.ceil(totalRowsProp / Math.max(pagination.pageSize, 1))
        : undefined,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  });

  useEffect(() => {
    if (!syncStateToUrl) return;
    const currentQuery = searchParams.toString();
    const next = new URLSearchParams(searchParams.toString());
    const prefix = `t_${tableId}_`;
    const put = (key: string, value: string) => {
      if (!value) next.delete(`${prefix}${key}`);
      else next.set(`${prefix}${key}`, value);
    };
    put("q", debouncedGlobalFilter);
    put("p", String(pagination.pageIndex + 1));
    put("ps", String(pagination.pageSize));
    put(
      "s",
      sorting.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join("|"),
    );
    const query = next.toString();
    if (query === currentQuery) return;
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [
    syncStateToUrl,
    searchParams,
    tableId,
    debouncedGlobalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    router,
    pathname,
  ]);

  useEffect(() => {
    if (!syncStateToUrl) return;
    const prefix = `t_${tableId}_`;
    const q = searchParams.get(`${prefix}q`);
    const p = searchParams.get(`${prefix}p`);
    const ps = searchParams.get(`${prefix}ps`);
    const s = searchParams.get(`${prefix}s`);
    if (q !== null) setGlobalFilter(q);
    if (p && Number.isFinite(Number(p))) {
      const nextPage = Math.max(Number(p) - 1, 0);
      setPagination((old) => ({ ...old, pageIndex: nextPage }));
    }
    if (ps && Number.isFinite(Number(ps))) {
      const nextSize = Math.max(Number(ps), 1);
      setPagination((old) => ({ ...old, pageSize: nextSize }));
    }
    if (s) {
      const parsedSorting: SortingState = s
        .split("|")
        .map((item) => {
          const [id, dir] = item.split(":");
          return { id, desc: dir === "desc" };
        })
        .filter((item) => item.id);
      setSorting(parsedSorting);
    }
  }, [syncStateToUrl, searchParams, tableId]);

  useEffect(() => {
    if (!onQueryChange) return;
    const snapshot = JSON.stringify({
      sorting,
      f: debouncedGlobalFilter,
      columnFilters,
      pagination,
    });
    if (
      prevQuerySnapshotRef.current === null ||
      prevQuerySnapshotRef.current === snapshot
    ) {
      prevQuerySnapshotRef.current = snapshot;
      return;
    }
    prevQuerySnapshotRef.current = snapshot;
    onQueryChange({
      sorting,
      globalFilter: debouncedGlobalFilter,
      columnFilters,
      pagination,
    });
  }, [
    onQueryChange,
    sorting,
    debouncedGlobalFilter,
    columnFilters,
    pagination,
  ]);

  useEffect(() => {
    if (!columnsMenuOpen) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (columnsMenuRef.current?.contains(target)) return;
      setColumnsMenuOpen(false);
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setColumnsMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [columnsMenuOpen]);

  useEffect(() => {
    if (!exportMenuOpen) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (exportMenuRef.current?.contains(target)) return;
      setExportMenuOpen(false);
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setExportMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [exportMenuOpen]);

  const exportableColumns = useMemo(
    () =>
      table
        .getAllLeafColumns()
        .filter((column) => column.getIsVisible())
        .filter((column) => !column.id.startsWith("__dt_"))
        .map((column) => ({
          id: column.id,
          header:
            typeof column.columnDef.header === "string"
              ? column.columnDef.header
              : column.id,
          read: (row: TData) =>
            typeof column.accessorFn === "function"
              ? column.accessorFn(row, 0)
              : (row as Record<string, unknown>)[column.id],
        })),
    [table],
  );

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const filteredRows = serverSide
    ? data
    : table.getFilteredRowModel().rows.map((r) => r.original);
  const currentPageRows = table.getRowModel().rows.map((r) => r.original);
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalRows =
    typeof totalRowsProp === "number"
      ? totalRowsProp
      : serverSide
        ? data.length
        : table.getFilteredRowModel().rows.length;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);
  const confirmDeletePhrase = `DELETE ${selectedRows.length}`;
  const canConfirmDelete = confirmDeleteInput === confirmDeletePhrase;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-xs">
      {(title || description || enableSavedViews) && (
        <div className="border-b border-slate-200 p-4">
          {(title || description) && (
            <div className={enableSavedViews ? "mb-4" : ""}>
              {title && (
                <h2 className="text-lg font-semibold text-slate-800">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              )}
            </div>
          )}
          {enableSavedViews && (
            <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5">
              <input
                value={viewNameInput}
                onChange={(event) => setViewNameInput(event.target.value)}
                placeholder="New view name"
                className="h-8 w-32 rounded border border-slate-200 px-2 text-xs outline-hidden focus:border-slate-300"
                aria-label="Saved view name"
              />
              <button
                type="button"
                onClick={() => saveCurrentView(viewNameInput)}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                title="Save current view"
              >
                <BookmarkIcon className="h-4 w-4" />
              </button>
              <Listbox
                value={selectedSavedView}
                onChange={(value: string) => {
                  setSelectedSavedView(value);
                  applySavedView(value);
                }}
              >
                <div className="relative">
                  <ListboxButton className="flex h-8 min-w-32 items-center justify-between rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50">
                    <span className="truncate">
                      {selectedSavedView || "Apply saved view"}
                    </span>
                    <ChevronUpDownIcon className="ml-1 h-4 w-4 text-slate-400" />
                  </ListboxButton>
                  <ListboxOptions
                    anchor="bottom end"
                    modal={false}
                    className="z-70 mt-1 max-h-56 w-(--button-width) overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg outline-hidden [--anchor-gap:6px]"
                  >
                    {savedViews.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-500">
                        No saved views yet.
                      </div>
                    ) : (
                      savedViews.map((viewName) => (
                        <ListboxOption
                          key={viewName}
                          value={viewName}
                          className="group relative cursor-pointer select-none py-2 pl-3 pr-8 text-xs text-slate-700 data-focus:bg-slate-100"
                        >
                          <span className="block truncate">{viewName}</span>
                          <span className="absolute inset-y-0 right-2 hidden items-center text-slate-600 group-data-selected:flex">
                            <CheckIcon className="h-4 w-4" />
                          </span>
                        </ListboxOption>
                      ))
                    )}
                  </ListboxOptions>
                </div>
              </Listbox>
              <button
                type="button"
                disabled={!selectedSavedView}
                onClick={() => deleteSavedView(selectedSavedView)}
                className="inline-flex h-8 items-center justify-center rounded border border-rose-200 px-2 text-xs text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="Delete selected preset"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats + icon toolbar row */}
      <div className="border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          {table.getFilteredRowModel().rows.length} rows filtered •{" "}
          {selectedRows.length} selected
        </span>

        <div className="flex items-center gap-1.5">
          {/* Animated search bar */}
          <div
            className={cx(
              "overflow-hidden transition-all duration-300 ease-in-out",
              searchOpen ? "max-w-[260px] opacity-100" : "max-w-0 opacity-0",
            )}
          >
            <div className="relative w-[260px] pr-0.5">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 z-10" />
              <PlainInput
                ref={searchInputRef}
                value={globalFilter ?? ""}
                onChange={setGlobalFilter}
                placeholder="Search all columns..."
                className="pl-8 pr-7 pt-1.5 pb-1.5 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setGlobalFilter("");
                    setSearchOpen(false);
                  }
                }}
              />
              <button
                onClick={() => {
                  setGlobalFilter("");
                  setSearchOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                aria-label="Close search"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search toggle */}
          <DtTooltip label="Search">
            <button
              type="button"
              onClick={() => {
                if (searchOpen) {
                  setGlobalFilter("");
                  setSearchOpen(false);
                } else setSearchOpen(true);
              }}
              className={cx(
                "flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50",
                searchOpen && "bg-slate-100 border-slate-400",
              )}
              aria-label="Toggle search"
            >
              <SearchIcon className="h-3.5 w-3.5" />
            </button>
          </DtTooltip>

          <DtTooltip label="Columns">
            <div className="relative" ref={columnsMenuRef}>
              <button
                type="button"
                className={cx(
                  "flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50",
                  columnsMenuOpen && "bg-slate-100",
                )}
                aria-label="Columns and pin settings"
                aria-expanded={columnsMenuOpen}
                onClick={() => setColumnsMenuOpen((prev) => !prev)}
              >
                <ColumnsIcon className="h-3.5 w-3.5" />
              </button>
              {columnsMenuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Columns
                    </p>
                    <p className="text-xs text-slate-500">
                      Show, hide and pin columns from one place.
                    </p>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-auto">
                    <div className="rounded-md border border-slate-100 p-2.5">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={showSelectColumn}
                          onChange={(e) =>
                            setShowSelectColumn(e.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span>Select</span>
                      </label>
                    </div>
                    {table.getAllLeafColumns().map((column) => (
                      <div
                        key={column.id}
                        className="rounded-md border border-slate-100 p-2.5"
                      >
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={column.getToggleVisibilityHandler()}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>
                            {typeof column.columnDef.header === "string"
                              ? column.columnDef.header
                              : column.id}
                          </span>
                        </label>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-500">Pin</span>
                          <Listbox
                            value={column.getIsPinned() || "none"}
                            onChange={(value: "none" | "left" | "right") => {
                              if (value === "left" || value === "right") {
                                column.pin(value);
                                return;
                              }
                              column.pin(false);
                            }}
                          >
                            <div className="relative">
                              <ListboxButton
                                className="flex h-7 min-w-24 items-center justify-between rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50"
                                aria-label={`Pin position for ${column.id}`}
                              >
                                <span className="capitalize">
                                  {column.getIsPinned() || "none"}
                                </span>
                                <ChevronUpDownIcon className="ml-1 h-3.5 w-3.5 text-slate-400" />
                              </ListboxButton>
                              <ListboxOptions
                                anchor="bottom end"
                                modal={false}
                                className="z-80 mt-1 w-(--button-width) overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg outline-hidden [--anchor-gap:6px]"
                              >
                                {(["none", "left", "right"] as const).map(
                                  (pinValue) => (
                                    <ListboxOption
                                      key={pinValue}
                                      value={pinValue}
                                      className="group relative cursor-pointer select-none py-1.5 pl-2 pr-7 text-xs text-slate-700 data-focus:bg-slate-100"
                                    >
                                      <span className="capitalize">
                                        {pinValue}
                                      </span>
                                      <span className="absolute inset-y-0 right-2 hidden items-center text-slate-600 group-data-selected:flex">
                                        <CheckIcon className="h-3.5 w-3.5" />
                                      </span>
                                    </ListboxOption>
                                  ),
                                )}
                              </ListboxOptions>
                            </div>
                          </Listbox>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        table.setColumnPinning({ left: [], right: [] });
                      }}
                      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      Clear all pinning
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </DtTooltip>
          {enableColumnFilters ? (
            <DtTooltip label="Column filters">
              <button
                type="button"
                onClick={() => setShowColumnFilters((prev) => !prev)}
                className={cx(
                  "flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50",
                  showColumnFilters && "bg-slate-100",
                )}
                aria-label="Toggle column filters"
              >
                <FilterIcon className="h-3.5 w-3.5" />
              </button>
            </DtTooltip>
          ) : null}
          {enableExport ? (
            <DtTooltip label="Download">
              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setExportMenuOpen((prev) => !prev)}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Download data"
                  aria-expanded={exportMenuOpen}
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                </button>
                {exportMenuOpen ? (
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                    {selectedRows.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const csv = makeCsv(selectedRows, exportableColumns);
                          downloadTextFile(`${tableId}-selected.csv`, csv);
                          setExportMenuOpen(false);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Download selected rows
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        const csv = makeCsv(data, exportableColumns);
                        downloadTextFile(`${tableId}-full.csv`, csv);
                        setExportMenuOpen(false);
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Download full table
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const csv = makeCsv(currentPageRows, exportableColumns);
                        downloadTextFile(
                          `${tableId}-page-${currentPage}.csv`,
                          csv,
                        );
                        setExportMenuOpen(false);
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Download this page
                    </button>
                  </div>
                ) : null}
              </div>
            </DtTooltip>
          ) : null}
          {selectedRows.length > 0 ? (
            <DtTooltip label="Delete selected">
              <button
                type="button"
                disabled={!onBulkDeleteSelected || bulkDeleteBusy}
                onClick={() => {
                  setConfirmDeleteInput("");
                  setConfirmDeleteOpen(true);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Delete selected rows"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </DtTooltip>
          ) : null}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {showSelectColumn && (
                  <th className="border-b border-slate-200 px-3 py-2">
                    <input
                      aria-label="Select all page rows"
                      type="checkbox"
                      checked={table.getIsAllPageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </th>
                )}
                {headerGroup.headers.map((header) => {
                  const pinned = header.column.getIsPinned();
                  const pinnedStyles =
                    pinned === "left"
                      ? {
                          left: `${header.column.getStart("left")}px`,
                        }
                      : pinned === "right"
                        ? {
                            right: `${header.column.getAfter("right")}px`,
                          }
                        : undefined;
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={pinnedStyles}
                      className={cx(
                        "border-b border-slate-200 px-3 py-2 whitespace-nowrap",
                        pinned && "bg-slate-100",
                        pinned === "left" && "sticky left-0 z-20 shadow-xs",
                        pinned === "right" && "sticky right-0 z-20 shadow-xs",
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="relative">
                          <button
                            type="button"
                            className={cx(
                              "inline-flex items-center gap-1 font-medium",
                              header.column.getCanSort()
                                ? "text-slate-700 hover:text-slate-900"
                                : "text-slate-600",
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: "▲",
                              desc: "▼",
                            }[header.column.getIsSorted() as string] ?? ""}
                          </button>
                          {header.column.getCanResize() ? (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-slate-300"
                              aria-hidden
                            />
                          ) : null}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
            {showColumnFilters ? (
              <tr>
                {showSelectColumn && (
                  <th className="border-b border-slate-200 px-3 py-2" />
                )}
                {table.getVisibleLeafColumns().map((column) => (
                  <th
                    key={column.id}
                    className="border-b border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    {column.getCanFilter() ? (
                      <input
                        value={(column.getFilterValue() ?? "") as string}
                        onChange={(event) =>
                          column.setFilterValue(event.target.value)
                        }
                        placeholder={`Filter ${column.id}`}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-700 outline-hidden ring-slate-300 focus:ring-2"
                        aria-label={`Filter ${column.id}`}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            ) : null}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length + 1}
                  className="px-3 py-16 text-center"
                >
                  <div className="inline-flex">
                    <svg
                      role="status"
                      className="h-8 w-8 animate-spin text-slate-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-label="Loading"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M12 3a9 9 0 0 1 9 9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-100"
                      />
                    </svg>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length + 1}
                  className="px-3 py-12 text-center text-slate-500"
                >
                  <p>{emptyMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalFilter("");
                      setColumnFilters([]);
                      setSorting([]);
                    }}
                    className="mt-3 rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Clear all filters
                  </button>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 text-slate-700 hover:bg-slate-50"
                >
                  {showSelectColumn && (
                    <td className="px-3 py-3">
                      <input
                        aria-label={`Select row ${row.id}`}
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                  )}
                  {row.getVisibleCells().map((cell) => {
                    const pinned = cell.column.getIsPinned();
                    const pinnedStyles =
                      pinned === "left"
                        ? {
                            left: `${cell.column.getStart("left")}px`,
                          }
                        : pinned === "right"
                          ? {
                              right: `${cell.column.getAfter("right")}px`,
                            }
                          : undefined;
                    return (
                      <td
                        key={cell.id}
                        style={pinnedStyles}
                        className={cx(
                          "whitespace-nowrap px-3 py-3",
                          pinned && "bg-slate-50",
                          pinned === "left" && "sticky left-0 z-10 shadow-xs",
                          pinned === "right" && "sticky right-0 z-10 shadow-xs",
                        )}
                      >
                        {(() => {
                          const meta = cell.column.columnDef.meta;
                          const val = cell.getValue();
                          // accessor columns: val is the raw value
                          if (
                            meta?.type === "enum" &&
                            typeof val === "string" &&
                            val
                          ) {
                            return <EnumChip value={val} />;
                          }
                          if (
                            typeof val === "string" &&
                            (meta?.type === "email" || EMAIL_REGEX.test(val))
                          ) {
                            return <EmailText value={val} />;
                          }
                          // display columns: val is undefined — render first, then wrap if meta says email
                          if (meta?.type === "email") {
                            const rendered = flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            );
                            if (
                              typeof rendered === "string" &&
                              rendered &&
                              rendered !== "—"
                            ) {
                              return <EmailText value={rendered} />;
                            }
                            return rendered;
                          }
                          return flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          );
                        })()}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Listbox
              value={pagination.pageSize}
              onChange={(size: number) => table.setPageSize(size)}
            >
              <div className="relative">
                <ListboxButton
                  className="flex h-9 min-w-20 items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
                  title="Rows per page"
                >
                  <span>{pagination.pageSize}</span>
                  <ChevronUpDownIcon className="ml-2 h-4 w-4 text-slate-400" />
                </ListboxButton>
                <ListboxOptions
                  anchor="top end"
                  modal={false}
                  className="z-60 mt-1 w-(--button-width) overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg outline-hidden [--anchor-gap:6px]"
                >
                  {[5, 10, 20, 50, 100, 200].map((size) => (
                    <ListboxOption
                      key={size}
                      value={size}
                      className="group relative cursor-pointer select-none py-2 pl-3 pr-8 text-sm text-slate-700 data-focus:bg-slate-100"
                    >
                      <span>{size}</span>
                      <span className="absolute inset-y-0 right-2 hidden items-center text-slate-600 group-data-selected:flex">
                        <CheckIcon className="h-4 w-4" />
                      </span>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
            <span className="text-sm font-medium text-slate-700">
              {startRow}-{endRow} of {totalRows}
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Previous page"
              title="Previous page"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Next page"
              title="Next page"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {confirmDeleteOpen ? (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (bulkDeleteBusy) return;
            setConfirmDeleteOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Confirm bulk delete
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              You are about to delete{" "}
              <span className="font-semibold text-slate-900">
                {selectedRows.length}
              </span>{" "}
              selected rows. To continue, type{" "}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                {confirmDeletePhrase}
              </span>{" "}
              below.
            </p>
            <input
              type="text"
              value={confirmDeleteInput}
              onChange={(event) => setConfirmDeleteInput(event.target.value)}
              placeholder={`Type ${confirmDeletePhrase}`}
              className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-hidden ring-slate-300 placeholder:text-slate-400 focus:ring-2"
            />
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={bulkDeleteBusy}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  !onBulkDeleteSelected || bulkDeleteBusy || !canConfirmDelete
                }
                onClick={async () => {
                  if (!onBulkDeleteSelected || !canConfirmDelete) return;
                  try {
                    setBulkDeleteBusy(true);
                    await onBulkDeleteSelected(selectedRows);
                    setRowSelection({});
                    setConfirmDeleteOpen(false);
                    setConfirmDeleteInput("");
                  } finally {
                    setBulkDeleteBusy(false);
                  }
                }}
                className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkDeleteBusy ? "Deleting..." : "Delete selected"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
