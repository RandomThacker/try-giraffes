"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { CancellationModal } from "@/components/meetings/cancellation-modal";
import { RescheduleModal } from "@/components/meetings/reschedule-modal";
import { SelectMeetingTypeModal } from "@/components/meetings/select-meeting-type-modal";
import { SendFeedbackModal } from "@/components/meetings/send-feedback-modal";
import { MeetingListSkeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { listMeetings, toMeetingRow, type Meeting } from "@/lib/api/meetings";

export type MeetingRow = {
  id: string;
  title: string;
  date: string;
  time: string;
  cancelled?: boolean;
  startsAt?: string;
  location?: string | null;
  locationKind?: "physical" | "virtual" | null;
};

type MeetingListCardProps = {
  title?: string;
  seeAllHref?: string;
  showSeeAll?: boolean;
  showFilter?: boolean;
  showFab?: boolean;
  showAddPerson?: boolean;
  className?: string;
};

export function MeetingListCard({
  title = "Meeting Schedule",
  seeAllHref = "/agenda",
  showSeeAll = true,
  showFilter = true,
  showFab = true,
  showAddPerson = false,
  className = "",
}: MeetingListCardProps) {
  const [tab, setTab] = useState<"today" | "upcoming">("today");
  const [filter, setFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<MeetingRow | null>(null);
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meetingType =
        filter === "One to many" ? "one_to_many" : filter === "One to one" ? "one_to_one" : undefined;
      const payload = await listMeetings({ tab, meeting_type: meetingType });
      setMeetings(payload.meetings.map((item: Meeting) => toMeetingRow(item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load meetings.");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [tab, filter]);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  return (
    <section
      className={`relative flex h-full min-h-[320px] flex-col rounded-[18px] bg-white p-4 shadow-[0_8px_28px_rgba(45,50,90,0.06)] sm:min-h-[420px] sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            className={`truncate font-semibold ${
              showAddPerson ? "text-[16px] text-[#666CFF]" : "text-[18px] text-[#2B2B38]"
            }`}
          >
            {title}
          </h2>
          {showAddPerson ? (
            <Tooltip label="Add meeting">
              <button
                type="button"
                aria-label="Add meeting"
                onClick={() => setTypeModalOpen(true)}
                className="inline-flex size-8 items-center justify-center rounded-full bg-[#EEF0FF] text-[#666CFF]"
              >
                <NavIcon name="user" className="size-4" />
              </button>
            </Tooltip>
          ) : null}
        </div>
        {showSeeAll ? (
          <Link
            href={seeAllHref}
            className="inline-flex rounded-full bg-[#EEF0FF] px-3 py-1 text-[13px] text-[#666CFF]"
          >
            see all
          </Link>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[#EEF0F5]">
        <div className="flex gap-5 text-[12px] font-semibold tracking-[0.08em] sm:gap-6">
          <button
            type="button"
            onClick={() => setTab("today")}
            className={`pb-3 ${tab === "today" ? "border-b-2 border-[#666CFF] text-[#666CFF]" : "text-[#9A9AA8]"}`}
          >
            TODAY
          </button>
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`pb-3 ${tab === "upcoming" ? "border-b-2 border-[#666CFF] text-[#666CFF]" : "text-[#9A9AA8]"}`}
          >
            UPCOMING
          </button>
        </div>
        {showFilter ? (
          <div className="relative mb-2">
            <button
              type="button"
              onClick={() => setFilterOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#C9CCF5] px-3 py-1.5 text-[13px] text-[#666CFF]"
            >
              {filter}
              <NavIcon name="chevron" className="size-4 rotate-90" />
            </button>
            {filterOpen ? (
              <div className="absolute right-0 z-20 mt-2 min-w-[140px] overflow-hidden rounded-[10px] border border-[#E8EAF2] bg-white py-1 shadow-lg">
                {["All", "One to one", "One to many"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setFilter(option);
                      setFilterOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-[13px] text-[#4F4F5F] hover:bg-[#F7F8FC]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-[13px] text-[#D14343]">{error}</p> : null}
      {loading ? <MeetingListSkeleton /> : null}

      {!loading ? (
        <ul className="mt-2 flex-1 space-y-1 overflow-auto pr-1">
          {meetings.length === 0 ? (
            <li className="py-8 text-center text-[13px] text-[#8A8A9A]">No meetings found.</li>
          ) : null}
          {meetings.map((item) => {
            const disabled = Boolean(item.cancelled);
            return (
              <li key={item.id} className="flex items-center gap-3 border-b border-[#F3F4F8] py-3 last:border-b-0">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p
                    className={`truncate text-[14px] font-medium ${
                      item.cancelled ? "text-[#E25555] line-through" : "text-[#2B2B38]"
                    }`}
                  >
                    {item.title}
                    {item.cancelled ? " (cancelled)" : ""}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-[12px] text-[#8A8A9A]">
                    <NavIcon name="calendar" className="size-3.5 shrink-0 text-[#A8A8B8]" />
                    <span className="truncate">
                      {item.date} | {item.time}
                    </span>
                  </p>
                </div>
                <div className={`flex shrink-0 items-center gap-1.5 ${disabled ? "opacity-40" : ""}`}>
                  <ActionChip
                    tone="green"
                    icon="check"
                    label="Meeting feedback"
                    disabled={disabled}
                    onClick={() => {
                      setActiveMeeting(item);
                      setFeedbackOpen(true);
                    }}
                  />
                  <ActionChip
                    tone="red"
                    icon="close"
                    label="Meeting cancellation"
                    disabled={disabled}
                    onClick={() => {
                      setActiveMeeting(item);
                      setCancelOpen(true);
                    }}
                  />
                  <ActionChip
                    tone="gray"
                    icon="history"
                    label="Meeting reschedule"
                    disabled={disabled}
                    onClick={() => {
                      setActiveMeeting(item);
                      setRescheduleOpen(true);
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {showFab ? (
        <div className="absolute bottom-5 right-5 z-10">
          <Tooltip label="Add meeting">
            <button
              type="button"
              aria-label="Add meeting"
              onClick={() => setTypeModalOpen(true)}
              className="inline-flex size-12 items-center justify-center rounded-full bg-[#666CFF] text-white shadow-[0_10px_24px_rgba(102,108,255,0.35)]"
            >
              <NavIcon name="plus" className="size-5" />
            </button>
          </Tooltip>
        </div>
      ) : null}

      <SelectMeetingTypeModal open={typeModalOpen} onClose={() => setTypeModalOpen(false)} />
      <SendFeedbackModal
        open={feedbackOpen}
        meetingId={activeMeeting?.id}
        onClose={() => setFeedbackOpen(false)}
        onSubmitted={() => void loadMeetings()}
      />
      <CancellationModal
        open={cancelOpen}
        meetingId={activeMeeting?.id}
        onClose={() => setCancelOpen(false)}
        onSubmitted={() => void loadMeetings()}
      />
      <RescheduleModal
        open={rescheduleOpen}
        meetingId={activeMeeting?.id}
        initialStartsAt={activeMeeting?.startsAt}
        initialLocation={activeMeeting?.location}
        initialLocationKind={activeMeeting?.locationKind}
        onClose={() => setRescheduleOpen(false)}
        onSubmitted={() => void loadMeetings()}
      />
    </section>
  );
}

function ActionChip({
  tone,
  icon,
  label,
  disabled,
  onClick,
}: {
  tone: "green" | "red" | "gray";
  icon: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const styles = {
    green: "bg-[#E8F8EE] text-[#2F9E5F]",
    red: "bg-[#FDECEC] text-[#D14343]",
    gray: "bg-[#F1F2F6] text-[#7A7A8A]",
  }[tone];
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={`inline-flex size-8 items-center justify-center rounded-[8px] ${styles} disabled:cursor-not-allowed`}
      >
        <NavIcon name={icon} className="size-3.5" />
      </button>
    </Tooltip>
  );
}
