"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BrickWall,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  ChevronDown,
  Users2,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Materials", href: "/admin/materials", icon: BrickWall },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart }, // special case
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "People", href: "/admin/people", icon: Users2 }, // بدل Members
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openOrders, setOpenOrders] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);
  const [openPeople, setOpenPeople] = useState(false);

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            // ✅ Orders
            if (item.name === "Orders") {
              return (
                <div key={item.name} className="mb-1">
                  <button
                    onClick={() => setOpenOrders(!openOrders)}
                    className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.startsWith("/admin/orders")
                        ? "bg-primary-100 text-primary-700 border-r-2 border-primary-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center">
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          pathname.startsWith("/admin/orders")
                            ? "text-primary-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      />
                      {item.name}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openOrders ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openOrders && (
                    <div className="ml-8 mt-1 space-y-1">
                      <Link
                        href="/admin/orders"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/orders"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        All Orders
                      </Link>
                      <Link
                        href="/admin/orders/missed"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/orders/missed"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Missed Orders
                      </Link>
                      <Link
                        href="/admin/orders/blocked"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/orders/blocked"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Blocked Numbers
                      </Link>
                      <Link
                        href="/admin/orders/blocked-otp"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/orders/blocked-otp"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Blocked OTP Numbers
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            // ✅ Products
            if (item.name === "Products") {
              return (
                <div key={item.name} className="mb-1">
                  <button
                    onClick={() => setOpenProducts(!openProducts)}
                    className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.startsWith("/admin/products")
                        ? "bg-primary-100 text-primary-700 border-r-2 border-primary-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center">
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          pathname.startsWith("/admin/products")
                            ? "text-primary-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      />
                      {item.name}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openProducts ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openProducts && (
                    <div className="ml-8 mt-1 space-y-1">
                      <Link
                        href="/admin/products"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/products"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        All Products
                      </Link>
                      <Link
                        href="/admin/products/categories"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/products/categories"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Categories
                      </Link>
                      <Link
                        href="/admin/products/reviews"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/products/reviews"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Reviews
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            // ✅ People
            if (item.name === "People") {
              return (
                <div key={item.name} className="mb-1">
                  <button
                    onClick={() => setOpenPeople(!openPeople)}
                    className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.startsWith("/admin/people")
                        ? "bg-primary-100 text-primary-700 border-r-2 border-primary-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center">
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          pathname.startsWith("/admin/people")
                            ? "text-primary-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      />
                      {item.name}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openPeople ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openPeople && (
                    <div className="ml-8 mt-1 space-y-1">
                      <Link
                        href="/admin/people/couriers"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/people/couriers"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Couriers
                      </Link>
                      <Link
                        href="/admin/people/team-members"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/people/team-members"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Team Members
                      </Link>
                      <Link
                        href="/admin/people/customers"
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/people/customers"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Customers
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            // باقي العناصر العادية
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                  isActive
                    ? "bg-primary-100 text-primary-700 border-r-2 border-primary-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive
                      ? "text-primary-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
