"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FlaskConicalIcon, History, LogOut, Menu, Settings, ShoppingCart, User, X } from "lucide-react";

import { useTranslation } from "@/ui/providers/TranslationProvider";

import { useSupabase } from "@/ui/hooks/useSupabase";
import { useCart } from "@/ui/providers/CartProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import { CollapsibleSection } from "./CollapsibleSection";


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { user, member } = useSupabase();
    const { cart } = useCart();
    const count = useMemo(
        () => cart.reduce((s, i) => s + i.quantity, 0),
        [cart]
    );

    const router = useRouter();
    const { signOut } = useSupabase();
    const { t, language } = useTranslation();

    // Toggle mobile menu
    const toggleMobileMenu = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);
    const toggleSettingsMenu = useCallback(() => {
        setIsSettingsOpen((prev) => !prev);
    }, []);

    // Logout
    const handleLogout = useCallback(async () => {
        await signOut();
        router.push("/");
    }, [signOut, router]);

    const navigationItems = useMemo(
        () => [
            { href: "/", key: "home" },
            { href: "/products", key: "shop" },
            { href: "/about-us", key: "about" },
            { href: "/contact-us", key: "contact" },
        ],
        []
    );

    return (
        <nav className="bg-white pl-10 pr-10 sticky top-0 z-10 flex items-center justify-between shadow-md">
            {/* ---- Logo ---- */}
            <div className="text-xl font-bold flex items-center space-x-4 ">
                <Link href="/" className="flex items-center">
                    <Image
                        src="https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/sign/product-images/logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGU3NTY3OC0zMDRhLTQ3OTUtYjdhZC04M2IwMzM3ZDY2ZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9sb2dvLmpwZyIsImlhdCI6MTc1NjM4MDIxNSwiZXhwIjo0OTA5OTgwMjE1fQ.D5eFaioyALpbvbK7LWj6Di0kI1-I3kAQKI0H-DVtiao"
                        width={100} height={100} priority={true} alt="Logo Hug Nature" />
                </Link>
                <LanguageSwitcher />
            </div>

            {/* ---- Desktop Menu ---- */}
            <div className="hidden md:flex space-x-16 items-center">
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
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {t('cart')}
                    {count > 0 && (
                        <span
                            className="absolute -right-2 -top-2 text-xs min-w-5 h-5 px-1 rounded-full  font-semibold text-primary-950 bg-primary-50 flex items-center justify-center shadow-xs shadow-primary-300">
                            {count}
                        </span>
                    )}
                </Link>

                {/* Auth Buttons */}
                {user ? (
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
                                    <User className="w-4 h-4 mr-2" />
                                    {t('profile')}
                                </Link>
                                {member && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                                    >
                                        <FlaskConicalIcon className="w-4 h-4 mr-2" />
                                        {t('adminPanel')}
                                    </Link>
                                )}
                                <Link
                                    href="/orders"
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100"
                                >
                                    <History className="w-4 h-4 mr-2" />
                                    {t('orderHistory')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
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
            <div className="md:hidden">
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
                    className="md:hidden absolute top-20 left-0 w-full bg-white shadow-md flex flex-col items-center py-4 space-y-2 z-50">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-primary-950 hover:text-primary-300 text-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            {t(item.key)}
                        </Link>
                    ))}


                    {user ? (

                        <CollapsibleSection id={""} title={t('settings')} content={(<>
                            <Link
                                href="/profile"
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex items-center text-lg text-primary-900 hover:text-primary-300"
                            >
                                <User className="w-4 h-4 mr-2" />
                                {t('profile')}
                            </Link>
                            {member && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="flex items-center text-lg text-red-700 hover:text-red-400"
                                >
                                    <FlaskConicalIcon className="w-4 h-4 mr-2" />
                                    {t('adminPanel')}
                                </Link>
                            )}
                            <Link
                                href="/orders"
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex items-center text-lg text-primary-900 hover:text-primary-300"
                            >
                                <History className="w-4 h-4 mr-2" />
                                {t('orderHistory')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-lg text-primary-900 hover:text-primary-300"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {t('logout')}
                            </button>
                        </>)} isOpen={isSettingsOpen} onToggleAction={toggleSettingsMenu}
                        ></CollapsibleSection>
                    ) : (
                        <button
                            onClick={() => router.push("/login")}
                            className="flex items-center text-lg bg-primary-10 text-primary-950 rounded-lg  border-primary-950 border-1"
                        >
                            {t('login')}
                        </button>
                    )}
                    <Link
                        href="/cart"
                        className="relative flex items-center bg-primary-10 px-4 py-2 rounded-lg shadow-md hover:bg-primary-50 transition"
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {t('cart')}
                        {count > 0 && (
                            <span
                                className="absolute -right-2 -top-2 text-xs min-w-5 h-5 px-1 rounded-full  font-semibold text-primary-950 bg-primary-50 flex items-center justify-center shadow-xs shadow-primary-300">
                                {count}
                            </span>
                        )}
                    </Link>
                </div>
            )}
        </nav>
    );
}
