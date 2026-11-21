"use client";

import { MeetingSchedule } from "@/components/dashboard/meeting-schedule";
import { MessagesCard } from "@/components/dashboard/messages-card";
import { OverviewMetrics } from "@/components/dashboard/overview-metrics";
import { TasksReminders } from "@/components/dashboard/tasks-reminders";

export function DashboardPage() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.15fr_1fr_0.85fr]">
        <div className="order-1">
          <MeetingSchedule />
        </div>
        <div className="order-2 lg:order-3 lg:col-span-2 xl:order-3 xl:col-span-1">
          <TasksReminders />
        </div>
        <div className="order-3 lg:order-2 xl:order-2">
          <MessagesCard />
        </div>
      </div>
      <OverviewMetrics />
    </>
  );
}
