import { createPublicClient } from '@/lib/supabase/server';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import type { Product } from '@/types';

export const revalidate = 3600;

const categoryLabels: Record<Product['category'], string> = {
  iphone: 'iPhone',
  desktop: 'Desktop',
  bundle: 'Bundle',
  other: 'Other',
};

const resolutionHints: Record<Product['category'], string> = {
  iphone: '2556 × 1179 px · iPhone 15 Pro',
  desktop: '3840 × 2160 px · 4K Desktop',
  bundle: 'Multiple resolutions included',
  other: 'High resolution',
};

// ISR — pre-render all active product pages at build time
export async function generateStaticParams() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true);
    return (data ?? []).map((p) => ({ slug: p.id }));
  } catch {
    return [];
  }
}

// Dynamic metadata per product
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('products')
      .select('name, description, preview_image_url')
      .eq('id', slug)
      .single();

    if (!data) return { title: 'Product Not Found' };

    return {
      title: data.name,
      description: data.description ?? undefined,
      openGraph: {
        title: data.name,
        description: data.description ?? undefined,
        images: data.preview_image_url ? [data.preview_image_url] : [],
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) notFound();

  const p = product as Product;
  const isPortrait = p.category === 'iphone';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Link
        href="/#products"
        className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#EDEDED] transition-colors mb-8"
      >
        <ChevronLeft size={16} />
        Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image — left on desktop, top on mobile */}
        <div className="space-y-4">
          {/* Main image */}
          <div
            className={`relative w-full rounded-2xl overflow-hidden bg-[#111111] border border-[#1F1F1F] ${
              isPortrait ? 'aspect-[9/16] max-w-xs mx-auto lg:mx-0' : 'aspect-video'
            }`}
          >
            {p.preview_image_url ? (
              <Image
                src={p.preview_image_url}
                alt={p.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#2D2D2D] text-sm">
                No preview available
              </div>
            )}
          </div>

          {/* Additional images carousel */}
          {p.additional_images && p.additional_images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {p.additional_images.map((url, i) => (
                <div
                  key={i}
                  className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[#111111] border border-[#1F1F1F]"
                >
                  <Image
                    src={url}
                    alt={`${p.name} preview ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details — right on desktop, below on mobile */}
        <div className="flex flex-col gap-6 lg:pt-4">
          {/* Category badge */}
          <div>
            <span className="inline-flex items-center rounded-full bg-[#5B21B6]/15 border border-[#5B21B6]/30 px-3 py-1 text-xs font-medium text-[#A78BFA]">
              {categoryLabels[p.category]}
            </span>
          </div>

          {/* Name + price */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#EDEDED] leading-tight">
              {p.name}
            </h1>
            <p className="mt-3 text-3xl font-bold text-[#EDEDED]">
              ${(p.price / 100).toFixed(2)}
            </p>
          </div>

          {/* Resolution spec */}
          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5B21B6]" />
            {resolutionHints[p.category]}
          </div>

          {/* Description */}
          {p.description && (
            <div>
              <p className="text-[#9CA3AF] leading-relaxed">{p.description}</p>
            </div>
          )}

          {/* Tags */}
          {p.tags && p.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#1F1F1F] border border-[#2D2D2D] px-3 py-1 text-xs text-[#9CA3AF]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Add to cart */}
          <div className="pt-2">
            <AddToCartButton product={p} />
          </div>

          {/* Trust signals */}
          <div className="border-t border-[#1F1F1F] pt-6 space-y-2.5">
            {[
              '✓ Instant email delivery after purchase',
              '✓ High resolution, ready to set as wallpaper',
              '✓ Secure payment via Stripe',
              '✓ Download link valid for 48 hours',
            ].map((line) => (
              <p key={line} className="text-sm text-[#6B7280]">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
