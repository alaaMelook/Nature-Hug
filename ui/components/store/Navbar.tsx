"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FlaskConicalIcon, History, Home, InfoIcon, LogIn, LogOut, Menu, PhoneCall, Settings, ShoppingBag, ShoppingCart, Store, Truck, User, X } from "lucide-react";

import { useTranslation } from "react-i18next";

import { useSupabase } from "@/ui/hooks/useSupabase";
import { useCart } from "@/ui/providers/CartProvider";
import LanguageSwitcher from "../LanguageSwitcher";
import { useCurrentLanguage } from "@/ui/hooks/useCurrentLanguage";

import { usePathname } from "next/navigation";
import { Spinner } from "../Spinner";


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Refs for click outside detection
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileToggleRef = useRef<HTMLButtonElement>(null);
    const settingsMenuRef = useRef<HTMLDivElement>(null);
    const settingsToggleRef = useRef<HTMLButtonElement>(null);

    const { cart, getCartCount } = useCart();
    const count = useMemo(
        () => getCartCount(),
        [cart]
    );
    const { user, member, signOut } = useSupabase();
    const router = useRouter();
    const { t } = useTranslation();
    const language = useCurrentLanguage();
    const pathname = usePathname();

    // Check if we are on the home page (root or language root)
    const isHomePage = pathname === "/" || (pathname?.length === 3 && pathname?.startsWith("/"));

    // Fix hydration mismatch
    const [mounted, setMounted] = useState(false);


    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [member]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Close mobile menu if open and click is outside menu and toggle button
            if (isOpen &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node) &&
                mobileToggleRef.current &&
                !mobileToggleRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }

            // Close settings menu if open and click is outside menu and toggle button
            if (isSettingsOpen &&
                settingsMenuRef.current &&
                !settingsMenuRef.current.contains(event.target as Node) &&
                settingsToggleRef.current &&
                !settingsToggleRef.current.contains(event.target as Node)
            ) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, isSettingsOpen]);

    // Toggle mobile menu
    const toggleMobileMenu = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);
    const toggleSettingsMenu = useCallback(() => {
        setIsSettingsOpen((prev) => !prev);
    }, []);

    // Logout
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);
        setIsOpen(false);
        setIsSettingsOpen(false);
        await signOut();
        router.push("/");
        setIsLoggingOut(false);
    }, [signOut, router]);

    const navigationItems = useMemo(
        () => [
            { href: "/", key: "home", icon: <Home className="w-5 h-5 mx-2 text-primary-900" /> },
            { href: "/products", key: "shop", icon: <Store className="w-5 h-5 mx-2 text-primary-900" />, hasDropdown: true },
            { href: "/about-us", key: "about", icon: <InfoIcon className="w-5 h-5 mx-2 text-primary-900" /> },
            { href: "/contact-us", key: "contact", icon: <PhoneCall className="w-5 h-5 mx-2 text-primary-900" /> },
        ],
        []
    );

    const navbarClasses = `pl-10 pr-10 flex items-center justify-between transition-all duration-300 z-50 ${isHomePage
        ? isScrolled
            ? "fixed top-0 w-full bg-white shadow-md py-2"
            : "fixed top-0 w-full bg-transparent shadow-none py-4"
        : "sticky top-0 bg-white shadow-md py-2"
        }`;

    // Prevent hydration mismatch
    if (!mounted) return null;

    return (
        <nav className={navbarClasses}>
            {/* ---- Logo ---- */}
            <div className="text-xl font-bold flex items-center space-x-4 ">
                <Link href="/" className="flex items-center sm:w-30 sm:h-30 w-20 h-20 relative">
                    <Image
                        src={"https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/public/nature-hug/logos/logo%20(4).png"}
                        priority={true} alt={t("components.logoAlt")}
                        fill={true}
                        sizes="(max-width: 640px) 80px, 120px"
                        className="transition-all duration-900 ease-in-out" />
                </Link>
                <LanguageSwitcher tohover={!(isHomePage && !isScrolled)} />
            </div>

            {/* ---- Desktop Menu ---- */}

            <div className="hidden md:flex space-x-16 items-center">
                {navigationItems.map((item) => (
                    item.hasDropdown ? (
                        <Fragment key={item.href}>
                            {/* Shop Link */}
                            <Link
                                href={item.href}
                                className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-lg"
                            >
                                {t(item.key)}
                            </Link>
                            {/* Category Link - scrolls to categories section */}
                            <button
                                onClick={() => {
                                    const element = document.getElementById('categories');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    } else {
                                        // If not on home page, navigate there first
                                        window.location.href = '/#categories';
                                    }
                                }}
                                className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-lg cursor-pointer"
                            >
                                {t('category')}
                            </button>
                        </Fragment>
                    ) : item.key === 'home' ? (
                        <button
                            key={item.href}
                            onClick={() => {
                                if (isHomePage) {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    router.push('/');
                                }
                            }}
                            className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-lg cursor-pointer"
                        >
                            {t(item.key)}
                        </button>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-lg"
                        >
                            {t(item.key)}
                        </Link>
                    )
                ))}
            </div>

            {/* ---- Desktop Right Section ---- */}
            <div className="hidden md:flex items-center space-x-4">


                {/* Cart */}
                <Link
                    href="/cart"
                    className={`relative flex items-center ${isHomePage && !isScrolled ? "" : "bg-primary-50 shadow-md  hover:bg-primary-100 transition"} px-4 py-2 rounded-lg `}
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
                {user ? (
                    <div className="relative">
                        <button
                            ref={settingsToggleRef}
                            onClick={toggleSettingsMenu}
                            className={`cursor-pointer flex items-center px-3 py-2 ${isHomePage && !isScrolled ? "" : "bg-primary-50 shadow-md  hover:bg-primary-100 transition"} text-primary-950 rounded-lg `}
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        {isSettingsOpen && (
                            <div
                                ref={settingsMenuRef}
                                className={"absolute mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-20" + (language == 'en' ? ' right-0' : ' left-0')}
                            >
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
                                        href={member.role === 'moderator' ? "/admin/shipping/history" : "/admin"}
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                                    >
                                        {member.role === 'moderator' ?
                                            <>
                                                <Truck className="w-5 h-5 mx-2 text-red-700" />
                                                {t('trackOrders')}
                                            </>

                                            :
                                            <>
                                                <FlaskConicalIcon className="w-5 h-5 mx-2 text-red-700" />
                                                {t('adminPanel')}
                                            </>
                                        }
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
                                    {isLoggingOut ? <Spinner size="sm" /> : <LogOut className="w-4 h-4 mx-2" />}
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
                <button
                    ref={mobileToggleRef}
                    onClick={toggleMobileMenu}
                >
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
                    ref={mobileMenuRef}
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
                                    href={member.role === 'moderator' ? "/admin/shipping/history" : "/admin"}
                                    onClick={() => setIsOpen(false)}
                                    className="text-red-700 hover:text-red-400 text-lg mx-5 flex"
                                >{member.role === 'moderator' ?
                                    <>
                                        <Truck className="w-5 h-5 mx-2 text-red-700" />
                                        {t('trackOrders')}
                                    </>

                                    :
                                    <>
                                        <FlaskConicalIcon className="w-5 h-5 mx-2 text-red-700" />
                                        {t('adminPanel')}
                                    </>
                                    }
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
