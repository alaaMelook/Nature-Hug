"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useTranslation } from "./TranslationProvider";
import { useCart } from "@/lib/CartContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { cart } = useCart();
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  const [user, setUser] = useState<any>(null);
  const supabase = createSupabaseBrowserClient();

  // ✅ متابعة حالة المستخدم
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    // ✅ استماع لأي تغيير في حالة auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/callback",
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white pl-10 pr-10 md:pl-50 md:pr-50 shadow-sm sticky top-0 z-10 flex items-center justify-between bg-white shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold">
        <Link href="/" className="flex items-center">
          <Image
            src="https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/sign/product-images/logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGU3NTY3OC0zMDRhLTQ3OTUtYjdhZC04M2IwMzM3ZDY2ZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9sb2dvLmpwZyIsImlhdCI6MTc1NjMyNDM0NSwiZXhwIjo0OTA5OTI0MzQ1fQ.yOVRgbf3jGMSV667elmHCsCDa71Go79ibtdyw0wYi6U"
            width={100}
            height={100}
            priority={true}
            alt="Logo Hug Nature"
          />
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-24 justify-between items-center">
        <Link
          href="/"
          className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
        >
          {t("Home")}
        </Link>
        <Link
          href="/products"
          className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
        >
          {t("Shop")}
        </Link>
        <Link
          href="/about"
          className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
        >
          {t("About")}
        </Link>
        <Link
          href="/contact"
          className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
        >
          {t("Contact")}
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        <LanguageSwitcher />

        {/* Cart */}
        <Link
          href="/cart"
          className="relative text-primary-950 bg-primary-50 px-4 py-2 rounded-lg shadow-md transition-colors duration-300 border border-transparent hover:border-primary-300 hover:bg-primary-100 flex items-center text-sm md:text-base"
        >
          <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          {t("Cart")}
          {count > 0 && (
            <span className="absolute right-0 bottom-6 text-xs min-w-5 h-5 px-1 rounded-full text-primary-50 bg-primary-800 flex items-center justify-center font-sans">
              {count}
            </span>
          )}
        </Link>

        {/* ✅ Profile Button */}
        {user && (
          <Link
            href="/profile"
            className="relative text-primary-950 bg-primary-50 px-4 py-2 rounded-lg shadow-md transition-colors duration-300 border border-transparent hover:border-primary-300 hover:bg-primary-100 flex items-center text-sm md:text-base"
          >
            <User className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Profile
          </Link>
        )}

        {/* ✅ Auth Buttons */}
        {!user ? (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700"
          >
            Login with Google
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700"
          >
            Logout
          </button>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <X className="w-6 h-6 text-primary-900" />
          ) : (
            <Menu className="w-6 h-6 text-primary-900" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-md flex flex-col items-center py-4 space-y-2">
          <Link
            href="/"
            className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
          >
            {t("Home")}
          </Link>
          <Link
            href="/products"
            className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
          >
            {t("Shop")}
          </Link>
          <Link
            href="/about"
            className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
          >
            {t("About")}
          </Link>
          <Link
            href="/contact"
            className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
          >
            {t("Contact")}
          </Link>
          <Link
            href="/cart"
            className="flex flex-row text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {t("Cart")}
            {count > 0 && (
              <span className="text-xs w-5 h-5 rounded-full ml-2 text-bold text-primary-50 bg-primary-800 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <LanguageSwitcher />

          {/* ✅ Profile in mobile */}
          {user && (
            <Link
              href="/profile"
              className="bg-primary-50 px-4 py-2 rounded shadow-md border hover:bg-primary-100"
            >
              My Profile
            </Link>
          )}

          {/* Auth */}
          {!user ? (
            <button
              onClick={handleLogin}
              className="bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700"
            >
              Login / Signup
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
