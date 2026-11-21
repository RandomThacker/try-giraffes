"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { MeetingListCard } from "@/components/meetings/meeting-list-card";
import { ModalShell } from "@/components/meetings/modal-shell";
import { OutlinedInput, OutlinedTextarea } from "@/components/meetings/outlined-field";
import { ApiError } from "@/lib/api/client";
import {
  createReminder,
  createTask,
  deleteReminder,
  deleteTask,
  listReminders,
  listTasks,
  updateReminder,
  updateTask,
  type Reminder,
  type Task,
} from "@/lib/api/tasks";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";

function formatDueLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function toLocalDateInput(isoDate?: string) {
  if (isoDate) {
    return isoDate.slice(0, 10);
  }
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function toLocalDateTimeInput(iso?: string) {
  const date = iso ? new Date(iso) : new Date(Date.now() + 60 * 60 * 1000);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AgendaPage() {
  const [tab, setTab] = useState<"tasks" | "reminders">("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState(toLocalDateInput());

  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [reminderAt, setReminderAt] = useState(toLocalDateTimeInput());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksPayload, remindersPayload] = await Promise.all([listTasks(), listReminders()]);
      setTasks(tasksPayload.tasks);
      setReminders(remindersPayload.reminders);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load agenda items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
    [],
  );

  function openCreateTask() {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDue(toLocalDateInput());
    setTaskModalOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDue(toLocalDateInput(task.due_date));
    setTaskModalOpen(true);
  }

  function openCreateReminder() {
    setEditingReminder(null);
    setReminderTitle("");
    setReminderNote("");
    setReminderAt(toLocalDateTimeInput());
    setReminderModalOpen(true);
  }

  function openEditReminder(reminder: Reminder) {
    setEditingReminder(reminder);
    setReminderTitle(reminder.title);
    setReminderNote(reminder.note);
    setReminderAt(toLocalDateTimeInput(reminder.remind_at));
    setReminderModalOpen(true);
  }

  async function saveTask() {
    if (!taskTitle.trim()) {
      setError("Task title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title: taskTitle.trim(),
          due_date: taskDue,
          done: editingTask.done,
        });
      } else {
        await createTask({ title: taskTitle.trim(), due_date: taskDue });
      }
      setTaskModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTaskDone(task: Task) {
    setError(null);
    try {
      await updateTask(task.id, {
        title: task.title,
        due_date: task.due_date,
        done: !task.done,
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update task.");
    }
  }

  async function removeTask(id: string) {
    setError(null);
    try {
      await deleteTask(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete task.");
    }
  }

  async function saveReminder() {
    if (!reminderTitle.trim() || !reminderAt) {
      setError("Reminder title and time are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: reminderTitle.trim(),
        note: reminderNote.trim(),
        remind_at: new Date(reminderAt).toISOString(),
      };
      if (editingReminder) {
        await updateReminder(editingReminder.id, payload);
      } else {
        await createReminder(payload);
      }
      setReminderModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save reminder.");
    } finally {
      setSaving(false);
    }
  }

  async function removeReminder(id: string) {
    setError(null);
    try {
      await deleteReminder(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete reminder.");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
      <section className="rounded-[18px] bg-white p-5 shadow-[0_8px_28px_rgba(45,50,90,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F5] pb-3">
          <div className="flex gap-6 text-[12px] font-semibold tracking-[0.08em]">
            <button
              type="button"
              onClick={() => setTab("tasks")}
              className={`pb-2 ${tab === "tasks" ? "border-b-2 border-[#666CFF] text-[#666CFF]" : "text-[#9A9AA8]"}`}
            >
              TASKS
            </button>
            <button
              type="button"
              onClick={() => setTab("reminders")}
              className={`pb-2 ${tab === "reminders" ? "border-b-2 border-[#666CFF] text-[#666CFF]" : "text-[#9A9AA8]"}`}
            >
              REMINDERS
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-[10px] border border-[#E6E7EF] px-3 py-2 text-[13px] text-[#5C5C6E]">
              <NavIcon name="calendar" className="size-4 text-[#666CFF]" />
              {todayLabel}
            </span>
            <button
              type="button"
              onClick={() => (tab === "tasks" ? openCreateTask() : openCreateReminder())}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#666CFF] px-3.5 py-2 text-[13px] font-medium text-white"
            >
              <NavIcon name="plus" className="size-4" />
              {tab === "tasks" ? "New Task" : "New Reminder"}
            </button>
          </div>
        </div>

        {error ? <p className="mt-3 text-[13px] text-[#D14343]">{error}</p> : null}

        {loading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : tab === "tasks" ? (
          <div className="mt-4 overflow-hidden rounded-[12px] border border-[#EEF0F5]">
            <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr] bg-[#F7F8FC] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8A8A9A]">
              <span>Task name</span>
              <span>Due date</span>
              <span>Actions</span>
            </div>
            <ul>
              {tasks.length === 0 ? (
                <li className="px-4 py-8 text-center text-[13px] text-[#8A8A9A]">No tasks yet.</li>
              ) : null}
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="grid grid-cols-[1.4fr_0.7fr_0.8fr] items-center border-t border-[#EEF0F5] px-4 py-3"
                >
                  <span className={`text-[14px] font-medium ${task.done ? "text-[#8A8A9A] line-through" : "text-[#2B2B38]"}`}>
                    {task.title}
                  </span>
                  <span className="text-[13px] text-[#8A8A9A]">{formatDueLabel(task.due_date)}</span>
                  <div className="flex items-center gap-2">
                    <Tooltip label={task.done ? "Mark incomplete" : "Mark complete"}>
                      <button
                        type="button"
                        aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                        onClick={() => void toggleTaskDone(task)}
                        className={`inline-flex size-8 items-center justify-center rounded-[8px] ${
                          task.done
                            ? "bg-[#2F9E5F] text-white"
                            : "bg-[#E8F8EE] text-[#2F9E5F] hover:bg-[#D5F0E0]"
                        }`}
                      >
                        <NavIcon name="check" className="size-3.5" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Edit task">
                      <button
                        type="button"
                        aria-label="Edit task"
                        onClick={() => openEditTask(task)}
                        className="inline-flex size-8 items-center justify-center rounded-[8px] bg-[#F1F2F6] text-[#7A7A8A]"
                      >
                        <NavIcon name="history" className="size-3.5" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Delete task">
                      <button
                        type="button"
                        aria-label="Delete task"
                        onClick={() => void removeTask(task.id)}
                        className="inline-flex size-8 items-center justify-center rounded-[8px] bg-[#FDECEC] text-[#D14343]"
                      >
                        <NavIcon name="close" className="size-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-[12px] border border-[#EEF0F5]">
            <div className="grid grid-cols-[1.3fr_1fr_0.7fr] bg-[#F7F8FC] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8A8A9A]">
              <span>Reminder</span>
              <span>When</span>
              <span>Actions</span>
            </div>
            <ul>
              {reminders.length === 0 ? (
                <li className="px-4 py-8 text-center text-[13px] text-[#8A8A9A]">No reminders yet.</li>
              ) : null}
              {reminders.map((reminder) => (
                <li
                  key={reminder.id}
                  className="grid grid-cols-[1.3fr_1fr_0.7fr] items-center border-t border-[#EEF0F5] px-4 py-3"
                >
                  <div>
                    <p className="text-[14px] font-medium text-[#2B2B38]">{reminder.title}</p>
                    {reminder.note ? <p className="mt-1 text-[12px] text-[#8A8A9A]">{reminder.note}</p> : null}
                  </div>
                  <span className="text-[13px] text-[#8A8A9A]">
                    {new Date(reminder.remind_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Tooltip label="Edit reminder">
                      <button
                        type="button"
                        aria-label="Edit reminder"
                        onClick={() => openEditReminder(reminder)}
                        className="inline-flex size-8 items-center justify-center rounded-[8px] bg-[#F1F2F6] text-[#7A7A8A]"
                      >
                        <NavIcon name="history" className="size-3.5" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Delete reminder">
                      <button
                        type="button"
                        aria-label="Delete reminder"
                        onClick={() => void removeReminder(reminder.id)}
                        className="inline-flex size-8 items-center justify-center rounded-[8px] bg-[#FDECEC] text-[#D14343]"
                      >
                        <NavIcon name="close" className="size-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <MeetingListCard
        title="Meetings Scheduled"
        showSeeAll={false}
        showFab={false}
        showAddPerson
        className="min-h-[560px]"
      />

      {taskModalOpen ? (
        <ModalShell
          title={editingTask ? "Edit Task" : "New Task"}
          onClose={() => setTaskModalOpen(false)}
        >
          <div className="space-y-4">
            <OutlinedInput label="Task name" value={taskTitle} onChange={setTaskTitle} />
            <OutlinedInput label="Due date" type="date" value={taskDue} onChange={setTaskDue} />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setTaskModalOpen(false)}
              className="rounded-[10px] border border-[#D9DBE5] px-5 py-2.5 text-[14px] font-medium text-[#2B2B38]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveTask()}
              className="rounded-[10px] bg-[#666CFF] px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </ModalShell>
      ) : null}

      {reminderModalOpen ? (
        <ModalShell
          title={editingReminder ? "Edit Reminder" : "New Reminder"}
          onClose={() => setReminderModalOpen(false)}
        >
          <div className="space-y-4">
            <OutlinedInput label="Title" value={reminderTitle} onChange={setReminderTitle} />
            <OutlinedTextarea label="Note" value={reminderNote} onChange={setReminderNote} rows={3} />
            <OutlinedInput
              label="Remind at"
              type="datetime-local"
              value={reminderAt}
              onChange={setReminderAt}
            />
            <p className="text-[12px] text-[#9A9AA8]">
              Saved only for now — timed reminder delivery will be added later.
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setReminderModalOpen(false)}
              className="rounded-[10px] border border-[#D9DBE5] px-5 py-2.5 text-[14px] font-medium text-[#2B2B38]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveReminder()}
              className="rounded-[10px] bg-[#666CFF] px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
