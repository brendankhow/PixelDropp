'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#EDEDED] mb-3">Something went wrong</h1>
        <p className="text-[#9CA3AF] mb-8">
          An unexpected error occurred. Please try again or go back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#5B21B6] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors min-h-[48px]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#1F1F1F] border border-[#2D2D2D] text-[#EDEDED] text-sm font-medium hover:bg-[#2D2D2D] transition-colors min-h-[48px]"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
