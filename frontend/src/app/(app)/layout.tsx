import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/app-shell";

// Auth shell loads client-side; navigations into this tree are allowed to block.
export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
