import { overviewMetrics } from "@/components/dashboard/dummy-data";
import { NavIcon } from "@/components/dashboard/nav-icons";

export function OverviewMetrics() {
  return (
    <section className="mt-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-[20px] font-semibold text-app-fg">Overview (Dummy)</h2>
        <p className="text-[13px] text-app-muted">As on 12.04.23</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <article
            key={metric.id}
            className="rounded-[18px] bg-app-surface p-5 shadow-[var(--app-shadow)]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] font-medium text-app-muted-2">{metric.label}</p>
              <ChangeBadge tone={metric.changeTone} value={metric.change} />
            </div>
            <p
              className={`mt-3 text-[28px] font-semibold tracking-tight ${
                metric.valueTone === "negative" ? "text-app-danger" : "text-app-fg"
              }`}
            >
              {metric.value}
            </p>
            <p className="mt-2 text-[12px] text-app-muted">
              vs Previous Month to Date{" "}
              <span className="font-medium text-app-muted-2">{metric.previous}</span>
            </p>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[12px]">
                <span className="font-semibold text-brand">{metric.progress}%</span>
                <span className="text-app-muted">{metric.target}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-app-skeleton">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.max(0, Math.min(100, metric.progress))}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ChangeBadge({ tone, value }: { tone: "up" | "down" | "na"; value: string }) {
  if (tone === "up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#E8F8EE] px-2 py-1 text-[12px] font-semibold text-[#2F9E5F]">
        <NavIcon name="arrow-up" className="size-3.5" />
        {value}
      </span>
    );
  }
  if (tone === "down") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[8px] bg-app-danger-bg px-2 py-1 text-[12px] font-semibold text-app-danger">
        <NavIcon name="arrow-down" className="size-3.5" />
        {value}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-[8px] bg-app-danger-bg px-2 py-1 text-[12px] font-semibold text-app-danger">
      <NavIcon name="arrow-down" className="size-3.5" />
      {value}
    </span>
  );
}
