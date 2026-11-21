"use client";

import { MeetingSchedule } from "@/components/dashboard/meeting-schedule";
import { MessagesCard } from "@/components/dashboard/messages-card";
import { OverviewMetrics } from "@/components/dashboard/overview-metrics";
import { TasksReminders } from "@/components/dashboard/tasks-reminders";

export function DashboardPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-4 lg:grid-cols-2 xl:min-h-[260px] xl:flex-1 xl:grid-cols-[1.6fr_1.6fr_1fr] xl:grid-rows-[minmax(260px,1fr)]">
        <div className="order-1 min-w-0 xl:h-full">
          <MeetingSchedule />
        </div>
        <div className="order-2 min-w-0 lg:order-3 lg:col-span-2 xl:order-3 xl:col-span-1 xl:h-full">
          <TasksReminders />
        </div>
        <div className="order-3 min-w-0 lg:order-2 xl:order-2 xl:h-full">
          <MessagesCard />
        </div>
      </div>
      <OverviewMetrics />
    </div>
  );
}
