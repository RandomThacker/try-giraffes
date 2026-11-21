import { apiFetch } from "@/lib/api/client";

export type GroupSummary = {
  id: string;
  name: string;
  member_count: number;
  member_labels: string[];
};

export type GroupMember = {
  id: string;
  email: string;
  full_name: string;
};

export type GroupDetail = {
  id: string;
  name: string;
  members: GroupMember[];
};

export function listGroups() {
  return apiFetch<{ groups: GroupSummary[] }>("/api/v1/groups");
}

export function getGroup(id: string) {
  return apiFetch<{ group: GroupDetail }>(`/api/v1/groups/${id}`);
}

export function createGroup(input: { name: string; member_ids: string[] }) {
  return apiFetch<{ group: GroupDetail }>("/api/v1/groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteGroup(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/groups/${id}`, { method: "DELETE" });
}
