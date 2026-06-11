"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table";

type TableQuery = {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  pagination: PaginationState;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type Person = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  amount: number;
  createdAt: string;
};

const FIRST = [
  "Aisha",
  "Rahim",
  "Nadia",
  "Tanvir",
  "Sumaiya",
  "Karim",
  "Lina",
  "Omar",
  "Farah",
  "Zaid",
];
const LAST = [
  "Ahmed",
  "Khan",
  "Hossain",
  "Islam",
  "Rahman",
  "Akter",
  "Chowdhury",
  "Das",
  "Saha",
  "Roy",
];
const ROLES = ["Admin", "Manager", "Member", "Viewer"];
const STATUSES = ["active", "pending", "failed", "inactive", "refunded"];

const DATASET: Person[] = Array.from({ length: 137 }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 3) % LAST.length];
  return {
    id: i + 1,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
    role: ROLES[i % ROLES.length],
    status: STATUSES[(i * 2) % STATUSES.length],
    amount: ((i * 37) % 900) + 100,
    createdAt: new Date(2024, i % 12, ((i * 7) % 27) + 1)
      .toISOString()
      .slice(0, 10),
  };
});

const columns: ColumnDef<Person, any>[] = [
  { accessorKey: "id", header: "ID", size: 70 },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email", meta: { type: "email" } },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "status", header: "Status", meta: { type: "enum" } },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => `$${Number(getValue()).toLocaleString()}`,
  },
  { accessorKey: "createdAt", header: "Created" },
];

// ---------------------------------------------------------------------------
// Client-side table — full dataset lives in the browser, the table handles
// sorting / filtering / pagination locally.
// ---------------------------------------------------------------------------

function ClientSideTable({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <DataTable<Person>
      tableId="people-client"
      title="Client-side"
      description="All 137 rows are loaded; sorting, search, filtering and pagination happen in the browser."
      columns={columns}
      data={DATASET}
      enableColumnFilters
      enableExport
      enableSavedViews
      initialPageSize={10}
      getRowId={(row) => String(row.id)}
      rowActions={{
        show: { view: true, edit: true, delete: true },
        onView: (r) => onAction(`Viewed ${r.name}`),
        onEdit: (r) => onAction(`Edit ${r.name}`),
        onDelete: (r) => onAction(`Delete ${r.name}`),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Server-side table — the table reports its query state via onQueryChange and
// we serve a page of rows from a simulated backend (with latency).
// ---------------------------------------------------------------------------

function fakeServerQuery(q: {
  globalFilter: string;
  sorting: { id: string; desc: boolean }[];
  pagination: { pageIndex: number; pageSize: number };
}): Promise<{ rows: Person[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let rows = [...DATASET];

      // search
      const term = q.globalFilter.trim().toLowerCase();
      if (term) {
        rows = rows.filter((r) =>
          [r.name, r.email, r.role, r.status].some((v) =>
            v.toLowerCase().includes(term),
          ),
        );
      }

      // sort
      const sort = q.sorting[0];
      if (sort) {
        rows.sort((a, b) => {
          const av = a[sort.id as keyof Person];
          const bv = b[sort.id as keyof Person];
          if (av < bv) return sort.desc ? 1 : -1;
          if (av > bv) return sort.desc ? -1 : 1;
          return 0;
        });
      }

      const total = rows.length;
      const start = q.pagination.pageIndex * q.pagination.pageSize;
      rows = rows.slice(start, start + q.pagination.pageSize);

      resolve({ rows, total });
    }, 550);
  });
}

function ServerSideTable({ onAction }: { onAction: (msg: string) => void }) {
  const [rows, setRows] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleQueryChange = useCallback((query: TableQuery) => {
    setLoading(true);
    fakeServerQuery({
      globalFilter: query.globalFilter,
      sorting: query.sorting,
      pagination: query.pagination,
    }).then(({ rows, total }) => {
      setRows(rows);
      setTotal(total);
      setLoading(false);
    });
  }, []);

  return (
    <DataTable<Person>
      tableId="people-server"
      title="Server-side"
      description="The table only holds the current page. Search / sort / paginate triggers onQueryChange, which fetches a fresh page from a simulated backend (~550ms latency)."
      columns={columns}
      data={rows}
      serverSide
      totalRows={total}
      loading={loading}
      onQueryChange={handleQueryChange}
      enableExport
      initialPageSize={10}
      getRowId={(row) => String(row.id)}
      rowActions={{
        show: { view: true, edit: true },
        onView: (r) => onAction(`Viewed ${r.name} (server row)`),
        onEdit: (r) => onAction(`Edit ${r.name} (server row)`),
      }}
    />
  );
}

export function DataTableShowcase() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  // auto-clear the action banner
  useEffect(() => {
    if (!lastAction) return;
    const t = setTimeout(() => setLastAction(null), 2500);
    return () => clearTimeout(t);
  }, [lastAction]);

  const onAction = useMemo(() => (msg: string) => setLastAction(msg), []);

  return (
    <div className="space-y-10">
      {lastAction && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {lastAction}
        </div>
      )}

      <section className="space-y-3">
        <ClientSideTable onAction={onAction} />
      </section>

      <section className="space-y-3">
        <ServerSideTable onAction={onAction} />
      </section>
    </div>
  );
}
