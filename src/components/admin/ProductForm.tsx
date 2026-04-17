'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Upload, FileText, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Spinner } from '@/components/ui/Spinner';
import type { Product } from '@/types';

interface ProductFormProps {
  mode: 'new' | 'edit';
  product?: Product;
}

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();

  // Text fields
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [category, setCategory] = useState<string>(product?.category ?? 'iphone');
  const [priceUsd, setPriceUsd] = useState(
    product ? (product.price / 100).toFixed(2) : ''
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  // Tags
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  // Preview image
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  // Additional images
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  // Deliverable file
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handlePreviewChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setPreviewFile(file);
    setPreviewObjectUrl(URL.createObjectURL(file));
  }

  function handleAdditionalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setAdditionalFiles((prev) => [...prev, ...files]);
    setAdditionalPreviews((prev) => [...prev, ...urls]);
  }

  function removeAdditional(index: number) {
    URL.revokeObjectURL(additionalPreviews[index]);
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, '');
      if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate
    if (mode === 'new' && !previewFile) {
      setError('Preview image is required');
      return;
    }
    if (mode === 'new' && !deliverableFile) {
      setError('Deliverable file is required');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set('name', name);
    formData.set('description', description);
    formData.set('category', category);
    formData.set('price', priceUsd);
    formData.set('is_active', String(isActive));
    formData.set('tags', tags.join(','));

    if (previewFile) formData.set('preview_image', previewFile);
    if (deliverableFile) formData.set('deliverable_file', deliverableFile);
    additionalFiles.forEach((f) => formData.append('additional_images', f));

    try {
      const url =
        mode === 'new'
          ? '/api/admin/products'
          : `/api/admin/products/${product!.id}`;
      const method = mode === 'new' ? 'POST' : 'PATCH';

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Failed to save product');

      toast.success(mode === 'new' ? 'Product created!' : 'Product updated!');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

      {/* Name */}
      <Input
        id="name"
        label="Product Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Aurora Borealis — iPhone"
        required
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-[#EDEDED]">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe your product…"
          className="w-full rounded-lg bg-[#111111] border border-[#1F1F1F] px-3 py-2.5 text-sm text-[#EDEDED] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent resize-none"
        />
      </div>

      {/* Category + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Select
          id="category"
          label="Category *"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="iphone">iPhone</option>
          <option value="desktop">Desktop</option>
          <option value="bundle">Bundle</option>
          <option value="other">Other</option>
        </Select>

        <Input
          id="price"
          label="Price (USD) *"
          type="number"
          min="0.50"
          step="0.01"
          value={priceUsd}
          onChange={(e) => setPriceUsd(e.target.value)}
          placeholder="4.99"
          required
        />
      </div>

      {/* Preview Image */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#EDEDED]">
          Preview Image {mode === 'new' ? '*' : '(leave empty to keep current)'}
        </label>
        <div
          className="relative border-2 border-dashed border-[#1F1F1F] rounded-xl p-6 text-center hover:border-[#5B21B6]/50 transition-colors cursor-pointer"
          onClick={() => previewInputRef.current?.click()}
        >
          {previewObjectUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={previewObjectUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-[#9CA3AF]">{previewFile?.name}</p>
            </div>
          ) : product?.preview_image_url && mode === 'edit' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden opacity-60">
                <Image
                  src={product.preview_image_url}
                  alt="Current preview"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-[#6B7280]">Current image — click to replace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus size={32} className="text-[#2D2D2D]" />
              <p className="text-sm text-[#9CA3AF]">Click to upload preview image</p>
              <p className="text-xs text-[#6B7280]">JPG, PNG, WebP</p>
            </div>
          )}
          <input
            ref={previewInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePreviewChange}
          />
        </div>
      </div>

      {/* Additional Images */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#EDEDED]">
          Additional Images
        </label>
        <div className="flex flex-wrap gap-3">
          {additionalPreviews.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
              <Image src={url} alt={`Additional ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeAdditional(i)}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#1F1F1F] hover:border-[#5B21B6]/50 transition-colors flex items-center justify-center cursor-pointer">
            <Upload size={20} className="text-[#6B7280]" />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAdditionalChange}
            />
          </label>
        </div>
      </div>

      {/* Deliverable File */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#EDEDED]">
          Deliverable File {mode === 'new' ? '*' : '(leave empty to keep current)'}
        </label>
        <label className="flex items-center gap-4 border border-[#1F1F1F] rounded-xl px-4 py-4 hover:border-[#5B21B6]/50 transition-colors cursor-pointer">
          <FileText size={24} className="text-[#9CA3AF] shrink-0" />
          <div className="flex-1 min-w-0">
            {deliverableFile ? (
              <>
                <p className="text-sm text-[#EDEDED] truncate">{deliverableFile.name}</p>
                <p className="text-xs text-[#9CA3AF]">
                  {(deliverableFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : mode === 'edit' && product?.file_path ? (
              <>
                <p className="text-sm text-[#EDEDED] truncate">
                  {product.file_path.split('/').pop()}
                </p>
                <p className="text-xs text-[#6B7280]">Current file — click to replace</p>
              </>
            ) : (
              <>
                <p className="text-sm text-[#9CA3AF]">Click to upload deliverable file</p>
                <p className="text-xs text-[#6B7280]">ZIP, PNG, PDF, or any format</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setDeliverableFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#111111] border border-[#1F1F1F]">
        <div>
          <p className="text-sm font-medium text-[#EDEDED]">Active</p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Active products appear on the storefront
          </p>
        </div>
        <Toggle checked={isActive} onChange={setIsActive} />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#EDEDED]">Tags</label>
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-[#111111] border border-[#1F1F1F] min-h-[52px]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 bg-[#5B21B6]/20 border border-[#5B21B6]/30 text-[#A78BFA] rounded-full px-3 py-1 text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-white transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length === 0 ? 'Type a tag and press Enter or comma' : ''}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-[#EDEDED] placeholder:text-[#6B7280] focus:outline-none"
          />
        </div>
        <p className="text-xs text-[#6B7280]">Press Enter or comma to add a tag</p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              {mode === 'new' ? 'Creating…' : 'Saving…'}
            </>
          ) : mode === 'new' ? (
            'Create Product'
          ) : (
            'Save Changes'
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.push('/admin/products')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
