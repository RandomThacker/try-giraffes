"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useTheme } from "@/components/theme/theme-provider";

type MobileMoreSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMoreSheet({ open, onClose }: MobileMoreSheetProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setEntered(false);
    const timeout = window.setTimeout(() => setVisible(false), 300);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More options">
      <button
        type="button"
        aria-label="Close menu"
        className={`absolute inset-0 bg-[color:var(--app-overlay)] transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-0 flex flex-col bg-app-sidebar transition-transform duration-300 ease-out ${
          entered ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-app-border px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
          <div className="min-w-0">
            <Logo tone={theme === "dark" ? "light" : "brand"} className="h-7 w-auto" />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-app-faint">
              Asset Management
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-app-surface text-app-muted-2 shadow-[0_4px_14px_rgba(30,35,70,0.08)]"
          >
            <NavIcon name="close" className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden pb-[env(safe-area-inset-bottom)]">
          <Sidebar
            collapsed={false}
            onToggle={onClose}
            onNavigate={onClose}
            hideBrand
            hideCollapse
            className="h-full w-full border-r-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
