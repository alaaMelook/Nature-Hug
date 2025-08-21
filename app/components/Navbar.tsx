'use client'

import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

export default function Navbar() {
  const { cart } = useCart();
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="w-full sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex gap-4">
          <Link href="/" className="font-semibold">Home</Link>
          <Link href="/products">Products</Link>
        </div>
        <Link href="/cart" className="relative">
          🛒 Cart
          <span className="absolute -right-3 -top-2 text-xs min-w-5 h-5 px-1 rounded-full bg-black text-white flex items-center justify-center">
            {count}
          </span>
        </Link>
      </div>
    </div>
  );
}
