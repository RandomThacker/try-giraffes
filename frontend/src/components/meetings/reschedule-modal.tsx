"use client";

import { useEffect, useState } from "react";
import { locationModeOptions } from "@/components/meetings/meeting-data";
import { ModalShell } from "@/components/meetings/modal-shell";
import { OutlinedInput, OutlinedSelect, OutlinedTextarea } from "@/components/meetings/outlined-field";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { ApiError } from "@/lib/api/client";
import { locationKindToApi, rescheduleMeeting } from "@/lib/api/meetings";

type RescheduleModalProps = {
  open: boolean;
  meetingId?: string;
  initialStartsAt?: string;
  initialLocation?: string | null;
  initialLocationKind?: "physical" | "virtual" | null;
  onClose: () => void;
  onSubmitted?: () => void;
};

function toLocalInputValue(iso?: string) {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function RescheduleModal({
  open,
  meetingId,
  initialStartsAt,
  initialLocation,
  initialLocationKind,
  onClose,
  onSubmitted,
}: RescheduleModalProps) {
  const [message, setMessage] = useState("");
  const [dateTime, setDateTime] = useState(toLocalInputValue(initialStartsAt));
  const [location, setLocation] = useState(initialLocation ?? "");
  const [mode, setMode] = useState<string>(initialLocationKind === "virtual" ? "Virtual" : "Physical");
  const [modeOpen, setModeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setMessage("");
    setDateTime(toLocalInputValue(initialStartsAt));
    setLocation(initialLocation ?? "");
    setMode(initialLocationKind === "virtual" ? "Virtual" : "Physical");
    setError(null);
  }, [open, initialStartsAt, initialLocation, initialLocationKind]);

  if (!open) {
    return null;
  }

  async function onSubmit() {
    if (!meetingId || !dateTime) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await rescheduleMeeting(meetingId, {
        message,
        starts_at: new Date(dateTime).toISOString(),
        location: mode === "Virtual" ? "Online" : location,
        location_kind: locationKindToApi(mode),
      });
      onSubmitted?.();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to reschedule meeting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell title="Meeting Reschedule" onClose={onClose} widthClassName="max-w-[560px]">
      <div className="space-y-4">
        <OutlinedTextarea label="Additional message" value={message} onChange={setMessage} rows={4} />
        <OutlinedInput
          label="Date-Time"
          value={dateTime}
          onChange={setDateTime}
          type="datetime-local"
          trailing={<NavIcon name="calendar" className="size-4 text-brand" />}
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <OutlinedInput
            label="Location"
            value={mode === "Virtual" ? "Online" : location}
            onChange={setLocation}
            readOnly={mode === "Virtual"}
          />
          <OutlinedSelect
            label="Type"
            value={mode}
            options={locationModeOptions}
            onChange={setMode}
            open={modeOpen}
            onOpenChange={setModeOpen}
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-[13px] text-app-danger">{error}</p> : null}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[10px] border border-[#D9DBE5] px-5 py-2.5 text-[14px] font-medium text-app-fg"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting || !dateTime}
          onClick={() => void onSubmit()}
          className="rounded-[10px] bg-brand px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </ModalShell>
  );
}
