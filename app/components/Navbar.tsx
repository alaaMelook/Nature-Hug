"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, User, Settings, LogIn, LogOut } from "lucide-react";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useTranslation } from "./TranslationProvider";
import { useCart } from "@/lib/CartContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { checkAdminAccess, clearAdminCache, AdminUser } from "@/lib/adminAuthClient";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { cart } = useCart();
  const count = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const [user, setUser] = useState<any>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  // Memoized admin check to prevent unnecessary calls
  const checkAdmin = useCallback(async (userId: string) => {
    try {
      const admin = await checkAdminAccess();
      setAdminUser(admin);
    } catch (error) {
      console.error("Admin check failed:", error);
      setAdminUser(null);
    }
  }, []);

  // Optimized auth state handler
  const handleAuthStateChange = useCallback(async (session: any) => {
    setUser(session?.user ?? null);

    if (session?.user) {
      await checkAdmin(session.user.id);
    } else {
      setAdminUser(null);
      clearAdminCache();
    }
    setIsLoading(false);
  }, [checkAdmin]);

  useEffect(() => {
    setIsClient(true);

    // Initial auth check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await handleAuthStateChange(session);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await handleAuthStateChange(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, handleAuthStateChange]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearAdminCache();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [supabase]);

  const toggleMobileMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Memoized navigation items to prevent re-renders
  const navigationItems = useMemo(() => [
    { href: "/", label: t("Home") },
    { href: "/products", label: t("Shop") },
    { href: "/about", label: t("About") },
    { href: "/contact", label: t("Contact") },
  ], [t]);

  return (
    <nav className="bg-white pl-10 pr-10 md:pl-50 md:pr-50 sticky top-0 z-10 flex items-center justify-between shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold">
        <Link href="/" className="flex items-center">
          <Image
            src="https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/sign/product-images/logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGU3NTY3OC0zMDRhLTQ3OTUtYjdhZC04M2IwMzM3ZDY2ZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9sb2dvLmpwZyIsImlhdCI6MTc1NjM4MDIxNSwiZXhwIjo0OTA5OTgwMjE1fQ.D5eFaioyALpbvbK7LWj6Di0kI1-I3kAQKI0H-DVtiao"
            width={100}
            height={100}
            priority={true}
            alt="Logo Hug Nature"
          />
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-24 justify-between items-center">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center space-x-6" suppressHydrationWarning>
        <LanguageSwitcher />
        <Link
          href="/cart"
          className="relative text-primary-950 bg-primary-50 px-4 py-2 rounded-lg shadow-md transition-colors duration-300 border border-transparent hover:border-primary-300 hover:bg-primary-100 flex items-center text-sm md:text-base"
        >
          <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          {t("Cart")}
          {isClient && count > 0 && (
            <span className="absolute right-0 bottom-6 text-xs min-w-5 h-5 px-1 rounded-full text-primary-50 bg-primary-800 flex items-center justify-center font-sans">
              {count}
            </span>
          )}
        </Link>
        {/* User Menu Dropdown */}
        {user ? <div className="relative">
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className=" cursor-pointer flex items-center px-4 py-2 bg-primary-800 rounded-lg shadow-md border hover:bg-primary-100 text-primary-100 hover:text-primary-800"
          >

            <Settings className="w-5 h-5 fill:bg-primary-100 " />
          </button>

          {isOpen && (
            <div className="absolute text-center left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-20">


              {/* Profile */}
              {user && (
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              )}

              {/* Admin */}
              {adminUser && (
                <Link
                  href="/admin"
                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}

              {/* Auth */}
              {!user ? (
                <button
                  onClick={() => {
                    router.push("/login");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login / Signup
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              )}
            </div>
          )}
        </div> : <button
          onClick={() => {
            router.push("/login");
            setIsOpen(false);
          }}
          className="w-full flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login / Signup
        </button>}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden">
        <button onClick={toggleMobileMenu}>
          {isOpen ? (
            <X className="w-6 h-6 text-primary-900" />
          ) : (
            <Menu className="w-6 h-6 text-primary-900" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-md flex flex-col items-center py-4 space-y-2" suppressHydrationWarning>
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/cart"
            className="flex flex-row text-primary-950 hover:text-primary-300 transition-colors duration-300 text-xl"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {t("Cart")}
            {isClient && count > 0 && (
              <span className="text-xs w-5 h-5 rounded-full ml-2 text-bold text-primary-50 bg-primary-800 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          <LanguageSwitcher />

          {/* Mobile Auth Section */}
          {isLoading ? (
            <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded">
              Loading...
            </div>
          ) : (
            <>
              {user && (
                <Link
                  href="/profile"
                  className="bg-primary-50 px-4 py-2 rounded shadow-md border hover:bg-primary-100"
                  onClick={() => setIsOpen(false)}
                >
                  My Profile
                </Link>
              )}

              {adminUser && (
                <Link
                  href="/admin"
                  className="bg-red-600 text-white px-4 py-2 rounded shadow-md border hover:bg-red-700"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              {!user ? (
                <button
                  onClick={() => {
                    router.push("/login");
                    setIsOpen(false);
                  }}
                  className="bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700"
                >
                  Login / Signup
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700"
                >
                  Logout
                </button>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;