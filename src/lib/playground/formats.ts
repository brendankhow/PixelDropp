import type { CropState } from '@/components/admin/playground/FormatCard';
import { DEFAULT_CROP } from '@/components/admin/playground/FormatCard';

export interface FormatConfig {
  label: string;
  slug: string;
  w: number;
  h: number;
}

export const SMARTPHONE_FORMATS: FormatConfig[] = [
  { label: 'iPhone 16 Pro Max · 1320 × 2868',       slug: 'iphone16promax', w: 1320, h: 2868 },
  { label: 'iPhone 16 Pro · 1206 × 2622',            slug: 'iphone16pro',    w: 1206, h: 2622 },
  { label: 'iPhone 16 / 16 Plus · 1179 × 2556',      slug: 'iphone16',       w: 1179, h: 2556 },
  { label: 'iPhone 15 Pro Max · 1290 × 2796',        slug: 'iphone15promax', w: 1290, h: 2796 },
  { label: 'Samsung Galaxy S25 Ultra · 1440 × 3088', slug: 's25ultra',       w: 1440, h: 3088 },
  { label: 'Samsung Galaxy S25+ · 1440 × 3120',      slug: 's25plus',        w: 1440, h: 3120 },
  { label: 'Samsung Galaxy S25 · 1080 × 2340',       slug: 's25',            w: 1080, h: 2340 },
];

export const DESKTOP_FORMATS: FormatConfig[] = [
  { label: '4K UHD Universal · 3840 × 2160', slug: 'desktop4k', w: 3840, h: 2160 },
];

export const POSTER_FORMATS: FormatConfig[] = [
  { label: '4K Portrait Poster · 2160 × 3840', slug: 'poster4k', w: 2160, h: 3840 },
];

export const ALL_FORMATS: FormatConfig[] = [
  ...SMARTPHONE_FORMATS,
  ...DESKTOP_FORMATS,
  ...POSTER_FORMATS,
];

/** Renders source image to a full-resolution offscreen canvas and returns a PNG Blob. */
export function renderToBlob(
  sourceImage: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  cropState: CropState = DEFAULT_CROP,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('Could not get 2d context')); return; }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const coverScale = Math.max(
      targetWidth / sourceImage.naturalWidth,
      targetHeight / sourceImage.naturalHeight,
    );
    const totalScale = coverScale * cropState.scale;
    const drawnW = sourceImage.naturalWidth * totalScale;
    const drawnH = sourceImage.naturalHeight * totalScale;
    const drawX = (targetWidth - drawnW) / 2 + cropState.offsetX;
    const drawY = (targetHeight - drawnH) / 2 + cropState.offsetY;
    ctx.drawImage(sourceImage, drawX, drawY, drawnW, drawnH);

    canvas.toBlob(
      (blob) => { blob ? resolve(blob) : reject(new Error('toBlob returned null')); },
      'image/png',
      1.0,
    );
  });
}
