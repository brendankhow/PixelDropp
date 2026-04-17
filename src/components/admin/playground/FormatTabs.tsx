'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { FormatCard, type CropState, DEFAULT_CROP } from './FormatCard';
import { BatchDownloadButton } from './BatchDownloadButton';
import {
  SMARTPHONE_FORMATS,
  DESKTOP_FORMATS,
  POSTER_FORMATS,
} from '@/lib/playground/formats';

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Smartphones', formats: SMARTPHONE_FORMATS, zip: 'pixeldrop-smartphones.zip' },
  { label: 'Desktop',     formats: DESKTOP_FORMATS,    zip: 'pixeldrop-desktop.zip' },
  { label: 'Posters',     formats: POSTER_FORMATS,     zip: 'pixeldrop-posters.zip' },
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface FormatTabsProps {
  sourceImage: HTMLImageElement | null;
  cropStates: Record<string, CropState>;
  onCropChange: (slug: string, state: CropState) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function FormatTabs({ sourceImage, cropStates, onCropChange }: FormatTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const { formats, zip } = TABS[activeTab];

  function getCropState(slug: string): CropState {
    return cropStates[slug] ?? DEFAULT_CROP;
  }

  function handleCopyCropToAll() {
    const firstState = getCropState(formats[0].slug);
    formats.slice(1).forEach((f) => onCropChange(f.slug, { ...firstState }));
  }

  return (
    <div className="space-y-5">

      {/* Tab bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
              i === activeTab
                ? 'bg-[#5B21B6]/20 text-[#A78BFA] border border-[#5B21B6]/30'
                : 'text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-[#1A1A1A] border border-transparent'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] opacity-60">({tab.formats.length})</span>
          </button>
        ))}
      </div>

      {/* Toolbar: copy-crop + batch download */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2.5 border-b border-[#1F1F1F]">
        {formats.length > 1 ? (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <p className="text-xs text-[#6B7280] hidden sm:block">
              Adjust one card, then apply the same crop to all.
            </p>
            <button
              type="button"
              onClick={handleCopyCropToAll}
              disabled={!sourceImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#3D3D3D] transition-colors disabled:opacity-30 disabled:pointer-events-none whitespace-nowrap"
            >
              <Copy size={12} />
              Copy crop to all
            </button>
          </div>
        ) : (
          <div /> /* spacer so batch button stays right */
        )}

        {/* Batch download button for this tab */}
        <div className="w-full sm:w-auto sm:ml-auto">
          <BatchDownloadButton
            sourceImage={sourceImage}
            formats={formats}
            cropStates={cropStates}
            zipFilename={zip}
            label={`Download All ${TABS[activeTab].label}`}
          />
        </div>
      </div>

      {/* Format card grid */}
      <div
        className={`grid gap-4 ${
          formats.length === 1
            ? 'grid-cols-1 max-w-xs'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {formats.map((fmt) => (
          <FormatCard
            key={fmt.slug}
            sourceImage={sourceImage}
            targetWidth={fmt.w}
            targetHeight={fmt.h}
            label={fmt.label}
            slug={fmt.slug}
            cropState={getCropState(fmt.slug)}
            onCropChange={onCropChange}
          />
        ))}
      </div>

    </div>
  );
}
