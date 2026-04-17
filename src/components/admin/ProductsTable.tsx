'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, ExternalLink, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

const categoryLabels: Record<Product['category'], string> = {
  iphone: 'iPhone',
  desktop: 'Desktop',
  bundle: 'Bundle',
  other: 'Other',
};

interface ProductsTableProps {
  products: Product[];
  salesMap: Record<string, number>;
}

export function ProductsTable({ products, salesMap }: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleToggleActive(product: Product) {
    setTogglingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(
        !product.is_active ? 'Product activated' : 'Product set to draft'
      );
      startTransition(() => router.refresh());
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product removed from storefront');
      setConfirmDeleteId(null);
      startTransition(() => router.refresh());
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-[#1F1F1F] rounded-2xl">
        <ShoppingBag size={48} className="text-[#2D2D2D] mb-4" />
        <p className="text-[#9CA3AF] font-medium">No products yet</p>
        <p className="text-[#6B7280] text-sm mt-1">
          Add your first product to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1F1F1F]">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-[#1F1F1F] bg-[#0D0D0D]">
            {['Preview', 'Name', 'Category', 'Price', 'Status', 'Sales', 'Created', 'Actions'].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-[#1F1F1F] last:border-0 hover:bg-[#0D0D0D] transition-colors"
            >
              {/* Preview */}
              <td className="px-4 py-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#1A1A1A] shrink-0">
                  {product.preview_image_url ? (
                    <Image
                      src={product.preview_image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#2D2D2D]">
                      <ShoppingBag size={16} />
                    </div>
                  )}
                </div>
              </td>

              {/* Name */}
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-[#EDEDED] max-w-[180px] truncate">
                  {product.name}
                </p>
                {!product.stripe_price_id && (
                  <p className="text-xs text-amber-400 mt-0.5">No price set</p>
                )}
              </td>

              {/* Category */}
              <td className="px-4 py-3">
                <Badge variant="neutral">{categoryLabels[product.category]}</Badge>
              </td>

              {/* Price */}
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-[#EDEDED]">
                  {formatPrice(product.price)}
                </span>
              </td>

              {/* Status toggle */}
              <td className="px-4 py-3">
                {togglingId === product.id ? (
                  <Spinner size="sm" />
                ) : (
                  <Toggle
                    checked={product.is_active}
                    onChange={() => handleToggleActive(product)}
                    label={product.is_active ? 'Active' : 'Draft'}
                  />
                )}
              </td>

              {/* Sales */}
              <td className="px-4 py-3">
                <span className="text-sm text-[#9CA3AF]">
                  {salesMap[product.id] ?? 0}
                </span>
              </td>

              {/* Created */}
              <td className="px-4 py-3">
                <span className="text-xs text-[#6B7280]">
                  {new Date(product.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                {confirmDeleteId === product.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {deletingId === product.id ? 'Deleting…' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs text-[#6B7280] hover:text-[#EDEDED] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-[#1A1A1A] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <Link
                      href={`/products/${product.id}`}
                      target="_blank"
                      className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-[#1A1A1A] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Preview on storefront"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <button
                      onClick={() => setConfirmDeleteId(product.id)}
                      className="p-2 rounded-lg text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
