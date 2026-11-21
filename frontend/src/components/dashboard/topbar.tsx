"use client";

import { NavIcon } from "@/components/dashboard/nav-icons";
import { Tooltip } from "@/components/ui/tooltip";

type TopbarProps = {
  title?: string;
  userName: string;
  onLogout: () => void;
};

export function Topbar({ title = "Dashboard", userName, onLogout }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 lg:px-8">
      <h1 className="text-[28px] font-semibold tracking-tight text-[#2B2B38]">{title}</h1>
      <div className="flex items-center gap-4">
        <Tooltip label="Notifications">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full bg-[#EEF0F5] text-[#6E6E80]"
            aria-label="Notifications"
          >
            <NavIcon name="bell" className="size-5" />
          </button>
        </Tooltip>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-[#D9DEFF] text-[13px] font-semibold text-[#666CFF]">
            {userName
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("") || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-[14px] font-semibold text-[#2B2B38]">{userName}</p>
            <button
              type="button"
              onClick={onLogout}
              className="text-[12px] text-[#666CFF] hover:underline"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
