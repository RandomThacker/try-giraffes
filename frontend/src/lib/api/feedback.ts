import { apiFetch } from "@/lib/api/client";

export type FeedbackQuestionType = "paragraph" | "mcq" | "linear_scale" | "checkbox";

export type FeedbackQuestion = {
  id: string;
  prompt: string;
  question_type: FeedbackQuestionType;
  options: string[];
  scale_min: number | null;
  scale_max: number | null;
  position: number;
};

export type FeedbackQuestionInput = {
  prompt: string;
  question_type: FeedbackQuestionType;
  options?: string[];
  scale_min?: number | null;
  scale_max?: number | null;
};

export type FeedbackAnswerInput = {
  question_id: string;
  answer_text?: string | null;
  answer_options?: string[];
  answer_scale?: number | null;
};

export function listFeedbackQuestions() {
  return apiFetch<{ questions: FeedbackQuestion[] }>("/api/v1/feedback-questions");
}

export function saveFeedbackQuestions(questions: FeedbackQuestionInput[]) {
  return apiFetch<{ questions: FeedbackQuestion[] }>("/api/v1/feedback-questions", {
    method: "PUT",
    body: JSON.stringify({ questions }),
  });
}

export function submitMeetingFeedbackAnswers(
  meetingId: string,
  input: { skipped?: boolean; answers: FeedbackAnswerInput[] },
) {
  return apiFetch<{ ok: boolean }>(`/api/v1/meetings/${meetingId}/feedback`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
