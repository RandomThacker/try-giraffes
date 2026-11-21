"use client";

import { useState } from "react";
import { messagesToday } from "@/components/dashboard/dummy-data";
import { Fab } from "@/components/dashboard/meeting-schedule";

const toneClass = {
  blue: "bg-[#DCE8FF] text-[#3B6FE0]",
  orange: "bg-[#FFE6D4] text-[#D97836]",
  green: "bg-[#DDF5E5] text-[#2F9E5F]",
  purple: "bg-[#E4E5FF] text-brand",
  pink: "bg-[#FCE0EC] text-[#D14B7C]",
} as const;

export function MessagesCard() {
  const [tab, setTab] = useState<"today" | "past">("today");

  return (
    <section className="relative flex h-full min-h-[320px] flex-col rounded-[18px] bg-app-surface p-4 shadow-[var(--app-shadow)] sm:min-h-[420px] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-app-fg">Messages (Dummy)</h2>
          <button type="button" className="mt-1 text-[13px] text-brand hover:underline">
            see all
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-6 border-b border-app-border-2 text-[12px] font-semibold tracking-[0.08em]">
        <button
          type="button"
          onClick={() => setTab("today")}
          className={`pb-3 ${tab === "today" ? "border-b-2 border-brand text-brand" : "text-app-faint"}`}
        >
          TODAY
        </button>
        <button
          type="button"
          onClick={() => setTab("past")}
          className={`pb-3 ${tab === "past" ? "border-b-2 border-brand text-brand" : "text-app-faint"}`}
        >
          PAST
        </button>
      </div>

      <ul className="mt-2 flex-1 space-y-1 overflow-auto pr-1">
        {messagesToday.map((item) => (
          <li key={item.id} className="flex items-start gap-3 border-b border-app-border-2 py-3 last:border-b-0">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${toneClass[item.tone]}`}
            >
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[14px] font-semibold text-app-fg">{item.name}</p>
                <span className="shrink-0 rounded-full bg-[#EEF0FF] px-2.5 py-1 text-[11px] font-medium text-brand">
                  {item.time}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-app-muted">{item.preview}</p>
            </div>
          </li>
        ))}
      </ul>

      <Fab label="Add message" />
    </section>
  );
}
