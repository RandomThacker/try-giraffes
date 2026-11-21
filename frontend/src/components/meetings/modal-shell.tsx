"use client";

import type { ReactNode } from "react";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { Tooltip } from "@/components/ui/tooltip";

type ModalShellProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  widthClassName?: string;
};

export function ModalShell({ title, children, onClose, widthClassName = "max-w-[520px]" }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[color:var(--app-overlay)] px-0 backdrop-blur-[1px] sm:items-center sm:px-4">
      <div
        className={`max-h-[92svh] w-full overflow-y-auto rounded-t-[18px] bg-app-surface p-5 shadow-[0_24px_60px_rgba(30,35,70,0.22)] sm:rounded-[18px] sm:p-6 ${widthClassName}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold text-app-fg">{title}</h2>
          <Tooltip label="Close">
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-full text-app-muted hover:bg-[#F3F4F8]"
            >
              <NavIcon name="close" className="size-4" />
            </button>
          </Tooltip>
        </div>
        {children}
      </div>
    </div>
  );
}
