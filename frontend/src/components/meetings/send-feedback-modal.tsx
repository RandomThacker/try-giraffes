"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalShell } from "@/components/meetings/modal-shell";
import { AnswerFeedbackModal } from "@/components/meetings/answer-feedback-modal";
import { ApiError } from "@/lib/api/client";
import { listFeedbackQuestions, type FeedbackQuestion } from "@/lib/api/feedback";

type SendFeedbackModalProps = {
  open: boolean;
  meetingId?: string;
  onClose: () => void;
  onSubmitted?: () => void;
};

export function SendFeedbackModal({ open, meetingId, onClose, onSubmitted }: SendFeedbackModalProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerOpen, setAnswerOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listFeedbackQuestions()
      .then((payload) => {
        if (!cancelled) {
          setQuestions(payload.questions);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Unable to load questions.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <>
      <ModalShell title="Send Feedback Questions" onClose={onClose} widthClassName="max-w-[560px]">
        {loading ? <p className="text-[13px] text-[#8A8A9A]">Loading questions...</p> : null}
        {error ? <p className="text-[13px] text-[#D14343]">{error}</p> : null}
        {!loading && !error ? (
          <ol className="max-h-[360px] space-y-3 overflow-auto pr-1 text-[14px] text-[#2B2B38]">
            {questions.map((question, index) => (
              <li key={question.id} className="rounded-[10px] bg-[#F7F8FC] px-3 py-2.5">
                <span className="mr-2 font-semibold text-[#666CFF]">{index + 1}.</span>
                {question.prompt}
              </li>
            ))}
          </ol>
        ) : null}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/agenda/feedback-questions");
            }}
            className="rounded-[10px] border border-[#D9DBE5] px-5 py-2.5 text-[14px] font-medium text-[#2B2B38]"
          >
            Edit Questions
          </button>
          <button
            type="button"
            disabled={!meetingId || questions.length === 0}
            onClick={() => setAnswerOpen(true)}
            className="rounded-[10px] bg-[#666CFF] px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
          >
            Send to everyone
          </button>
        </div>
      </ModalShell>

      <AnswerFeedbackModal
        open={answerOpen}
        meetingId={meetingId}
        questions={questions}
        onClose={() => {
          setAnswerOpen(false);
          onClose();
        }}
        onSubmitted={() => {
          setAnswerOpen(false);
          onSubmitted?.();
          onClose();
        }}
      />
    </>
  );
}
