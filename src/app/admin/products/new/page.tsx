import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
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
        <h1 className="text-2xl font-bold text-[#EDEDED]">Add New Product</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Fill in the details below. A Stripe product and price will be created automatically.
        </p>
      </div>

      <ProductForm mode="new" />
    </div>
  );
}
