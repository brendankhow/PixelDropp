import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import type { Product } from '@/types';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  const product = data as Product;

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#EDEDED] transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Back to Products
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#EDEDED]">Edit Product</h1>
        <p className="text-sm text-[#9CA3AF] mt-1 truncate max-w-xl">
          {product.name}
        </p>
      </div>

      <ProductForm mode="edit" product={product} />
    </div>
  );
}
