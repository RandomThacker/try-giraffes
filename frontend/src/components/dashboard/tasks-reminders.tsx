"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { SeeAllPill } from "@/components/dashboard/see-all-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { listReminders, listTasks, type Reminder, type Task } from "@/lib/api/tasks";

function formatDueLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function formatRemindLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TasksReminders() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksPayload, remindersPayload] = await Promise.all([listTasks(), listReminders()]);
      setTasks(tasksPayload.tasks.filter((task) => !task.done).slice(0, 4));
      setReminders(remindersPayload.reminders.slice(0, 4));
    } catch {
      setTasks([]);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:h-full xl:grid-cols-1 xl:grid-rows-2">
      <section className="relative flex h-[200px] min-h-0 flex-col xl:h-auto overflow-hidden rounded-[14px] bg-app-surface p-4 shadow-[var(--app-shadow)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-medium text-app-fg">Tasks</h2>
          <SeeAllPill href="/agenda?tab=tasks" />
        </div>
        {loading ? (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <ul className="mt-2 flex-1 space-y-2 overflow-auto pr-10">
            {tasks.length === 0 ? (
              <li className="text-[12px] text-app-muted">No open tasks.</li>
            ) : null}
            {tasks.map((item) => (
              <li key={item.id}>
                <p className="truncate text-[12.5px] font-semibold text-app-fg">{item.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-app-muted">
                  <NavIcon name="calendar" className="size-3 text-app-faint" />
                  {formatDueLabel(item.due_date)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="absolute right-3 bottom-3 z-10">
          <Tooltip label="Add task">
            <button
              type="button"
              aria-label="Add task"
              onClick={() => router.push("/agenda?tab=tasks")}
              className="inline-flex size-10 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_20px_rgba(102,108,255,0.35)]"
            >
              <NavIcon name="plus" className="size-5" />
            </button>
          </Tooltip>
        </div>
      </section>

      <section className="flex h-[200px] min-h-0 flex-col xl:h-auto overflow-hidden rounded-[14px] bg-app-surface p-4 shadow-[var(--app-shadow)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-medium text-app-fg">Reminders</h2>
          <SeeAllPill href="/agenda?tab=reminders" />
        </div>
        {loading ? (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <ul className="mt-2 flex-1 space-y-2 overflow-auto">
            {reminders.length === 0 ? (
              <li className="text-[12px] text-app-muted">No reminders yet.</li>
            ) : null}
            {reminders.map((item) => (
              <li key={item.id}>
                <p className="truncate text-[12.5px] font-semibold text-app-fg">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-app-muted">{formatRemindLabel(item.remind_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
