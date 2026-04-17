# PixelDrop — Image Playground Feature Spec
**Feature:** Admin Playground Tab  
**Route:** `/admin/playground`  
**Purpose:** Transform AI-generated images into production-ready sellable files at correct dimensions  
**No API key required** — all processing is client-side via HTML5 Canvas API

---

## 1. Overview

Add a new **Playground** tab to the admin portal navigation (alongside Dashboard, Products, Orders).

The Playground is an in-browser image transformation tool. The admin drops an AI-generated image, adjusts the crop/position for each output format, then downloads high-quality files ready to upload as product deliverables.

**Core principle:** Zero server processing. Everything runs in the browser using the Canvas API with `imageSmoothingQuality: 'high'` and PNG export for lossless output.

---

## 2. Navigation Update

Add "Playground" tab to the existing admin nav bar at `/admin/playground`.

Icon suggestion: `Wand2` from lucide-react (or similar creative/magic icon).

Nav order: Dashboard · Products · Orders · **Playground**

---

## 3. Output Formats

### 3.1 Smartphone Wallpapers

| Device | Width (px) | Height (px) | Notes |
|--------|-----------|------------|-------|
| iPhone 16 Pro Max | 1320 | 2868 | Latest flagship |
| iPhone 16 Pro | 1206 | 2622 | |
| iPhone 16 / 16 Plus | 1179 | 2556 | Shared resolution |
| iPhone 15 Pro Max | 1290 | 2796 | |
| Samsung Galaxy S25 Ultra | 1440 | 3088 | Latest Samsung flagship |
| Samsung Galaxy S25+ | 1440 | 3120 | |
| Samsung Galaxy S25 | 1080 | 2340 | |

Export format: **PNG** (lossless, full quality)  
Filename pattern: `pixeldrop-[device-slug].png` e.g. `pixeldrop-iphone16promax.png`

### 3.2 Desktop / Laptop Wallpaper

| Format | Width (px) | Height (px) | Notes |
|--------|-----------|------------|-------|
| 4K UHD Universal | 3840 | 2160 | One universal size |

Export format: **PNG**  
Filename: `pixeldrop-desktop-4k.png`

### 3.3 Poster

| Format | Width (px) | Height (px) | Notes |
|--------|-----------|------------|-------|
| 4K Portrait Poster | 2160 | 3840 | Portrait orientation, print-ready |

Export format: **PNG**  
Filename: `pixeldrop-poster-4k.png`

---

## 4. UI Layout & Flow

### 4.1 Step 1 — Upload Zone

A large drag-and-drop zone at the top of the page:

- Accepts: JPG, PNG, WebP files
- Drag-and-drop or click-to-browse
- On file drop: display a full-width preview of the source image with its detected resolution (e.g. "Source: 1456 × 816 px")
- Show a warning if source resolution is below 2000px on either axis: "⚠️ Source image may be low resolution. Output quality may be reduced."

### 4.2 Step 2 — Format Tabs

Below the upload zone, show three tabs: **Smartphones** · **Desktop** · **Posters**

Each tab contains the format cards for that category (see Section 4.3).

### 4.3 Format Cards

Each output format gets a card with:

1. **Live preview canvas** — shows the crop region from the source image as it will appear in that format. The preview canvas is scaled down to fit the UI (e.g. max 300px wide or 400px tall) but internally renders at full resolution.

2. **Crop / Pan control** — a draggable interaction on the preview:
   - The source image is rendered inside the target aspect ratio box
   - User can **drag to pan** the source image to choose the best crop
   - A **zoom slider** (0.5× to 3×) to zoom in/out within the frame
   - "Reset" button to return to centered crop

3. **Format label** — e.g. "iPhone 16 Pro Max · 1320 × 2868"

4. **Download button** — "⬇ Download PNG"
   - On click: renders the full-resolution canvas offscreen and triggers a file download
   - Show a brief "Rendering…" spinner since large canvases take a moment
   - Button becomes "✓ Downloaded" briefly after success

5. **Copy crop to all** button per category group — applies the same pan/zoom values to all other formats in that tab (useful since most phone sizes share similar aspect ratios)

### 4.4 Batch Download

At the bottom of each tab: **"Download All [Category]"** button  
→ Renders and downloads all formats in that tab as a ZIP file using JSZip library (load from CDN: `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`)  
→ ZIP filename: `pixeldrop-smartphones.zip` / `pixeldrop-desktop.zip` / `pixeldrop-posters.zip`

At the very bottom of the page: **"Download Everything"** button → downloads all formats across all categories as a single ZIP: `pixeldrop-all-formats.zip`

---

## 5. Canvas Rendering Implementation

### 5.1 Crop Calculation

For each format card, the state tracks:
```typescript
{
  offsetX: number,  // pan offset in source-image pixels
  offsetY: number,  // pan offset in source-image pixels
  scale: number,    // zoom multiplier (1 = fit to fill)
}
```

The default state centers the source image and scales it to **cover** the target dimensions (like CSS `object-fit: cover`):
```typescript
const defaultScale = Math.max(
  targetWidth / sourceWidth,
  targetHeight / sourceHeight
)
```

### 5.2 High-Quality Rendering

When rendering to the offscreen canvas:
```typescript
ctx.imageSmoothingEnabled = true
ctx.imageSmoothingQuality = 'high'
```

Always render to an offscreen canvas at the **exact target resolution** (e.g. 1320×2868), not a scaled-down version.

### 5.3 PNG Export

```typescript
canvas.toBlob((blob) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}, 'image/png', 1.0)
```

---

## 6. Component Architecture (Next.js / React)

```
/app/admin/playground/
  page.tsx                    ← Main Playground page
  
/components/admin/playground/
  UploadZone.tsx              ← Drag & drop file input
  FormatTabs.tsx              ← Smartphones / Desktop / Posters tabs
  FormatCard.tsx              ← Individual format card with crop UI
  CropCanvas.tsx              ← Preview canvas with pan/zoom drag interaction
  BatchDownloadButton.tsx     ← ZIP download trigger
```

### State Management

Use React `useState` / `useRef` at the page level:
- `sourceImage: HTMLImageElement | null` — loaded source image
- `cropStates: Record<string, CropState>` — keyed by format slug

Pass `sourceImage` and crop state down to each `FormatCard`.

---

## 7. Styling Notes

Match the existing PixelDrop admin portal aesthetic (dark theme, consistent with Dashboard/Orders/Products pages). Use the same:
- Card styles, border-radius, shadow treatment
- Tab component style
- Button variants (primary, secondary, ghost)
- Color tokens / CSS variables already in use

The Playground page should feel native to the existing admin, not like a bolt-on tool.

---

## 8. Libraries Required

All loaded via CDN in the component or installed via npm:

| Library | Purpose | Source |
|---------|---------|--------|
| JSZip | ZIP file creation for batch download | `npm install jszip` or CDN |
| FileSaver.js | Reliable cross-browser file saving | `npm install file-saver` |

Both are small, no-dependency libraries safe to add to the project.

---

## 9. Acceptance Criteria

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Admin drops a JPG onto the upload zone | Image preview shown with source resolution |
| 2 | Admin switches to Smartphones tab | All 7 device format cards rendered with correct aspect ratios |
| 3 | Admin drags to pan within a format card | Crop position updates in real-time on the preview canvas |
| 4 | Admin adjusts zoom slider | Image zooms in/out within the target frame |
| 5 | Admin clicks "Download PNG" on iPhone 16 Pro Max | Downloads `pixeldrop-iphone16promax.png` at exactly 1320×2868 px |
| 6 | Admin clicks "Download All Smartphones" | Downloads ZIP with all 7 phone PNGs at full resolution |
| 7 | Admin clicks "Download Everything" | Single ZIP with all formats across all categories |
| 8 | Admin clicks "Copy crop to all" | All other cards in the tab adopt the same pan/zoom |
| 9 | Source image is portrait and target is landscape | Cover crop works correctly (no whitespace/letterboxing) |
| 10 | Admin navigates to `/admin/playground` without uploading | Clean empty state with upload prompt |

---

## 10. Empty State

When no image has been uploaded:
- Large upload zone centered on the page
- Supportive copy: "Drop your AI-generated image here to transform it into sellable wallpapers and posters"
- Accepted formats listed: JPG · PNG · WebP
- Subtle illustration or icon (wand / sparkles)

---

## 11. Performance Notes

- Large canvas rendering (3840×2160, 1440×3120) can take 1–3 seconds — always show a loading state on the download button
- The preview canvases in the cards should render at **scaled-down resolution** (for speed), only render at full resolution on download
- Use `requestAnimationFrame` for smooth pan/drag interactions on preview canvases
- Avoid re-rendering all cards when only one crop state changes (use `React.memo` or `useCallback`)
