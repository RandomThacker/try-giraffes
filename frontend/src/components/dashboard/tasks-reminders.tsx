"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/dashboard/nav-icons";
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
    <div className="flex h-full min-h-[320px] flex-col gap-4 sm:min-h-[420px] lg:grid lg:grid-cols-2 xl:flex xl:flex-col">
      <section className="relative flex flex-1 flex-col rounded-[18px] bg-white p-4 shadow-[0_8px_28px_rgba(45,50,90,0.06)] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-[#2B2B38]">Tasks</h2>
            <Link href="/agenda" className="mt-1 inline-block text-[13px] text-[#666CFF] hover:underline">
              see all
            </Link>
          </div>
        </div>
        {loading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {tasks.length === 0 ? (
              <li className="rounded-[12px] bg-[#F7F8FC] px-3.5 py-3 text-[13px] text-[#8A8A9A]">
                No open tasks.
              </li>
            ) : null}
            {tasks.map((item) => (
              <li key={item.id} className="rounded-[12px] bg-[#F7F8FC] px-3.5 py-3">
                <p className="text-[14px] font-medium text-[#2B2B38]">{item.title}</p>
                <p className="mt-1 flex items-center gap-2 text-[12px] text-[#8A8A9A]">
                  <NavIcon name="calendar" className="size-3.5" />
                  {formatDueLabel(item.due_date)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="absolute bottom-4 right-4 z-10">
          <Tooltip label="Add task">
            <button
              type="button"
              aria-label="Add task"
              onClick={() => router.push("/agenda")}
              className="inline-flex size-11 items-center justify-center rounded-full bg-[#666CFF] text-white shadow-[0_10px_24px_rgba(102,108,255,0.35)]"
            >
              <NavIcon name="plus" className="size-5" />
            </button>
          </Tooltip>
        </div>
      </section>

      <section className="rounded-[18px] bg-white p-4 shadow-[0_8px_28px_rgba(45,50,90,0.06)] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-[#2B2B38]">Reminders</h2>
            <Link href="/agenda" className="mt-1 inline-block text-[13px] text-[#666CFF] hover:underline">
              see all
            </Link>
          </div>
        </div>
        {loading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {reminders.length === 0 ? (
              <li className="text-[13px] text-[#8A8A9A]">No reminders yet.</li>
            ) : null}
            {reminders.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="inline-flex size-10 items-center justify-center rounded-[10px] bg-[#EEF0FF] text-[#666CFF]">
                  <NavIcon name="bell" className="size-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-[#2B2B38]">{item.title}</p>
                  <p className="text-[12px] text-[#8A8A9A]">{formatRemindLabel(item.remind_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
