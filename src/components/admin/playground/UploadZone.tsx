'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, Wand2 } from 'lucide-react';

export interface SourceImage {
  file: File;
  objectUrl: string;
  element: HTMLImageElement;
  width: number;
  height: number;
}

interface UploadZoneProps {
  onImageLoaded: (img: SourceImage) => void;
}

export function UploadZone({ onImageLoaded }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

  const processFile = useCallback((file: File) => {
    setError('');
    if (!ACCEPTED.includes(file.type)) {
      setError('Only JPG, PNG, and WebP files are accepted.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      onImageLoaded({ file, objectUrl, element: img, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError('Failed to load image. Please try another file.');
    };
    img.src = objectUrl;
  }, [onImageLoaded]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full max-w-2xl flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors ${
          isDragging
            ? 'border-[#5B21B6] bg-[#5B21B6]/10'
            : 'border-[#2D2D2D] bg-[#111111] hover:border-[#5B21B6]/50 hover:bg-[#5B21B6]/5'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#5B21B6]/15 border border-[#5B21B6]/30 flex items-center justify-center">
          {isDragging ? (
            <Upload size={28} className="text-[#A78BFA]" />
          ) : (
            <Wand2 size={28} className="text-[#A78BFA]" />
          )}
        </div>

        <div>
          <p className="text-base font-semibold text-[#EDEDED] leading-snug">
            Drop your AI-generated image here to transform it<br className="hidden sm:block" /> into sellable wallpapers and posters
          </p>
          <p className="mt-2 text-sm text-[#6B7280]">
            or <span className="text-[#A78BFA] underline underline-offset-2">click to browse</span>
          </p>
        </div>

        <p className="text-xs text-[#4B5563] tracking-wide">
          Accepted formats: JPG · PNG · WebP
        </p>
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
