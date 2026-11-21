import { apiFetch } from "@/lib/api/client";

export type Task = {
  id: string;
  title: string;
  due_date: string;
  done: boolean;
};

export type Reminder = {
  id: string;
  title: string;
  note: string;
  remind_at: string;
};

export function listTasks() {
  return apiFetch<{ tasks: Task[] }>("/api/v1/tasks");
}

export function createTask(input: { title: string; due_date: string }) {
  return apiFetch<{ task: Task }>("/api/v1/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTask(id: string, input: { title: string; due_date: string; done: boolean }) {
  return apiFetch<{ task: Task }>(`/api/v1/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteTask(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/tasks/${id}`, { method: "DELETE" });
}

export function listReminders() {
  return apiFetch<{ reminders: Reminder[] }>("/api/v1/reminders");
}

export function createReminder(input: { title: string; note?: string; remind_at: string }) {
  return apiFetch<{ reminder: Reminder }>("/api/v1/reminders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateReminder(id: string, input: { title: string; note?: string; remind_at: string }) {
  return apiFetch<{ reminder: Reminder }>(`/api/v1/reminders/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteReminder(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/reminders/${id}`, { method: "DELETE" });
}
