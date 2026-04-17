'use client';

import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { UploadZone, type SourceImage } from '@/components/admin/playground/UploadZone';
import { FormatTabs } from '@/components/admin/playground/FormatTabs';
import { BatchDownloadButton } from '@/components/admin/playground/BatchDownloadButton';
import type { CropState } from '@/components/admin/playground/FormatCard';
import { ALL_FORMATS } from '@/lib/playground/formats';

export default function PlaygroundPage() {
  const [source, setSource] = useState<SourceImage | null>(null);
  const [cropStates, setCropStates] = useState<Record<string, CropState>>({});

  const handleImageLoaded = useCallback((img: SourceImage) => {
    if (source?.objectUrl) URL.revokeObjectURL(source.objectUrl);
    setSource(img);
    setCropStates({}); // reset all crops when a new image is loaded
  }, [source]);

  const handleCropChange = useCallback((slug: string, state: CropState) => {
    setCropStates((prev) => ({ ...prev, [slug]: state }));
  }, []);

  const isLowRes = source ? source.width < 2000 || source.height < 2000 : false;

  return (
    <div className="space-y-6 pb-12">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#EDEDED]">Playground</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Transform AI-generated images into production-ready wallpapers and posters.
        </p>
      </div>

      {source ? (
        <>
          {/* ── Compact source bar ─────────────────────────────────────────── */}
          <div className="flex items-center gap-3 bg-[#111111] border border-[#1F1F1F] rounded-2xl px-4 py-3">
            {/* Thumbnail */}
            <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-[#1A1A1A] shrink-0 border border-[#2D2D2D]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={source.objectUrl} alt="Source" className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#EDEDED] truncate">{source.file.name}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Source: {source.width.toLocaleString()} × {source.height.toLocaleString()} px
              </p>
            </div>

            {/* Low-res warning (desktop) */}
            {isLowRes && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 shrink-0">
                ⚠️ Low resolution — output quality may be reduced
              </div>
            )}

            {/* Replace */}
            <button
              type="button"
              onClick={() => setSource(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#3D3D3D] transition-colors min-h-[40px] shrink-0"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Replace image</span>
              <span className="sm:hidden">Replace</span>
            </button>
          </div>

          {/* Low-res warning (mobile) */}
          {isLowRes && (
            <div className="sm:hidden flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              ⚠️ Source image may be low resolution. Output quality may be reduced.
            </div>
          )}

          {/* ── Format tabs + cards ────────────────────────────────────────── */}
          <FormatTabs
            sourceImage={source.element}
            cropStates={cropStates}
            onCropChange={handleCropChange}
          />

          {/* ── Download Everything ────────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-4 pt-6 mt-2 border-t border-[#1F1F1F]">
            <div className="text-center">
              <p className="text-sm font-semibold text-[#EDEDED]">Download Everything</p>
              <p className="text-xs text-[#6B7280] mt-1">
                All 9 formats — Smartphones · Desktop · Posters — in one ZIP.
              </p>
            </div>
            <BatchDownloadButton
              sourceImage={source.element}
              formats={ALL_FORMATS}
              cropStates={cropStates}
              zipFilename="pixeldrop-all-formats.zip"
              label="Download Everything (9 formats)"
              prominent
            />
          </div>
        </>
      ) : (
        <>
          {/* ── Empty state ────────────────────────────────────────────────── */}
          <div className="flex flex-col min-h-[520px]">
            <UploadZone onImageLoaded={handleImageLoaded} />
          </div>

          {/* Download Everything — disabled, shows helper text */}
          <div className="flex flex-col items-center gap-4 pt-6 mt-2 border-t border-[#1F1F1F]">
            <div className="text-center">
              <p className="text-sm font-semibold text-[#6B7280]">Download Everything</p>
              <p className="text-xs text-[#4B5563] mt-1">
                All 9 formats — Smartphones · Desktop · Posters — in one ZIP.
              </p>
            </div>
            <BatchDownloadButton
              sourceImage={null}
              formats={ALL_FORMATS}
              cropStates={{}}
              zipFilename="pixeldrop-all-formats.zip"
              label="Download Everything (9 formats)"
              prominent
            />
          </div>
        </>
      )}

    </div>
  );
}
