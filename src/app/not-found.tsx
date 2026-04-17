import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1F1F1F] border border-[#2D2D2D] flex items-center justify-center">
            <SearchX size={32} className="text-[#6B7280]" />
          </div>
        </div>
        <p className="text-7xl font-bold text-[#1F1F1F] mb-4 select-none">404</p>
        <h1 className="text-2xl font-bold text-[#EDEDED] mb-3">Page not found</h1>
        <p className="text-[#9CA3AF] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#5B21B6] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors min-h-[48px]"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
