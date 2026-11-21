"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { navSections } from "@/components/dashboard/dummy-data";
import { useTheme } from "@/components/theme/theme-provider";
import { Tooltip } from "@/components/ui/tooltip";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  className?: string;
  hideBrand?: boolean;
  hideCollapse?: boolean;
};

const hrefById: Record<string, string> = {
  dashboard: "/dashboard",
  agenda: "/agenda",
};

export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
  className = "",
  hideBrand = false,
  hideCollapse = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside
      className={`flex h-full flex-col border-r border-app-border bg-app-sidebar transition-[width] duration-200 ${
        collapsed ? "w-[76px]" : "w-[248px]"
      } ${className}`}
    >
      {hideBrand ? null : (
        <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
          {collapsed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/logo-mark-brand.svg" alt="Try Giraffes" width={40} height={22} className="h-6 w-auto" />
          ) : (
            <div className="min-w-0">
              <Logo tone={isDark ? "light" : "brand"} className="h-7 w-auto" />
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-app-faint">
                Asset Management
              </p>
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navSections.map((section) => (
          <div key={section.id} className={section.label ? "mt-5" : "mt-1"}>
            {section.label && !collapsed ? (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.08em] text-app-faint">
                {section.label}
              </p>
            ) : null}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const href = hrefById[item.id];
                const active = href
                  ? pathname === href || pathname.startsWith(`${href}/`)
                  : false;
                const expandable = "expandable" in item && item.expandable;
                const itemClassName = `flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14px] transition-colors ${
                  active
                    ? "bg-brand text-white shadow-[0_8px_18px_rgba(102,108,255,0.28)]"
                    : "text-app-muted-2 hover:bg-app-surface hover:text-app-fg"
                } ${collapsed ? "justify-center px-0" : ""}`;

                const content = (
                  <>
                    <NavIcon name={item.icon} className="size-[18px] shrink-0" />
                    {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
                    {!collapsed && expandable ? (
                      <NavIcon name="chevron" className={`size-4 ${active ? "text-white/80" : "text-app-faint"}`} />
                    ) : null}
                  </>
                );

                const control = href ? (
                  <Link href={href} className={itemClassName} onClick={() => onNavigate?.()}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" className={itemClassName}>
                    {content}
                  </button>
                );

                return (
                  <li key={item.id}>
                    {collapsed ? <Tooltip label={item.label}>{control}</Tooltip> : control}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-app-border p-3 space-y-1">
        <Tooltip label={isDark ? "Switch to light mode" : "Switch to dark mode"} side="top">
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] text-app-muted-2 hover:bg-app-surface ${
              collapsed ? "justify-center px-0" : ""
            }`}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <NavIcon name={isDark ? "sun" : "moon"} className="size-[18px]" />
            {!collapsed ? <span>{isDark ? "Light mode" : "Dark mode"}</span> : null}
          </button>
        </Tooltip>
        {hideCollapse ? null : (
          <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="top">
            <button
              type="button"
              onClick={onToggle}
              className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] text-app-muted-2 hover:bg-app-surface ${
                collapsed ? "justify-center px-0" : ""
              }`}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <NavIcon name="panel" className="size-[18px]" />
              {!collapsed ? <span>Collapse</span> : null}
            </button>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
