import type { Metadata } from "next";
import { ScheduleMeetingPage } from "@/components/meetings/schedule-meeting-page";

export const metadata: Metadata = {
  title: "Schedule Meeting",
};

export default function ScheduleMeetingRoute() {
  return <ScheduleMeetingPage />;
}
