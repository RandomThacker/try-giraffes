import { apiFetch } from "@/lib/api/client";

export type MeetingTarget = {
  type: "user" | "group";
  id: string;
  label: string;
};

export type Meeting = {
  id: string;
  title: string;
  description: string;
  arn: string;
  mode: "instant" | "scheduled";
  meeting_type: "one_to_one" | "one_to_many";
  purpose: string;
  status: "scheduled" | "started" | "completed" | "cancelled";
  location: string | null;
  location_kind: "physical" | "virtual" | null;
  starts_at: string;
  ends_at: string | null;
  thumbnail_url: string | null;
  cancelled_at: string | null;
  participants: MeetingTarget[];
  broadcasts: MeetingTarget[];
};

export type DirectoryUser = {
  id: string;
  email: string;
  full_name: string;
};

export type DirectoryGroup = {
  id: string;
  name: string;
  member_count: number;
};

export type MeetingDirectory = {
  users: DirectoryUser[];
  groups: DirectoryGroup[];
};

export type CreateMeetingInput = {
  mode: "instant" | "scheduled";
  title: string;
  description?: string;
  arn?: string;
  meeting_type: "one_to_one" | "one_to_many";
  purpose: string;
  location?: string | null;
  location_kind?: "physical" | "virtual" | null;
  starts_at?: string | null;
  ends_at?: string | null;
  thumbnail_url?: string | null;
  participants: Array<{ type: "user" | "group"; id: string }>;
  broadcasts?: Array<{ type: "user" | "group"; id: string }>;
};

export function listMeetings(params?: { tab?: "today" | "upcoming" | "all"; meeting_type?: string }) {
  const query = new URLSearchParams();
  if (params?.tab) {
    query.set("tab", params.tab);
  }
  if (params?.meeting_type) {
    query.set("meeting_type", params.meeting_type);
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<{ meetings: Meeting[] }>(`/api/v1/meetings${suffix}`);
}

export function getMeetingDirectory() {
  return apiFetch<MeetingDirectory>("/api/v1/meetings/directory");
}

export function createMeeting(input: CreateMeetingInput) {
  return apiFetch<{ meeting: Meeting }>("/api/v1/meetings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}


export function cancelMeeting(meetingId: string, reason: string) {
  return apiFetch<{ meeting: Meeting }>(`/api/v1/meetings/${meetingId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function rescheduleMeeting(
  meetingId: string,
  input: {
    message?: string;
    starts_at: string;
    location?: string | null;
    location_kind?: "physical" | "virtual" | null;
  },
) {
  return apiFetch<{ meeting: Meeting }>(`/api/v1/meetings/${meetingId}/reschedule`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function purposeToApi(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, "_");
}

export function meetingTypeToApi(label: string): "one_to_one" | "one_to_many" {
  return label === "One to many" ? "one_to_many" : "one_to_one";
}

export function locationKindToApi(label: string): "physical" | "virtual" {
  return label === "Virtual" ? "virtual" : "physical";
}

export function formatMeetingDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function formatMeetingTimeRange(startsAt: string, endsAt: string | null): string {
  const start = new Date(startsAt);
  const startLabel = start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (!endsAt) {
    return startLabel;
  }
  const end = new Date(endsAt);
  const endLabel = end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${startLabel}-${endLabel}`;
}

export function toMeetingRow(meeting: Meeting) {
  return {
    id: meeting.id,
    title: meeting.title,
    date: formatMeetingDate(meeting.starts_at),
    time: formatMeetingTimeRange(meeting.starts_at, meeting.ends_at),
    cancelled: meeting.status === "cancelled",
    startsAt: meeting.starts_at,
    location: meeting.location,
    locationKind: meeting.location_kind,
  };
}
