"use client";

import { NavIcon } from "@/components/dashboard/nav-icons";
import { MeetingListCard } from "@/components/meetings/meeting-list-card";
import { Tooltip } from "@/components/ui/tooltip";

export function MeetingSchedule() {
  return <MeetingListCard />;
}

export function Fab({ onClick, label = "Add" }: { onClick?: () => void; label?: string }) {
  return (
    <div className="absolute bottom-5 right-5 z-10">
      <Tooltip label={label}>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="inline-flex size-12 items-center justify-center rounded-full bg-[#666CFF] text-white shadow-[0_10px_24px_rgba(102,108,255,0.35)]"
        >
          <NavIcon name="plus" className="size-5" />
        </button>
      </Tooltip>
    </div>
  );
}
