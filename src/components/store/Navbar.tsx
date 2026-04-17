'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { CartDrawer } from './CartDrawer';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { getTotalItems, openCart } = useCartStore();
  // Zustand persist hydrates from localStorage only on the client.
  // Without this guard the server renders itemCount=0 while the client
  // immediately reads a non-zero value → React hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const itemCount = mounted ? getTotalItems() : 0;

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#1F1F1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-[#EDEDED] hover:text-white transition-colors"
            >
              <span className="text-[#5B21B6]">✦</span>
              PixelDrop
            </Link>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#111111] border border-[#1F1F1F] text-[#9CA3AF] hover:text-[#EDEDED] hover:border-[#2D2D2D] transition-colors"
              aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#5B21B6] text-[10px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
