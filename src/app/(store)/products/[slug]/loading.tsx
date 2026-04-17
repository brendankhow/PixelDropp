export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb skeleton */}
      <div className="h-5 w-32 bg-[#1A1A1A] rounded animate-pulse mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image skeleton */}
        <div className="aspect-[9/16] max-w-xs mx-auto lg:mx-0 w-full rounded-2xl bg-[#1A1A1A] animate-pulse" />

        {/* Details skeleton */}
        <div className="flex flex-col gap-6 lg:pt-4">
          <div className="h-6 w-20 bg-[#1A1A1A] rounded-full animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-[#1A1A1A] rounded animate-pulse" />
            <div className="h-8 w-24 bg-[#1A1A1A] rounded animate-pulse" />
          </div>
          <div className="h-4 w-48 bg-[#1A1A1A] rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-[#1A1A1A] rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-[#1A1A1A] rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-[#1A1A1A] rounded animate-pulse" />
          </div>
          <div className="h-14 w-full bg-[#1A1A1A] rounded-xl animate-pulse mt-2" />
        </div>
      </div>
    </div>
  );
}
