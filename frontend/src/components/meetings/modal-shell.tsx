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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1f2f]/40 px-4 backdrop-blur-[1px]">
      <div className={`w-full ${widthClassName} rounded-[18px] bg-white p-6 shadow-[0_24px_60px_rgba(30,35,70,0.22)]`}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold text-[#2B2B38]">{title}</h2>
          <Tooltip label="Close">
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-full text-[#8A8A9A] hover:bg-[#F3F4F8]"
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
