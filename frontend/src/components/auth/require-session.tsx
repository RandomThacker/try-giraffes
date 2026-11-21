"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ApiError, getMe, routeForNext, type NextStep } from "@/lib/api/client";

type RequireSessionProps = {
  children: ReactNode;
  allow: NextStep;
};

export function RequireSession({ children, allow }: RequireSessionProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((payload) => {
        if (cancelled) {
          return;
        }
        if (payload.next !== allow) {
          router.replace(routeForNext(payload.next));
          return;
        }
        setReady(true);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [allow, router]);

  if (!ready) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-white text-[#6b6b78]">
        Checking session...
      </main>
    );
  }

  return <>{children}</>;
}
