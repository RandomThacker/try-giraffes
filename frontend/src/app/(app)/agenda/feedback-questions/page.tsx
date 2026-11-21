import type { Metadata } from "next";
import { EditFeedbackQuestionsPage } from "@/components/meetings/edit-feedback-questions-page";

export const metadata: Metadata = {
  title: "Edit Questions",
};

export default function FeedbackQuestionsRoute() {
  return <EditFeedbackQuestionsPage />;
}
