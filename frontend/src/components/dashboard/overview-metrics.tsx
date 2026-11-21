import { overviewMetrics } from "@/components/dashboard/dummy-data";
import { NavIcon } from "@/components/dashboard/nav-icons";
import { SeeAllPill } from "@/components/dashboard/see-all-pill";

export function OverviewMetrics() {
  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-medium text-app-fg">
          Overview
          <span className="ml-3 text-[11px] font-normal text-app-faint">As on 12.04.23</span>
        </h2>
        <SeeAllPill />
      </div>
      <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric) => {
          const progress = Math.max(0, Math.min(100, metric.progress));
          const blueWidth = Math.max(progress, 28);
          return (
            <div key={metric.id}>
              <article className="rounded-[22px] border border-[#C9CCF5] bg-[#FAFAFF] px-4 py-4 text-center dark:border-[#2e2e2e] dark:bg-[#101010]">
                <p className="text-[12px] font-medium text-brand">{metric.label}</p>
                <p
                  className={`mt-1 text-[26px] leading-9 font-bold tracking-tight ${
                    metric.valueTone === "negative" ? "text-app-danger" : "text-app-fg-strong"
                  }`}
                >
                  {metric.value}
                </p>
                <ChangeRow tone={metric.changeTone} value={metric.change} />
                <p className="mt-3 text-[10px] text-app-muted">vs Previous Month to Date</p>
                <div className="mx-auto mt-1 h-px w-14 bg-brand" />
                <p className="mt-2 text-[10px] text-brand">Previous Month</p>
                <p className="text-[15px] leading-5 font-bold text-app-fg-strong">
                  {metric.previous}
                </p>
              </article>

              <div className="mt-2 flex h-9 gap-0.5 px-1 text-[10px]">
                <div style={{ width: `${blueWidth}%` }} className="min-w-0">
                  <div className="h-2 rounded-full bg-brand" />
                  <p className="mt-1 text-right font-semibold text-brand">{metric.progress}%</p>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="h-2 rounded-full bg-[#5C6070] dark:bg-[#2a2a2a]" />
                  <p className="mt-1 text-right font-medium tracking-wide text-app-muted-2">
                    TARGET {metric.target}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChangeRow({ tone, value }: { tone: "up" | "down" | "na"; value: string }) {
  const positive = tone === "up";
  return (
    <div className="mt-1 flex items-center justify-center gap-1.5">
      <span
        className={`inline-flex size-5 items-center justify-center rounded-[5px] ${
          positive ? "bg-[#E3F6EA] text-[#2F9E5F] dark:bg-[#12281d] dark:text-[#4fd08a]" : "bg-app-danger-bg text-app-danger"
        }`}
      >
        <NavIcon name={positive ? "arrow-up" : "arrow-down"} className="size-3" />
      </span>
      <span className="text-[10px] text-app-muted">Growth</span>
      <span
        className={`text-[11px] font-semibold ${positive ? "text-[#2F9E5F] dark:text-[#4fd08a]" : "text-app-danger"}`}
      >
        {value}
      </span>
    </div>
  );
}
