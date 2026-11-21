type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-[10px] bg-[#E8EAF2] ${className}`} />;
}

export function PageContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_0.85fr]">
        <Skeleton className="min-h-[420px] rounded-[18px]" />
        <Skeleton className="min-h-[420px] rounded-[18px]" />
        <div className="space-y-4">
          <Skeleton className="min-h-[200px] rounded-[18px]" />
          <Skeleton className="min-h-[200px] rounded-[18px]" />
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
        <div key={index} className="flex items-center gap-3 border-b border-[#F3F4F8] py-3">
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
    <div className="flex min-h-svh bg-[#F3F8FB]">
      <div className="hidden h-svh w-[248px] shrink-0 border-r border-[#ECECF2] bg-[#F7F7F9] p-4 lg:block">
        <Skeleton className="mb-8 h-7 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:px-8">
          <Skeleton className="h-8 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="hidden h-10 w-28 sm:block" />
          </div>
        </div>
        <div className="flex-1 px-6 pb-8 lg:px-8">
          <PageContentSkeleton />
        </div>
      </div>
    </div>
  );
}
