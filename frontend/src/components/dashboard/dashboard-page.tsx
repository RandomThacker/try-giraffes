"use client";

import { MeetingSchedule } from "@/components/dashboard/meeting-schedule";
import { MessagesCard } from "@/components/dashboard/messages-card";
import { OverviewMetrics } from "@/components/dashboard/overview-metrics";
import { TasksReminders } from "@/components/dashboard/tasks-reminders";

export function DashboardPage() {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_0.85fr]">
        <MeetingSchedule />
        <MessagesCard />
        <TasksReminders />
      </div>
      <OverviewMetrics />
    </>
  );
}
