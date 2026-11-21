import type { Metadata } from "next";
import { Suspense } from "react";
import { AgendaPage } from "@/components/meetings/agenda-page";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function AgendaRoute() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-[18px]" />
          <Skeleton className="h-72 w-full rounded-[18px]" />
        </div>
      }
    >
      <AgendaPage />
    </Suspense>
  );
}
