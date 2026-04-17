export default function StoreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Category tabs skeleton */}
      <div className="flex gap-2 mb-10">
        {[80, 70, 90, 80].map((w, i) => (
          <div
            key={i}
            className="h-11 rounded-full bg-[#1F1F1F] animate-pulse"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-[#111111] border border-[#1F1F1F]"
          >
            {/* Image placeholder — alternates portrait/landscape */}
            <div
              className={`w-full bg-[#1A1A1A] animate-pulse ${
                i % 3 === 0 ? 'aspect-[9/16]' : 'aspect-video'
              }`}
            />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-[#1A1A1A] rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-[#1A1A1A] rounded animate-pulse" />
              <div className="flex items-center justify-between">
                <div className="h-6 w-16 bg-[#1A1A1A] rounded animate-pulse" />
                <div className="h-10 w-20 bg-[#1A1A1A] rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
