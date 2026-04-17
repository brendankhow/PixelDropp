export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#5B21B6] border-t-transparent animate-spin" />
        <p className="text-sm text-[#6B7280]">Loading…</p>
      </div>
    </div>
  );
}
