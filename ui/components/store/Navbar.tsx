"use client";

import {use, useCallback, useMemo, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {FlaskConicalIcon, LogIn, LogOut, Menu, Settings, ShoppingCart, User, X,} from "lucide-react";

import {useSupabase} from "@/ui/hooks/useSupabase";
import {useCart} from "@/ui/providers/CartProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import {Customer} from "@/domain/entities/auth/customer";
import {Member} from "@/domain/entities/auth/member";


export default function Navbar({initialUser, initialMember}: {
    initialUser: Promise<Customer | null>,
    initialMember: Promise<Member | null>
}) {
    const [isOpen, setIsOpen] = useState(false);
    const user = use(initialUser);
    const member = use(initialMember);
    const {cart} = useCart();
    const count = useMemo(
        () => cart.reduce((s, i) => s + i.quantity, 0),
        [cart]
    );

    const router = useRouter();
    const {getUser, getMember, signOut} = useSupabase();

    // Toggle mobile menu
    const toggleMobileMenu = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    // Logout
    const handleLogout = useCallback(async () => {
        await signOut();
        router.push("/");
    }, [signOut, router]);

    const navigationItems = useMemo(
        () => [
            {href: "/", label: "Home"},
            {href: "/products", label: "Shop"},
            {href: "/about", label: "About"},
            {href: "/contact", label: "Contact"},
        ],
        []
    );

    return (
        <nav className="bg-white pl-10 pr-10 sticky top-0 z-10 flex items-center justify-between shadow-md">
            {/* ---- Logo ---- */}
            <div className="text-xl font-bold">
                <Link href="/" className="flex items-center">
                    <Image
                        src="https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/sign/product-images/logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGU3NTY3OC0zMDRhLTQ3OTUtYjdhZC04M2IwMzM3ZDY2ZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9sb2dvLmpwZyIsImlhdCI6MTc1NjM4MDIxNSwiZXhwIjo0OTA5OTgwMjE1fQ.D5eFaioyALpbvbK7LWj6Di0kI1-I3kAQKI0H-DVtiao"
                        width={100} height={100} priority={true} alt="Logo Hug Nature"/>
                </Link>
            </div>

            {/* ---- Desktop Menu ---- */}
            <div className="hidden md:flex space-x-16 items-center">
                {navigationItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="text-primary-950 hover:text-primary-300 transition-colors duration-300 text-lg"
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* ---- Desktop Right Section ---- */}
            <div className="hidden md:flex items-center space-x-4">
                <LanguageSwitcher/>

                {/* Cart */}
                <Link
                    href="/cart"
                    className="relative flex items-center bg-primary-50 px-4 py-2 rounded-lg shadow-md hover:bg-primary-100 transition"
                >
                    <ShoppingCart className="w-5 h-5 mr-2"/>
                    Cart
                    {count > 0 && (
                        <span
                            className="absolute -right-2 -top-2 text-xs min-w-5 h-5 px-1 rounded-full text-white bg-primary-800 flex items-center justify-center">
              {count}
            </span>
                    )}
                </Link>

                {/* Auth Buttons */}
                {user ? (
                    <div className="relative">
                        <button
                            onClick={toggleMobileMenu}
                            className="cursor-pointer flex items-center px-3 py-2 bg-primary-800 rounded-lg text-white hover:bg-primary-700"
                        >
                            <Settings className="w-5 h-5"/>
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-20">
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100"
                                >
                                    <User className="w-4 h-4 mr-2"/>
                                    Profile
                                </Link>
                                {member && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                                    >
                                        <FlaskConicalIcon className="w-4 h-4 mr-2"/>
                                        Panel
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-2 text-sm text-primary-900 hover:bg-gray-100"
                                >
                                    <LogOut className="w-4 h-4 mr-2"/>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => router.push("/login")}
                        className="flex items-center px-4 py-2 text-sm bg-primary-800 text-white rounded-lg hover:bg-primary-700"
                    >
                        <LogIn className="w-4 h-4 mr-2"/>
                        Login / Signup
                    </button>
                )}
            </div>

            {/* ---- Mobile Menu Toggle ---- */}
            <div className="md:hidden">
                <button onClick={toggleMobileMenu}>
                    {isOpen ? (
                        <X className="w-6 h-6 text-primary-900"/>
                    ) : (
                        <Menu className="w-6 h-6 text-primary-900"/>
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
                            {item.label}
                        </Link>
                    ))}

                    <Link
                        href="/cart"
                        className="flex flex-row text-primary-950 hover:text-primary-300 text-lg"
                        onClick={() => setIsOpen(false)}
                    >
                        <ShoppingCart className="w-5 h-5 mr-2"/>
                        Cart
                        {count > 0 && (
                            <span
                                className="text-xs w-5 h-5 rounded-full ml-2 bg-primary-800 text-white flex items-center justify-center">
                {count}
              </span>
                        )}
                    </Link>

                    <LanguageSwitcher/>

                    {user ? (
                        <>
                            <Link
                                href="/profile"
                                className="bg-primary-50 px-4 py-2 rounded shadow-md border hover:bg-primary-100"
                                onClick={() => setIsOpen(false)}
                            >
                                My Profile
                            </Link>
                            {member && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                                >
                                    <FlaskConicalIcon className="w-4 h-4 mr-2"/>
                                    Panel
                                </Link>
                            )}
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="bg-primary-800 text-white px-4 py-2 rounded hover:bg-primary-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                router.push("/login");
                                setIsOpen(false);
                            }}
                            className="bg-primary-800 text-white px-4 py-2 rounded hover:bg-primary-700"
                        >
                            Login / Signup
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
