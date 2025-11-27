"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FlaskConicalIcon, History, Home, InfoIcon, LogIn, LogOut, Menu, PhoneCall, Settings, ShoppingBag, ShoppingCart, Store, User, X } from "lucide-react";

import { useTranslation } from "react-i18next";

import { useSupabase } from "@/ui/hooks/useSupabase";
import { useCart } from "@/ui/providers/CartProvider";
import LanguageSwitcher from "../LanguageSwitcher";
import { useCurrentLanguage } from "@/ui/hooks/useCurrentLanguage";



export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { cart, getCartCount } = useCart();
    const count = useMemo(
        () => getCartCount(),
        [cart]
    );
    const { user, member, signOut, loading } = useSupabase();
    const router = useRouter();
    const { t } = useTranslation();
    const language = useCurrentLanguage();
    // Toggle mobile menu
    const toggleMobileMenu = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);
    const toggleSettingsMenu = useCallback(() => {
        setIsSettingsOpen((prev) => !prev);
    }, []);

    // Logout
    const handleLogout = useCallback(async () => {
        setIsOpen(false);
        setIsSettingsOpen(false);
        await signOut();
        router.push("/");
    }, [signOut, router]);

    const navigationItems = useMemo(
        () => [
            { href: "/", key: "home", icon: <Home className="w-5 h-5 mx-2 text-primary-900" /> },
            { href: "/products", key: "shop", icon: <Store className="w-5 h-5 mx-2 text-primary-900" /> },
            { href: "/about-us", key: "about", icon: <InfoIcon className="w-5 h-5 mx-2 text-primary-900" /> },
            { href: "/contact-us", key: "contact", icon: <PhoneCall className="w-5 h-5 mx-2 text-primary-900" /> },
        ],
        []
    );

    return (
        <nav className="bg-white pl-10 pr-10 sticky top-0 z-10 flex items-center justify-between shadow-md">
            {/* ---- Logo ---- */}
            <div className="text-xl font-bold flex items-center space-x-4 ">
                <Link href="/" className="flex items-center sm:w-30 sm:h-30 w-20 h-20 relative">
                    <Image
                        src="https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/sign/product-images/logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGU3NTY3OC0zMDRhLTQ3OTUtYjdhZC04M2IwMzM3ZDY2ZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9sb2dvLmpwZyIsImlhdCI6MTc1NjM4MDIxNSwiZXhwIjo0OTA5OTgwMjE1fQ.D5eFaioyALpbvbK7LWj6Di0kI1-I3kAQKI0H-DVtiao"
                        priority={true} alt="Logo Hug Nature"
                        fill={true} />
                </Link>
                <LanguageSwitcher />
            </div>

            {/* ---- Desktop Menu ---- */}

            <div className="hidden md:flex space-x-16 ">
                {navigationItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-lg"
                    >
                        {t(item.key)}
                    </Link>
                ))}
            </div>

            {/* ---- Desktop Right Section ---- */}
            <div className="hidden md:flex items-center space-x-4">


                {/* Cart */}
                <Link
                    href="/cart"
                    className="relative flex items-center bg-primary-10 px-4 py-2 rounded-lg shadow-md hover:bg-primary-100 transition"
                >
                    <ShoppingCart className="w-5 h-5 mx-2" />
                    {t('cart')}
                    {count > 0 && (
                        <span
                            className="absolute -right-2 -top-2 text-xs min-w-5 h-5 px-1 rounded-full  font-semibold text-primary-950 bg-primary-50 flex items-center justify-center shadow-xs shadow-primary-300">
                            {count}
                        </span>
                    )}
                </Link>

                {/* Auth Buttons */}
                {loading ? (
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                    </div>
                ) : user ? (
                    <div className="relative">
                        <button
                            onClick={toggleSettingsMenu}
                            className="cursor-pointer flex items-center px-3 py-2 bg-primary-10 text-primary-950 rounded-lg "
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        {isSettingsOpen && (
                            <div className={"absolute mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-20" + (language == 'en' ? ' right-0' : ' left-0')}>
                                <Link
                                    href="/profile"
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100"
                                >
                                    <User className="w-4 h-4 mx-2" />
                                    {t('profile')}
                                </Link>
                                {member && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                                    >
                                        <FlaskConicalIcon className="w-4 h-4 mx-2" />
                                        {t('adminPanel')}
                                    </Link>
                                )}
                                <Link
                                    href="/orders"
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100"
                                >
                                    <History className="w-4 h-4 mx-2" />
                                    {t('orderHistory')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 mx-2" />
                                    {t('logout')}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => router.push("/login")}
                        className="flex items-center px-4 py-2 text-md bg-primary-10 text-primary-950 rounded-lg  border-primary-950 border-1"
                    >
                        {t('login')}
                    </button>
                )}
            </div>

            {/* ---- Mobile Menu Toggle ---- */}
            <div className="md:hidden flex gap-3">
                <Link
                    href="/cart"
                    className="relative flex items-center "
                >
                    <ShoppingBag className="w-5 h-5 mx-2 text-primary-900" />

                    {count > 0 && (
                        <span
                            className="absolute -right-2 -top-2 text-xs min-w-5 h-5 px-1 rounded-full  font-semibold text-primary-950 bg-primary-50 flex items-center justify-center shadow-xs shadow-primary-300">
                            {count}
                        </span>
                    )}
                </Link>
                <button onClick={toggleMobileMenu}>
                    {isOpen ? (
                        <X className="w-6 h-6 text-primary-900" />
                    ) : (
                        <Menu className="w-6 h-6 text-primary-900" />
                    )}
                </button>
            </div>

            {/* ---- Mobile Menu ---- */}
            {isOpen && (
                <div
                    className="md:hidden absolute top-20 left-0 w-full bg-white shadow-md flex flex-col items-start py-4 space-y-2 z-50">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-primary-950 hover:text-primary-300 text-lg mx-5 flex"
                            onClick={() => setIsOpen(false)}
                        >
                            {item.icon}
                            {t(item.key)}
                        </Link>
                    ))}


                    {user ? (
                        <>
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="text-primary-950 hover:text-primary-300 text-lg mx-5 flex"
                            >
                                <User className="w-5 h-5 mx-2 text-primary-900" />
                                {t('profile')}
                            </Link>
                            {member && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="text-red-700 hover:text-red-400 text-lg mx-5 flex"
                                >
                                    <FlaskConicalIcon className="w-5 h-5 mx-2 text-red-700" />
                                    {t('adminPanel')}
                                </Link>
                            )}
                            <Link
                                href="/orders"
                                onClick={() => setIsOpen(false)}
                                className="text-primary-950 hover:text-primary-300 text-lg mx-5 flex"
                            >
                                <History className="w-5 h-5 mx-2 text-primary-900" />
                                {t('orderHistory')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-primary-950 hover:text-primary-300 text-lg mx-5 flex"
                            >
                                <LogOut className="w-5 h-5 mx-2 text-primary-900" />
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push("/login")
                            }}
                            className="text-primary-950 hover:text-primary-300 text-lg mx-5 flex "
                        >
                            <LogIn className="w-5 h-5 mx-2 text-primary-900" />
                            {t('login')}
                        </button>
                    )}

                </div>
            )}
        </nav>
    );
}
