"use client";

import { useRouter } from "next/navigation";
import { ModalShell } from "@/components/meetings/modal-shell";
import { NavIcon } from "@/components/dashboard/nav-icons";

type SelectMeetingTypeModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SelectMeetingTypeModal({ open, onClose }: SelectMeetingTypeModalProps) {
  const router = useRouter();
  if (!open) {
    return null;
  }

  return (
    <ModalShell title="Select Meeting Type" onClose={onClose} widthClassName="max-w-[560px]">
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/agenda/instant");
          }}
          className="flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-[16px] bg-[#F5F6FA] px-4 py-6 text-center transition hover:bg-[#EEF0FF]"
        >
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-app-surface text-brand shadow-sm">
            <NavIcon name="history" className="size-6" />
          </span>
          <span className="text-[15px] font-medium text-app-fg">Instant meeting</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/agenda/schedule");
          }}
          className="flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-[16px] bg-[#F5F6FA] px-4 py-6 text-center transition hover:bg-[#EEF0FF]"
        >
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-app-surface text-brand shadow-sm">
            <NavIcon name="calendar" className="size-6" />
          </span>
          <span className="text-[15px] font-medium text-app-fg">Schedule for later</span>
        </button>
      </div>
    </ModalShell>
  );
}
