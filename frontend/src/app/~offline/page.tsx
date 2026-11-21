import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#F3F8FB] px-6 text-center">
      <Logo tone="brand" />
      <h1 className="mt-8 text-[24px] font-semibold text-[#2B2B38]">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-[15px] text-[#8A8A9A]">
        This page isn&apos;t available without a connection. Reconnect and try again.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-[10px] bg-[#666CFF] px-5 py-2.5 text-[14px] font-medium text-white"
      >
        Try again
      </Link>
    </main>
  );
}
