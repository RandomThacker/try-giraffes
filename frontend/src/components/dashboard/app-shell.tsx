"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, getMe, logout, type User } from "@/lib/api/client";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { MobileMoreSheet } from "@/components/dashboard/mobile-more-sheet";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { useTheme } from "@/components/theme/theme-provider";
import { AppShellSkeleton } from "@/components/ui/skeleton";

type AppShellProps = {
  children: ReactNode;
};

function titleForPath(pathname: string) {
  if (pathname.startsWith("/agenda")) {
    return "Agenda";
  }
  if (pathname.startsWith("/dashboard")) {
    return "Dashboard";
  }
  return "Try Giraffes";
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((payload) => {
        if (cancelled) {
          return;
        }
        if (payload.next !== "dashboard") {
          router.replace(
            payload.next === "set_pin"
              ? "/set-pin"
              : payload.next === "mark_present"
                ? "/mark-present"
                : "/dashboard",
          );
          return;
        }
        setUser(payload.user);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Unable to load page.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const displayName = useMemo(() => {
    if (user?.full_name?.trim()) {
      return user.full_name.trim();
    }
    if (!user?.email) {
      return "User";
    }
    const local = user.email.split("@")[0] ?? user.email;
    return local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [user]);

  async function onLogout() {
    try {
      await logout();
    } finally {
      router.replace("/");
    }
  }

  // Always keep {children} in the tree so Instant Navigation can validate page segments.
  if (loading) {
    return (
      <>
        <AppShellSkeleton />
        <div className="hidden">{children}</div>
      </>
    );
  }

  return (
    <div
      data-theme={theme}
      className="flex min-h-svh bg-app-bg text-app-fg lg:h-svh lg:overflow-hidden"
    >
      <div className="sticky top-0 z-30 hidden h-svh shrink-0 self-start lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      </div>

      <div className="flex min-h-svh min-w-0 flex-1 flex-col lg:h-svh lg:min-h-0">
        <div className="sticky top-0 z-20 bg-app-bg lg:border-b lg:border-app-border/70 lg:bg-app-bg/95 lg:backdrop-blur">
          <Topbar
            title={titleForPath(pathname)}
            userName={displayName || "Vivek Verma"}
            onLogout={() => void onLogout()}
          />
        </div>
        <main className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto px-4 pt-1 pb-24 sm:px-6 sm:pt-2 sm:pb-6 lg:px-6 lg:py-4">
          {error ? <p className="mb-4 text-[14px] text-app-danger">{error}</p> : null}
          {children}
        </main>
        <Suspense fallback={null}>
          <MobileBottomNav moreOpen={moreOpen} onMoreClick={() => setMoreOpen((open) => !open)} />
        </Suspense>
        <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      </div>
    </div>
  );
}
