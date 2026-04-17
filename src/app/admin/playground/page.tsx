'use client';

import { useState, useCallback } from 'react';
import { ImageIcon, RefreshCw } from 'lucide-react';
import { UploadZone, type SourceImage } from '@/components/admin/playground/UploadZone';

export default function PlaygroundPage() {
  const [source, setSource] = useState<SourceImage | null>(null);

  const handleImageLoaded = useCallback((img: SourceImage) => {
    if (source?.objectUrl) URL.revokeObjectURL(source.objectUrl);
    setSource(img);
  }, [source]);

  const isLowRes = source
    ? source.width < 2000 || source.height < 2000
    : false;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#EDEDED]">Playground</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Transform AI-generated images into production-ready wallpapers and posters.
        </p>
      </div>

      {source ? (
        <>
          {/* Compact top bar */}
          <div className="flex items-center gap-4 bg-[#111111] border border-[#1F1F1F] rounded-2xl px-4 py-3">
            {/* Thumbnail */}
            <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-[#1A1A1A] shrink-0 border border-[#2D2D2D]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source.objectUrl}
                alt="Source"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#EDEDED] truncate">{source.file.name}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Source: {source.width.toLocaleString()} × {source.height.toLocaleString()} px
              </p>
            </div>

            {/* Low-res warning */}
            {isLowRes && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 shrink-0">
                ⚠️ Low resolution — output quality may be reduced
              </div>
            )}

            {/* Replace button */}
            <button
              onClick={() => setSource(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#3D3D3D] transition-colors min-h-[36px] shrink-0"
            >
              <RefreshCw size={13} />
              Replace image
            </button>
          </div>

          {/* Low-res warning — mobile (shows below bar) */}
          {isLowRes && (
            <div className="sm:hidden flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              ⚠️ Source image may be low resolution. Output quality may be reduced.
            </div>
          )}

          {/* Phase 2 placeholder */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2D2D2D] bg-[#111111] py-24 text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] flex items-center justify-center">
              <ImageIcon size={22} className="text-[#4B5563]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Format cards coming soon</p>
              <p className="text-xs text-[#4B5563] mt-1">Smartphone · Desktop · Poster outputs — Phase 2</p>
            </div>
          </div>
        </>
      ) : (
        /* Empty state — full upload zone */
        <div className="flex flex-col min-h-[520px]">
          <UploadZone onImageLoaded={handleImageLoaded} />
        </div>
      )}
    </div>
  );
}
