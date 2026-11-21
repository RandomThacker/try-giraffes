"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, markAttendance, routeForNext } from "@/lib/api/client";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function MarkPresent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"present" | "absent" | null>(null);

  async function choose(status: "present" | "absent") {
    setError(null);
    setSubmitting(status);
    try {
      const result = await markAttendance(status);
      router.push(routeForNext(result.next));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save attendance.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#f4f4fe_46%,#e7e8fb_100%)]">
      <div className="relative z-20 mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center px-6 pt-[10vh]">
        <Logo tone="brand" layout="stacked" />
        <h1 className="mt-14 max-w-[820px] text-center text-[26px] font-medium leading-snug tracking-tight text-[#1d1d1d] sm:mt-16 sm:text-[32px]">
          Would you like to mark yourself Present for today?
        </h1>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            type="button"
            className="h-11 px-5"
            disabled={submitting !== null}
            onClick={() => void choose("present")}
          >
            {submitting === "present" ? "Saving..." : "Yes, mark me present"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-11 min-w-[92px] px-6"
            disabled={submitting !== null}
            onClick={() => void choose("absent")}
          >
            {submitting === "absent" ? "Saving..." : "No"}
          </Button>
        </div>
        {error ? <p className="mt-4 text-[14px] text-[#d14343]">{error}</p> : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48vh] min-h-[280px]">
        <div
          aria-hidden="true"
          className="absolute bottom-[-22%] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#f7f7ff] sm:h-[640px] sm:w-[640px]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/mark-present-character.svg"
          alt=""
          width={673}
          height={449}
          className="absolute bottom-0 left-1/2 z-10 h-auto w-[min(640px,96vw)] max-w-none -translate-x-1/2 select-none"
        />
      </div>
    </main>
  );
}
