'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

type Category = 'all' | 'iphone' | 'desktop' | 'bundle';

const tabs: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'iPhone', value: 'iphone' },
  { label: 'Desktop', value: 'desktop' },
  { label: 'Bundles', value: 'bundle' },
];

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [activeTab, setActiveTab] = useState<Category>('all');

  const filtered =
    activeTab === 'all'
      ? products
      : products.filter((p) => p.category === activeTab);

  return (
    <section id="products" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Category filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-10 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] ${
              activeTab === tab.value
                ? 'bg-[#5B21B6] text-white shadow-lg shadow-[#5B21B6]/30'
                : 'bg-[#111111] text-[#9CA3AF] border border-[#1F1F1F] hover:text-[#EDEDED] hover:border-[#2D2D2D]'
            }`}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-60">
                ({products.filter((p) => p.category === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[#9CA3AF] text-lg">No products in this category yet.</p>
          <p className="text-[#6B7280] text-sm mt-2">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      )}
    </section>
  );
}
