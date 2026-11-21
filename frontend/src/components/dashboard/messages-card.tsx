"use client";

import { useState } from "react";
import { messagesToday } from "@/components/dashboard/dummy-data";
import { Fab } from "@/components/dashboard/meeting-schedule";

const toneClass = {
  blue: "bg-[#DCE8FF] text-[#3B6FE0]",
  orange: "bg-[#FFE6D4] text-[#D97836]",
  green: "bg-[#DDF5E5] text-[#2F9E5F]",
  purple: "bg-[#E4E5FF] text-[#666CFF]",
  pink: "bg-[#FCE0EC] text-[#D14B7C]",
} as const;

export function MessagesCard() {
  const [tab, setTab] = useState<"today" | "past">("today");

  return (
    <section className="relative flex h-full min-h-[420px] flex-col rounded-[18px] bg-white p-5 shadow-[0_8px_28px_rgba(45,50,90,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#2B2B38]">Messages (Dummy)</h2>
          <button type="button" className="mt-1 text-[13px] text-[#666CFF] hover:underline">
            see all
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-6 border-b border-[#EEF0F5] text-[12px] font-semibold tracking-[0.08em]">
        <button
          type="button"
          onClick={() => setTab("today")}
          className={`pb-3 ${tab === "today" ? "border-b-2 border-[#666CFF] text-[#666CFF]" : "text-[#9A9AA8]"}`}
        >
          TODAY
        </button>
        <button
          type="button"
          onClick={() => setTab("past")}
          className={`pb-3 ${tab === "past" ? "border-b-2 border-[#666CFF] text-[#666CFF]" : "text-[#9A9AA8]"}`}
        >
          PAST
        </button>
      </div>

      <ul className="mt-2 flex-1 space-y-1 overflow-auto pr-1">
        {messagesToday.map((item) => (
          <li key={item.id} className="flex items-start gap-3 border-b border-[#F3F4F8] py-3 last:border-b-0">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${toneClass[item.tone]}`}
            >
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[14px] font-semibold text-[#2B2B38]">{item.name}</p>
                <span className="shrink-0 rounded-full bg-[#EEF0FF] px-2.5 py-1 text-[11px] font-medium text-[#666CFF]">
                  {item.time}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#8A8A9A]">{item.preview}</p>
            </div>
          </li>
        ))}
      </ul>

      <Fab label="Add message" />
    </section>
  );
}
