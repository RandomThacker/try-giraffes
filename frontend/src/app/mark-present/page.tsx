import type { Metadata } from "next";
import { RequireSession } from "@/components/auth/require-session";
import { MarkPresent } from "@/components/presence/mark-present";

export const metadata: Metadata = {
  title: "Mark present",
};

export default function MarkPresentPage() {
  return (
    <RequireSession allow="mark_present">
      <MarkPresent />
    </RequireSession>
  );
}
