type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-[10px] bg-app-skeleton ${className}`} />;
}

export function PageContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.15fr_1fr_0.85fr]">
        <Skeleton className="min-h-[280px] rounded-[18px] sm:min-h-[420px]" />
        <Skeleton className="min-h-[280px] rounded-[18px] sm:min-h-[420px]" />
        <div className="space-y-4 lg:col-span-2 xl:col-span-1">
          <Skeleton className="min-h-[160px] rounded-[18px] sm:min-h-[200px]" />
          <Skeleton className="min-h-[160px] rounded-[18px] sm:min-h-[200px]" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-[120px] rounded-[18px]" />
        <Skeleton className="h-[120px] rounded-[18px]" />
        <Skeleton className="h-[120px] rounded-[18px]" />
        <Skeleton className="h-[120px] rounded-[18px]" />
      </div>
    </div>
  );
}

export function MeetingListSkeleton() {
  return (
    <div className="mt-4 space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 border-b border-app-border-2 py-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-[66%]" />
            <Skeleton className="h-3 w-[33%]" />
          </div>
          <Skeleton className="size-8 rounded-[8px]" />
          <Skeleton className="size-8 rounded-[8px]" />
          <Skeleton className="size-8 rounded-[8px]" />
        </div>
      ))}
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-svh bg-app-bg">
      <div className="hidden h-svh w-[248px] shrink-0 border-r border-app-border bg-app-sidebar p-4 lg:block">
        <Skeleton className="mb-8 h-7 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-5 lg:px-8">
          <Skeleton className="h-8 w-32 sm:w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full sm:size-11" />
            <Skeleton className="hidden h-10 w-28 sm:block" />
          </div>
        </div>
        <div className="flex-1 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <PageContentSkeleton />
        </div>
      </div>
    </div>
  );
}
