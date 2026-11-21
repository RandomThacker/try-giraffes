"use client";

import { useState } from "react";
import { messagesToday } from "@/components/dashboard/dummy-data";
import { Fab } from "@/components/dashboard/meeting-schedule";
import { SeeAllPill } from "@/components/dashboard/see-all-pill";

export function MessagesCard() {
  const [tab, setTab] = useState<"today" | "past">("today");
  const items = tab === "today" ? messagesToday : [...messagesToday].reverse();

  return (
    <section className="relative flex h-[320px] flex-col overflow-hidden rounded-[14px] bg-app-surface p-4 shadow-[var(--app-shadow)] xl:h-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-medium text-app-fg">Messages</h2>
        <SeeAllPill />
      </div>

      <div className="mt-3 flex gap-6 border-b border-app-border-2 text-[11px] font-medium tracking-[0.06em]">
        <button
          type="button"
          onClick={() => setTab("today")}
          className={`pb-2.5 ${tab === "today" ? "border-b-2 border-brand text-brand" : "text-app-faint"}`}
        >
          TODAY
        </button>
        <button
          type="button"
          onClick={() => setTab("past")}
          className={`pb-2.5 ${tab === "past" ? "border-b-2 border-brand text-brand" : "text-app-faint"}`}
        >
          PAST
        </button>
      </div>

      <ul className="mt-2 flex-1 space-y-0 overflow-auto pb-14">
        {items.map((item) => (
          <li key={`${tab}-${item.id}`} className="flex items-start gap-2.5 py-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F5F6FA] text-[14px] font-semibold text-[#E8832A] dark:bg-app-muted-bg dark:text-[#e9a46e]">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-app-fg">{item.name}</p>
              <p className="mt-0.5 truncate text-[11px] leading-4 text-app-muted">{item.preview}</p>
            </div>
            <span className="mt-0.5 shrink-0 rounded-full bg-[#E9EAFF] px-2 py-0.5 text-[10px] font-medium text-brand dark:bg-[#1f1f2e] dark:text-[#a3a7ff]">
              {item.time}
            </span>
          </li>
        ))}
      </ul>

      <Fab label="Add message" />
    </section>
  );
}
