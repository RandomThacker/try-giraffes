"use client";

import { useState } from "react";
import { ModalShell } from "@/components/meetings/modal-shell";
import { OutlinedTextarea } from "@/components/meetings/outlined-field";
import { ApiError } from "@/lib/api/client";
import { cancelMeeting } from "@/lib/api/meetings";

type CancellationModalProps = {
  open: boolean;
  meetingId?: string;
  onClose: () => void;
  onSubmitted?: () => void;
};

export function CancellationModal({ open, meetingId, onClose, onSubmitted }: CancellationModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function onSubmit() {
    if (!meetingId) {
      onClose();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await cancelMeeting(meetingId, reason.trim() || "Cancelled");
      onSubmitted?.();
      setReason("");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to cancel meeting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell title="Meeting Cancellation Reason" onClose={onClose}>
      <p className="mb-4 text-[14px] text-app-muted-2">
        Can you please tell us more about the reason for cancellation of this meet?
      </p>
      <OutlinedTextarea
        label="Reason"
        value={reason}
        onChange={setReason}
        rows={5}
        placeholder="Lorem Ipsum dolor..."
      />
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
          disabled={submitting || !reason.trim()}
          onClick={() => void onSubmit()}
          className="rounded-[10px] bg-brand px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </ModalShell>
  );
}
