"use client";

import { useCallback, useEffect, useState } from "react";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { SeeAllPill } from "@/components/dashboard/see-all-pill";
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
      className={`relative flex flex-col overflow-hidden rounded-[14px] bg-app-surface p-4 shadow-[var(--app-shadow)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            className={`truncate font-medium ${
              showAddPerson ? "text-[16px] text-brand" : "text-[17px] text-app-fg"
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
                className="inline-flex size-8 items-center justify-center rounded-full bg-[#EEF0FF] text-brand"
              >
                <NavIcon name="user" className="size-4" />
              </button>
            </Tooltip>
          ) : null}
        </div>
        {showSeeAll ? <SeeAllPill href={seeAllHref} /> : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-b border-app-border-2">
        <div className="flex gap-6 text-[11px] font-medium tracking-[0.06em]">
          <button
            type="button"
            onClick={() => setTab("today")}
            className={`pb-2.5 ${tab === "today" ? "border-b-2 border-brand text-brand" : "text-app-faint"}`}
          >
            TODAY
          </button>
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`pb-2.5 ${tab === "upcoming" ? "border-b-2 border-brand text-brand" : "text-app-faint"}`}
          >
            UPCOMING
          </button>
        </div>
        {showFilter ? (
          <div className="relative mb-1.5">
            <button
              type="button"
              onClick={() => setFilterOpen((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#C9CCF5] px-2.5 py-1 text-[12px] font-normal text-app-fg dark:border-[#303030]"
            >
              {filter}
              <NavIcon name="chevron" className="size-4 rotate-90" />
            </button>
            {filterOpen ? (
              <div className="absolute right-0 z-20 mt-2 min-w-[140px] overflow-hidden rounded-[10px] border border-app-border bg-app-surface py-1 shadow-[var(--app-shadow-lg)]">
                {["All", "One to one", "One to many"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setFilter(option);
                      setFilterOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-[13px] text-app-fg hover:bg-app-muted-bg"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-[13px] text-app-danger">{error}</p> : null}
      {loading ? <MeetingListSkeleton /> : null}

      {!loading ? (
        <ul className="mt-1 flex-1 space-y-0 overflow-auto pb-14">
          {meetings.length === 0 ? (
            <li className="py-8 text-center text-[13px] text-app-muted">No meetings found.</li>
          ) : null}
          {meetings.map((item) => {
            const disabled = Boolean(item.cancelled);
            return (
              <li key={item.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-[12.5px] font-semibold text-app-fg">
                    <span className={item.cancelled ? "text-app-muted line-through" : undefined}>
                      {item.title}
                    </span>
                    {item.cancelled ? (
                      <span className="ml-1 text-[10px] font-normal italic text-[#E25555]">
                        (cancelled)
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-app-muted">
                    <NavIcon name="calendar" className="size-3 shrink-0 text-app-faint" />
                    <span className="truncate">
                      {item.date} | {item.time}
                    </span>
                  </p>
                </div>
                <div className={`flex shrink-0 items-center gap-1 ${disabled ? "opacity-40" : ""}`}>
                  <ActionChip
                    icon="check"
                    label="Meeting feedback"
                    disabled={disabled}
                    onClick={() => {
                      setActiveMeeting(item);
                      setFeedbackOpen(true);
                    }}
                  />
                  <ActionChip
                    icon="close"
                    label="Meeting cancellation"
                    disabled={disabled}
                    onClick={() => {
                      setActiveMeeting(item);
                      setCancelOpen(true);
                    }}
                  />
                  <ActionChip
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
        <div className="absolute bottom-4 right-4 z-10">
          <Tooltip label="Add meeting">
            <button
              type="button"
              aria-label="Add meeting"
              onClick={() => setTypeModalOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_20px_rgba(102,108,255,0.35)]"
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
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className="inline-flex size-7 items-center justify-center rounded-[6px] bg-[#F5F6FA] text-[#2B2B38] disabled:cursor-not-allowed dark:bg-app-chip dark:text-[#b8b8b8]"
      >
        <NavIcon name={icon} className="size-3.5" />
      </button>
    </Tooltip>
  );
}
