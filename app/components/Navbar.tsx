"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function Navbar() {
  const { cart } = useCart();
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="w-full sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl md:text-2xl font-bold text-primary flex items-center">
          <img
            src="https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/sign/product-images/logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGU3NTY3OC0zMDRhLTQ3OTUtYjdhZC04M2IwMzM3ZDY2ZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9sb2dvLmpwZyIsImlhdCI6MTc1NTg3NDU4MywiZXhwIjo0OTA5NDc0NTgzfQ.HMkmbGV2IDyJh_vYNRP1vGlvoC42ZZqF5OIJ63pq8Eg"
            alt="Logo Hug Nature"
            className="w-14 h-14 object-contain"
          />
        </Link>

        {/* Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-[#d1bba3] transition-colors duration-300 font-medium">
            Home
          </Link>
          <Link href="/products" className="text-gray-600 hover:text-[#d1bba3] transition-colors duration-300 font-medium">
            Shop
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium">
            About
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium">
            Contact
          </Link>
        </div>

        {/* Right side: Language + Cart */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Link
            href="/cart"
            className="relative bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-300 flex items-center text-sm md:text-base"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Cart
            {count > 0 && (
              <span className="absolute -right-2 -top-2 text-xs min-w-5 h-5 px-1 rounded-full bg-black text-white flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
