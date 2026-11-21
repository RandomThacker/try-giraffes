"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NavIcon } from "@/components/dashboard/nav-icons";

type MobileBottomNavProps = {
  moreOpen: boolean;
  onMoreClick: () => void;
};

export function MobileBottomNav({ moreOpen, onMoreClick }: MobileBottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get("view");
  const homeActive = !moreOpen && pathname.startsWith("/dashboard");
  const meetingActive = !moreOpen && pathname.startsWith("/agenda") && view === "meetings";
  const taskActive = !moreOpen && pathname.startsWith("/agenda") && view !== "meetings";

  const links = [
    { id: "home", label: "Home", href: "/dashboard", icon: "home", active: homeActive },
    {
      id: "meeting",
      label: "Meeting",
      href: "/agenda?view=meetings",
      icon: "calendar",
      active: meetingActive,
    },
    {
      id: "task",
      label: "Task",
      href: "/agenda?tab=tasks",
      icon: "clipboard",
      active: taskActive,
    },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-app-border bg-app-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 px-1 pt-1.5 pb-2">
        {links.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-1 rounded-[12px] px-2 py-2 text-[11px] font-medium ${
              item.active ? "text-brand" : "text-app-muted"
            }`}
          >
            <NavIcon name={item.icon} className="size-5" />
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          type="button"
          aria-label="More options"
          aria-expanded={moreOpen}
          onClick={onMoreClick}
          className={`flex flex-col items-center gap-1 rounded-[12px] px-2 py-2 text-[11px] font-medium ${
            moreOpen ? "text-brand" : "text-app-muted"
          }`}
        >
          <NavIcon name="more" className="size-5" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
