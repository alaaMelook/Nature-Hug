"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  Home,
  Users,
  BrickWall,
  Package,
  ShoppingCart,
  Image,
  ChevronDown,
  Menu,
  X,
  Truck,
  Tag
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Member } from "@/domain/entities/auth/member";
import { MemberView } from "@/domain/entities/views/admin/memberView";
import { EmployeePermissions, hasPermission } from "@/domain/entities/auth/permissions";

// Map navigation items to permission modules
type PermissionModule = keyof EmployeePermissions;

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  permissionModule?: PermissionModule;
  submenu?: {
    name: string;
    href: string;
    icon?: any;
    badge?: number;
  }[];
}

export default function AdminSidebar({
  stats,
  member
}: {
  stats?: SidebarStats;
  member?: MemberView;
}) {
  const pathname = usePathname();
  const params = useParams();
  const lang = params?.lang as string;
  const { t, i18n } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Build navigation with permission modules
  const allNavigation: NavItem[] = [
    { name: t("dashboard"), href: "/admin", icon: Home, permissionModule: "dashboard" },
    { name: t("customers"), href: "/admin/customers", icon: Users, permissionModule: "customers" },
    { name: t("employees"), href: "/admin/employees", icon: Users, permissionModule: "employees" },
    {
      name: t("materials"),
      href: "/admin/materials",
      icon: BrickWall,
      badge: stats?.materialsWarningCount,
      permissionModule: "materials"
    },
    {
      name: t("products"),
      href: "/admin/products",
      icon: Package,
      badge: (stats?.productsWarningCount?.products ?? 0) + (stats?.productsWarningCount?.reviews ?? 0),
      permissionModule: "products",
      submenu: [
        { name: t("allProducts"), href: "/admin/products", badge: stats?.productsWarningCount?.products },
        { name: t("categories"), href: "/admin/products/categories" },
        { name: t("reviews"), href: "/admin/products/reviews", badge: stats?.productsWarningCount?.reviews },
      ]
    },
    {
      name: t("orders"),
      href: "/admin/orders",
      icon: ShoppingCart,
      badge: (stats?.ordersWarningCount?.pending ?? 0) + (stats?.ordersWarningCount?.processing ?? 0),
      permissionModule: "orders"
    },
    {
      name: t("promoCodes"),
      href: "/admin/promo-codes",
      icon: Tag,
      permissionModule: "promoCodes"
    },
    {
      name: t("shipping"),
      href: "/admin/shipping",
      icon: Truck,
      permissionModule: "shipping",
      submenu: [
        { name: t("dashboard"), href: "/admin/shipping/" },
        { name: t("history"), href: "/admin/shipping/history" },
        { name: t("governorates"), href: "/admin/shipping/governorates" },
      ]
    },
    { name: t("gallery"), href: "/admin/gallery", icon: Image, permissionModule: "gallery" },
  ];

  // Filter navigation based on permissions
  const navigation = useMemo(() => {
    // Admin has full access
    if (member?.role === 'admin') {
      return allNavigation;
    }

    const permissions = member?.permissions || {};

    return allNavigation.filter(item => {
      // If no permission module specified, allow access
      if (!item.permissionModule) return true;

      // Check if user has view permission for this module
      return hasPermission(permissions, item.permissionModule, 'view');
    });
  }, [member, allNavigation]);

  // If no navigation items are accessible, don't render sidebar
  if (navigation.length === 0) return null;

  // Initialize expanded menus based on current path
  useEffect(() => {
    const activeParent = navigation.find(item =>
      item.submenu && pathname.startsWith(item.href)
    );
    if (activeParent) {
      setExpandedMenus([activeParent.name]);
    }
  }, [pathname, navigation]);

  const isLinkActive = (href: string) => {
    // For exact match or subpaths
    if (href === `/${lang}/admin` || href === '/admin') {
      return pathname === `/${lang}/admin` || pathname === '/admin';
    }
    return pathname.includes(href);
  };

  const toggleSubmenu = (name: string) => {
    setExpandedMenus(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold flex items-center gap-3">
              <img src="/images/logo.webp" alt="Nature Hug" className="h-8 w-8 rounded-lg" />
              <span className="text-primary-900">Nature Hug</span>
            </h1>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-4">
              {t("adminPanel")}
            </p>
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isLinkActive(item.href)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <span className="flex items-center">
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.name}
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${expandedMenus.includes(item.name) ? 'rotate-180' : ''
                            }`}
                        />
                      </button>
                      {expandedMenus.includes(item.name) && (
                        <ul className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-4">
                          {item.submenu.map((sub) => (
                            <li key={sub.name}>
                              <Link
                                href={`/${lang}${sub.href}`}
                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isLinkActive(sub.href)
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                onClick={() => setIsMobileOpen(false)}
                              >
                                {sub.name}
                                {sub.badge !== undefined && sub.badge > 0 && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={`/${lang}${item.href}`}
                      className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${isLinkActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <p className="text-xs text-gray-500">© 2025 Nature Hug</p>
          </div>
        </div>
      </aside>
    </>
  );
}
