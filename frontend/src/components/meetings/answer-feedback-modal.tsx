"use client";

import { useMemo, useState } from "react";
import { ModalShell } from "@/components/meetings/modal-shell";
import { OutlinedTextarea } from "@/components/meetings/outlined-field";
import { ApiError } from "@/lib/api/client";
import {
  submitMeetingFeedbackAnswers,
  type FeedbackAnswerInput,
  type FeedbackQuestion,
} from "@/lib/api/feedback";

type AnswerFeedbackModalProps = {
  open: boolean;
  meetingId?: string;
  questions: FeedbackQuestion[];
  onClose: () => void;
  onSubmitted?: () => void;
};

export function AnswerFeedbackModal({
  open,
  meetingId,
  questions,
  onClose,
  onSubmitted,
}: AnswerFeedbackModalProps) {
  const [index, setIndex] = useState(0);
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [optionAnswers, setOptionAnswers] = useState<Record<string, string[]>>({});
  const [scaleAnswers, setScaleAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = questions[index];
  const isLast = index >= questions.length - 1;

  const answersPayload = useMemo(() => {
    return questions.map((question) => {
      const answer: FeedbackAnswerInput = { question_id: question.id };
      if (question.question_type === "paragraph") {
        answer.answer_text = textAnswers[question.id] ?? "";
      } else if (question.question_type === "linear_scale") {
        answer.answer_scale = scaleAnswers[question.id] ?? question.scale_min ?? 1;
      } else {
        answer.answer_options = optionAnswers[question.id] ?? [];
      }
      return answer;
    });
  }, [questions, textAnswers, optionAnswers, scaleAnswers]);

  if (!open || !current) {
    return null;
  }

  async function submit(skipped: boolean) {
    if (!meetingId) {
      onClose();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitMeetingFeedbackAnswers(meetingId, {
        skipped,
        answers: skipped ? [] : answersPayload,
      });
      onSubmitted?.();
      setIndex(0);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to submit feedback.");
      setSubmitting(false);
    }
  }

  function toggleOption(option: string, multi: boolean) {
    setOptionAnswers((prev) => {
      const existing = prev[current.id] ?? [];
      if (multi) {
        return {
          ...prev,
          [current.id]: existing.includes(option)
            ? existing.filter((item) => item !== option)
            : [...existing, option],
        };
      }
      return { ...prev, [current.id]: [option] };
    });
  }

  return (
    <ModalShell title="Meeting Feedback" onClose={onClose} widthClassName="max-w-[560px]">
      <p className="mb-4 text-[13px] text-app-muted">
        Question {index + 1} of {questions.length}
      </p>
      <p className="mb-4 text-[15px] font-medium text-app-fg">{current.prompt}</p>

      {current.question_type === "paragraph" ? (
        <OutlinedTextarea
          label="Answer"
          value={textAnswers[current.id] ?? ""}
          onChange={(value) => setTextAnswers((prev) => ({ ...prev, [current.id]: value }))}
          rows={4}
        />
      ) : null}

      {current.question_type === "mcq" || current.question_type === "checkbox" ? (
        <div className="space-y-2">
          {current.options.map((option) => {
            const selected = (optionAnswers[current.id] ?? []).includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option, current.question_type === "checkbox")}
                className={`flex w-full items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left text-[14px] ${
                  selected ? "border-brand bg-[#EEF0FF] text-brand" : "border-[#E0E0E0] text-app-fg"
                }`}
              >
                <span
                  className={`inline-flex size-4 items-center justify-center rounded-[4px] border ${
                    selected ? "border-brand bg-brand text-white" : "border-[#C8C8D0]"
                  }`}
                >
                  {selected ? "✓" : null}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      ) : null}

      {current.question_type === "linear_scale" ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({
            length: (current.scale_max ?? 10) - (current.scale_min ?? 1) + 1,
          }).map((_, offset) => {
            const value = (current.scale_min ?? 1) + offset;
            const selected = (scaleAnswers[current.id] ?? current.scale_min ?? 1) === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setScaleAnswers((prev) => ({ ...prev, [current.id]: value }))}
                className={`inline-flex size-10 items-center justify-center rounded-[10px] text-[14px] font-medium ${
                  selected ? "bg-brand text-white" : "bg-[#F1F2F6] text-[#4F4F5F]"
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-[13px] text-app-danger">{error}</p> : null}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            if (index === 0) {
              void submit(true);
              return;
            }
            setIndex((value) => value - 1);
          }}
          className="rounded-[10px] border border-[#D9DBE5] px-5 py-2.5 text-[14px] font-medium text-app-fg"
        >
          {index === 0 ? "Skip" : "Go back"}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            if (isLast) {
              void submit(false);
              return;
            }
            setIndex((value) => value + 1);
          }}
          className="rounded-[10px] bg-brand px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
        >
          {isLast ? (submitting ? "Submitting..." : "Submit") : "Next"}
        </button>
      </div>
    </ModalShell>
  );
}
