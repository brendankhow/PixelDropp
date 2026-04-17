'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/types';

const categoryLabels: Record<Product['category'], string> = {
  iphone: 'iPhone',
  desktop: 'Desktop',
  bundle: 'Bundle',
  other: 'Other',
};

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const [added, setAdded] = useState(false);

  const isPortrait = product.category === 'iphone';

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#111111] border border-[#1F1F1F] hover:border-[#5B21B6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#5B21B6]/10"
    >
      {/* Image container */}
      <div
        className={`relative w-full overflow-hidden bg-[#0D0D0D] ${
          isPortrait ? 'aspect-[9/16]' : 'aspect-video'
        }`}
      >
        {product.preview_image_url ? (
          <Image
            src={product.preview_image_url}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#2D2D2D]">
            <ShoppingCart size={40} />
          </div>
        )}

        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-[#EDEDED] border border-white/10">
            {categoryLabels[product.category]}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-[#EDEDED] text-sm leading-snug group-hover:text-white transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-[#EDEDED]">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold min-h-[44px] transition-all duration-200 ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-[#5B21B6] text-white hover:bg-[#6D28D9] active:bg-[#4C1D95]'
            }`}
            aria-label={added ? 'Added to cart' : `Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check size={14} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
