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
  Factory,
  Truck,
  Repeat,
  ClipboardList,
  DollarSign,
  List,
  Tag,
  Star,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Materials", href: "/admin/materials", icon: BrickWall }, // dropdown
  { name: "Products", href: "/admin/products", icon: Package }, // dropdown
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart }, // dropdown
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "People", href: "/admin/people", icon: Users2 }, // dropdown
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openOrders, setOpenOrders] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);
  const [openPeople, setOpenPeople] = useState(false);
  const [openMaterials, setOpenMaterials] = useState(false);

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            // Materials Dropdown
            if (item.name === "Materials") {
              return (
                <div key={item.name} className="mb-1">
                  <button
                    onClick={() => setOpenMaterials(!openMaterials)}
                    className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.startsWith("/admin/materials") ||
                      pathname.startsWith("/admin/materials/production") ||
                      pathname.startsWith("/admin/materials/movements") ||
                      pathname.startsWith("/admin/materials/reports") ||
                      pathname.startsWith("/admin/materials/suppliers") ||
                      pathname.startsWith("/admin/materials/settings") ||
                      pathname.startsWith("/admin/materials/costing") ||
                      pathname.startsWith("/admin/materials/bom") ||
                      pathname.startsWith("/admin/materials/inventory")
                        ? "bg-primary-100 text-primary-700 border-r-2 border-primary-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center">
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          pathname.startsWith("/admin/materials") ||
                          pathname.startsWith("/admin/materials/production") ||
                          pathname.startsWith("/admin/materials/movements") ||
                          pathname.startsWith("/admin/materials/reports") ||
                          pathname.startsWith("/admin/materials/suppliers") ||
                          pathname.startsWith("/admin/materials/settings") ||
                          pathname.startsWith("/admin/materials/costing") ||
                          pathname.startsWith("/admin/materials/bom") ||
                          pathname.startsWith("/admin/materials/inventory")
                            ? "text-primary-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      />
                      {item.name}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openMaterials ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openMaterials && (
                    <div className="ml-8 mt-1 space-y-1">
                      <Link
                        href="/admin/materials"
                        className={`flex items-center px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/materials"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <BrickWall className="h-4 w-4 mr-2" />
                        Materials
                      </Link>
                      <Link
                        href="/admin/materials/bom"
                        className={`flex items-center px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/materials/bom"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <List className="h-4 w-4 mr-2" />
                        BOM
                      </Link>
                      <Link
                        href="/admin/materials/inventory"
                        className={`flex items-center px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/materials/inventory"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Inventory
                      </Link>
                      <Link
                        href="/admin/materials/production"
                        className={`flex items-center px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/materials/production"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Factory className="h-4 w-4 mr-2" />
                        Production
                      </Link>
                      <Link
                        href="/admin/materials/movements"
                        className={`flex items-center px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/materials/movements"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        Movements
                      </Link>
                      <Link
                        href="/admin/materials/reports"
                        className={`flex items-center px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/materials/reports"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Reports
                      </Link>
                      <Link
                        href="/admin/materials/suppliers"
                        className={`flex items-center px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/materials/suppliers"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Suppliers
                      </Link>
                      <Link
                        href="/admin/materials/settings"
                        className={`flex items-center px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/materials/settings"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <Link
                        href="/admin/materials/costing"
                        className={`flex items-center px-2 py-1 text-sm rounded-md ${
                          pathname === "/admin/materials/costing"
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Costing
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            // Orders Dropdown
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

            // Products Dropdown
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

            // People Dropdown
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