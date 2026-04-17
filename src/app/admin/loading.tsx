export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-40 bg-[#1A1A1A] rounded animate-pulse" />
        <div className="h-4 w-28 bg-[#1A1A1A] rounded animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="border border-[#1F1F1F] rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="bg-[#0D0D0D] border-b border-[#1F1F1F] px-4 py-3 flex gap-6">
          {[80, 160, 80, 60, 60, 60, 80, 80].map((w, i) => (
            <div
              key={i}
              className="h-3 bg-[#1A1A1A] rounded animate-pulse shrink-0"
              style={{ width: w }}
            />
          ))}
        </div>
        {/* Skeleton rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-4 border-b border-[#1F1F1F] last:border-0 flex gap-6 items-center"
          >
            <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] animate-pulse shrink-0" />
            <div className="h-4 w-40 bg-[#1A1A1A] rounded animate-pulse" />
            <div className="h-5 w-16 bg-[#1A1A1A] rounded-full animate-pulse" />
            <div className="h-4 w-12 bg-[#1A1A1A] rounded animate-pulse" />
            <div className="h-5 w-10 bg-[#1A1A1A] rounded-full animate-pulse" />
            <div className="h-4 w-8 bg-[#1A1A1A] rounded animate-pulse" />
            <div className="h-4 w-20 bg-[#1A1A1A] rounded animate-pulse" />
            <div className="flex gap-1">
              <div className="h-8 w-8 rounded-lg bg-[#1A1A1A] animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-[#1A1A1A] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
