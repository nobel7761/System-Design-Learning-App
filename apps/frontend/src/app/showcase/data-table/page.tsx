import { Suspense } from "react";
import { DataTableShowcase } from "@/components/showcase/DataTableShowcase";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";

export default function DataTablePage() {
  return (
    <ShowcaseShell
      title="DataTable"
      description="The shared TanStack-powered DataTable from @/components/shared/table, shown in client-side mode (all rows in the browser) and server-side mode (each page fetched from a simulated backend)."
    >
      <Suspense
        fallback={<div className="text-sm text-slate-400">Loading tables…</div>}
      >
        <DataTableShowcase />
      </Suspense>
    </ShowcaseShell>
  );
}
