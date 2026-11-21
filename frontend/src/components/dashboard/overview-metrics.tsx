import { overviewMetrics } from "@/components/dashboard/dummy-data";
import { NavIcon } from "@/components/dashboard/nav-icons";

export function OverviewMetrics() {
  return (
    <section className="mt-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-[20px] font-semibold text-[#2B2B38]">Overview (Dummy)</h2>
        <p className="text-[13px] text-[#8A8A9A]">As on 12.04.23</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <article
            key={metric.id}
            className="rounded-[18px] bg-white p-5 shadow-[0_8px_28px_rgba(45,50,90,0.06)]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] font-medium text-[#6E6E80]">{metric.label}</p>
              <ChangeBadge tone={metric.changeTone} value={metric.change} />
            </div>
            <p
              className={`mt-3 text-[28px] font-semibold tracking-tight ${
                metric.valueTone === "negative" ? "text-[#D14343]" : "text-[#2B2B38]"
              }`}
            >
              {metric.value}
            </p>
            <p className="mt-2 text-[12px] text-[#8A8A9A]">
              vs Previous Month to Date{" "}
              <span className="font-medium text-[#5C5C6E]">{metric.previous}</span>
            </p>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#666CFF]">{metric.progress}%</span>
                <span className="text-[#8A8A9A]">{metric.target}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E8EAF3]">
                <div
                  className="h-full rounded-full bg-[#666CFF]"
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
      <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#FDECEC] px-2 py-1 text-[12px] font-semibold text-[#D14343]">
        <NavIcon name="arrow-down" className="size-3.5" />
        {value}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#FDECEC] px-2 py-1 text-[12px] font-semibold text-[#D14343]">
      <NavIcon name="arrow-down" className="size-3.5" />
      {value}
    </span>
  );
}
