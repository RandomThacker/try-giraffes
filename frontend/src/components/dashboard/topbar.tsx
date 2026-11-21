"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { useTheme } from "@/components/theme/theme-provider";
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
  const { theme } = useTheme();
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
      {/* Mobile: brand + profile */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <div className="min-w-0">
          <Logo tone={theme === "dark" ? "light" : "brand"} className="h-7 w-auto" />
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-app-faint">
            Asset Management
          </p>
        </div>
        <div ref={profileRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Profile"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((open) => !open)}
            className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-app-avatar text-[12px] font-semibold text-brand"
          >
            {initialsFor(userName)}
          </button>
          {profileOpen ? (
            <div className="absolute top-[calc(100%+8px)] right-0 z-40 min-w-[180px] overflow-hidden rounded-[14px] border border-app-border bg-app-surface py-2 shadow-[var(--app-shadow-lg)]">
              <div className="border-b border-app-border-2 px-3.5 py-2.5">
                <p className="truncate text-[13px] font-semibold text-app-fg">{userName}</p>
                <p className="text-[11px] text-app-muted">Signed in</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium text-app-danger hover:bg-app-danger-bg"
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Desktop / large screens */}
      <div className="hidden items-center justify-between gap-4 lg:flex">
        <h1 className="truncate text-[28px] font-semibold tracking-tight text-app-fg">{title}</h1>
        <div className="flex shrink-0 items-center gap-4">
          <Tooltip label="Notifications">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full bg-app-chip text-app-muted-2"
              aria-label="Notifications"
            >
              <NavIcon name="bell" className="size-5" />
            </button>
          </Tooltip>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-app-avatar text-[13px] font-semibold text-brand">
              {initialsFor(userName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-app-fg">{userName}</p>
              <button
                type="button"
                onClick={onLogout}
                className="text-[12px] text-brand hover:underline"
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
