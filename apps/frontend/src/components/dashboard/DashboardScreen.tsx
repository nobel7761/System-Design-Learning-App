"use client";

import Loader from "@/components/shared/Loader";
import { AppShell } from "@/components/layout/AppShell";
import useAPI from "@/hooks/api";
import type { Dashboard } from "@/lib/api/types";
import { TrackCards } from "./widgets";

export function DashboardScreen() {
  const { data, loading, error } = useAPI<Dashboard>({
    url: "/progress/dashboard",
  });

  return (
    <AppShell>
      {loading || (!data && !error) ? (
        <div className="flex justify-center py-24">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <p className="py-24 text-center text-sm text-red-600">
          Dashboard load হয়নি — backend চালু আছে কিনা দেখো।
        </p>
      ) : data ? (
        <TrackCards dashboard={data} />
      ) : null}
    </AppShell>
  );
}
