import type { Metadata } from "next";
import { InstantMeetingPage } from "@/components/meetings/instant-meeting-page";

export const metadata: Metadata = {
  title: "Create Instant Meeting",
};

export default function InstantMeetingRoute() {
  return <InstantMeetingPage />;
}
