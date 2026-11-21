"use client";

import { useEffect, useRef, useState } from "react";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { Tooltip } from "@/components/ui/tooltip";

type TopbarProps = {
  title?: string;
  userName: string;
  onLogout: () => void;
};

function initialsFor(userName: string) {
  return (
    userName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function Topbar({ title = "Dashboard", userName, onLogout }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [profileOpen]);

  return (
    <header className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-6 sm:pt-5 sm:pb-5 lg:px-8">
      {/* Mobile: title + profile */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <h1 className="min-w-0 truncate text-[28px] font-bold leading-tight tracking-[-0.02em] text-[#1F1F2C]">
          {title}
        </h1>
        <div ref={profileRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Profile"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((open) => !open)}
            className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#D9DEFF] text-[12px] font-semibold text-[#666CFF]"
          >
            {initialsFor(userName)}
          </button>
          {profileOpen ? (
            <div className="absolute top-[calc(100%+8px)] right-0 z-40 min-w-[180px] overflow-hidden rounded-[14px] border border-[#E8EAF2] bg-white py-2 shadow-[0_16px_40px_rgba(30,35,70,0.18)]">
              <div className="border-b border-[#EEF0F5] px-3.5 py-2.5">
                <p className="truncate text-[13px] font-semibold text-[#2B2B38]">{userName}</p>
                <p className="text-[11px] text-[#8A8A9A]">Signed in</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium text-[#D14343] hover:bg-[#FDECEC]"
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Desktop / large screens */}
      <div className="hidden items-center justify-between gap-4 lg:flex">
        <h1 className="truncate text-[28px] font-semibold tracking-tight text-[#2B2B38]">{title}</h1>
        <div className="flex shrink-0 items-center gap-4">
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
              {initialsFor(userName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[#2B2B38]">{userName}</p>
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
      </div>
    </header>
  );
}
