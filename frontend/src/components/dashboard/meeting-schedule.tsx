"use client";

import { NavIcon } from "@/components/dashboard/nav-icons";
import { MeetingListCard } from "@/components/meetings/meeting-list-card";
import { Tooltip } from "@/components/ui/tooltip";

export function MeetingSchedule() {
  return <MeetingListCard className="h-[320px] xl:h-full" />;
}

export function Fab({ onClick, label = "Add" }: { onClick?: () => void; label?: string }) {
  return (
    <div className="absolute bottom-4 right-4 z-10">
      <Tooltip label={label}>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="inline-flex size-11 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_20px_rgba(102,108,255,0.35)]"
        >
          <NavIcon name="plus" className="size-5" />
        </button>
      </Tooltip>
    </div>
  );
}
