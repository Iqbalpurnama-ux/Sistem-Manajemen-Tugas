export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full flex flex-col gap-[24px]">
      {/* Banner Skeleton */}
      <div className="h-[92px] w-full rounded-[var(--r-lg)] bg-[var(--clay)] animate-pulse" style={{ boxShadow: '6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light)' }}></div>

      {/* Stats Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[24px]">
        <div className="h-[124px] rounded-[var(--r-lg)] bg-[var(--clay)] animate-pulse" style={{ boxShadow: '4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)' }}></div>
        <div className="h-[124px] rounded-[var(--r-lg)] bg-[var(--clay)] animate-pulse" style={{ boxShadow: '4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)' }}></div>
        <div className="h-[124px] rounded-[var(--r-lg)] bg-[var(--clay)] animate-pulse" style={{ boxShadow: '4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)' }}></div>
      </div>

      {/* Title & Filters Skeleton */}
      <div className="flex items-center justify-between p-[8px_8px_0]">
        <div className="w-[120px] h-[24px] bg-[var(--shadow-dark)]/20 animate-pulse rounded-[8px]"></div>
        <div className="flex gap-[10px]">
          <div className="w-[60px] h-[35px] bg-[var(--shadow-dark)]/20 animate-pulse rounded-[20px]"></div>
          <div className="w-[70px] h-[35px] bg-[var(--shadow-dark)]/20 animate-pulse rounded-[20px]"></div>
          <div className="w-[65px] h-[35px] bg-[var(--shadow-dark)]/20 animate-pulse rounded-[20px]"></div>
        </div>
      </div>

      {/* Tasks Skeleton */}
      <div className="flex flex-col gap-[20px]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[88px] w-full bg-[var(--clay)] animate-pulse rounded-[24px]" style={{ boxShadow: '4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)' }}></div>
        ))}
      </div>
    </div>
  )
}
