"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { OutlinedInput, OutlinedSelect, OutlinedTextarea } from "@/components/meetings/outlined-field";
import { ApiError } from "@/lib/api/client";
import {
  listFeedbackQuestions,
  saveFeedbackQuestions,
  type FeedbackQuestionInput,
  type FeedbackQuestionType,
} from "@/lib/api/feedback";
import { Skeleton } from "@/components/ui/skeleton";

type DraftQuestion = FeedbackQuestionInput & { key: string };

const typeLabels: Record<FeedbackQuestionType, string> = {
  paragraph: "Paragraph",
  mcq: "MCQ",
  linear_scale: "Linear scale",
  checkbox: "Checkbox",
};

function emptyQuestion(): DraftQuestion {
  return {
    key: crypto.randomUUID(),
    prompt: "",
    question_type: "paragraph",
    options: [],
    scale_min: 1,
    scale_max: 10,
  };
}

export function EditFeedbackQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeOpenIndex, setTypeOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    listFeedbackQuestions()
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setQuestions(
          payload.questions.map((question) => ({
            key: question.id,
            prompt: question.prompt,
            question_type: question.question_type,
            options: question.options,
            scale_min: question.scale_min ?? 1,
            scale_max: question.scale_max ?? 10,
          })),
        );
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
  }, []);

  async function onSubmit() {
    setSaving(true);
    setError(null);
    try {
      await saveFeedbackQuestions(
        questions.map((question) => ({
          prompt: question.prompt,
          question_type: question.question_type,
          options: question.options ?? [],
          scale_min: question.scale_min,
          scale_max: question.scale_max,
        })),
      );
      router.push("/agenda");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save questions.");
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[18px] bg-white p-5 shadow-[0_8px_28px_rgba(45,50,90,0.06)] sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[20px] font-semibold text-[#666CFF]"
        >
          <NavIcon name="arrow-left" className="size-5" />
          Edit Questions
        </button>
        <button
          type="button"
          disabled={saving || loading}
          onClick={() => void onSubmit()}
          className="rounded-[10px] bg-[#666CFF] px-4 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Submit"}
        </button>
      </div>

      {error ? <p className="mb-4 text-[13px] text-[#D14343]">{error}</p> : null}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {questions.map((question, index) => (
            <div key={question.key} className="rounded-[14px] border border-[#EEF0F5] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-[#2B2B38]">Question {index + 1}</p>
                <button
                  type="button"
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== index))}
                  className="text-[13px] text-[#D14343]"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
                <OutlinedTextarea
                  label="Question"
                  value={question.prompt}
                  onChange={(value) =>
                    setQuestions((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, prompt: value } : item)),
                    )
                  }
                  rows={2}
                />
                <OutlinedSelect
                  label="Type"
                  value={typeLabels[question.question_type]}
                  options={Object.values(typeLabels)}
                  open={typeOpenIndex === index}
                  onOpenChange={(open) => setTypeOpenIndex(open ? index : null)}
                  onChange={(label) => {
                    const entry = Object.entries(typeLabels).find(([, value]) => value === label);
                    const nextType = (entry?.[0] ?? "paragraph") as FeedbackQuestionType;
                    setQuestions((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              question_type: nextType,
                              options:
                                nextType === "mcq" || nextType === "checkbox"
                                  ? item.options?.length
                                    ? item.options
                                    : ["Label"]
                                  : [],
                            }
                          : item,
                      ),
                    );
                  }}
                />
              </div>

              {question.question_type === "mcq" || question.question_type === "checkbox" ? (
                <div className="mt-3 space-y-2">
                  {(question.options ?? []).map((option, optionIndex) => (
                    <OutlinedInput
                      key={`${question.key}-opt-${optionIndex}`}
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(value) =>
                        setQuestions((prev) =>
                          prev.map((item, i) => {
                            if (i !== index) {
                              return item;
                            }
                            const options = [...(item.options ?? [])];
                            options[optionIndex] = value;
                            return { ...item, options };
                          }),
                        )
                      }
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, options: [...(item.options ?? []), "Label"] } : item,
                        ),
                      )
                    }
                    className="text-[13px] font-medium text-[#666CFF]"
                  >
                    + Add option
                  </button>
                </div>
              ) : null}

              {question.question_type === "linear_scale" ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <OutlinedInput
                    label="Scale min"
                    type="number"
                    value={String(question.scale_min ?? 1)}
                    onChange={(value) =>
                      setQuestions((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, scale_min: Number(value) || 1 } : item,
                        ),
                      )
                    }
                  />
                  <OutlinedInput
                    label="Scale max"
                    type="number"
                    value={String(question.scale_max ?? 10)}
                    onChange={(value) =>
                      setQuestions((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, scale_max: Number(value) || 10 } : item,
                        ),
                      )
                    }
                  />
                </div>
              ) : null}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
            className="rounded-[10px] border border-dashed border-[#C9CCF5] px-4 py-3 text-[14px] font-medium text-[#666CFF]"
          >
            + Add more
          </button>
        </div>
      )}
    </div>
  );
}
