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
  Tag,
  BarChart3,
  Bell,
  BellRing,
  Loader2,
  Wallet
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Member } from "@/domain/entities/auth/member";
import { MemberView } from "@/domain/entities/views/admin/memberView";
import { usePushNotifications } from "@/ui/hooks/usePushNotifications";

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
  const [mounted, setMounted] = useState(false);

  // Push notifications
  const { isSupported, permission, requestPermission, isLoading } = usePushNotifications();

  // Navigation defined before hooks that depend on it
  const navigation = [
    { name: t("dashboard"), href: "/admin", icon: Home },
    { name: t("customers"), href: "/admin/customers", icon: Users },
    {
      name: t("materials"),
      href: "/admin/materials",
      icon: BrickWall,
      badge: stats?.materialsWarningCount,
    },
    {
      name: t("products"),
      href: "/admin/products",
      icon: Package,
      badge: (stats?.productsWarningCount?.products ?? 0) + (stats?.productsWarningCount?.reviews ?? 0),
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
      submenu: [
        { name: t("allOrders"), href: "/admin/orders" },
        { name: t("createOrder"), href: "/admin/orders/create" },
      ]
    },
    {
      name: t("promoCodes"),
      href: "/admin/promo-codes",
      icon: Tag,
    },
    {
      name: t("shipping"),
      href: "/admin/shipping",
      icon: Truck,
      submenu: [
        { name: t("dashboard"), href: "/admin/shipping/" },
        { name: t("history"), href: "/admin/shipping/history" },
        { name: t("governorates"), href: "/admin/shipping/governorates" },
      ]
    },
    { name: t("reports"), href: "/admin/reports", icon: BarChart3 },
    {
      name: "Finance",
      href: "/admin/finance",
      icon: Wallet,
      submenu: [
        { name: "💰 Cashflow", href: "/admin/finance/cashflow" },
        { name: "📁 Categories", href: "/admin/finance/cashflow-categories" },
      ]
    },
    { name: t("gallery"), href: "/admin/gallery", icon: Image },
  ];

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize expanded menus based on current path
  useEffect(() => {
    const activeParent = navigation.find(item =>
      item.submenu && pathname.startsWith(item.href)
    );
    if (activeParent) {
      setExpandedMenus(prev => [...new Set([...prev, activeParent.name])]);
    }
  }, [pathname]);

  // All hooks above - conditional returns below
  if (member?.role === 'moderator') return null;
  if (!mounted) return null;

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const NavItem = ({ item, isSub = false }: { item: any, isSub?: boolean }) => {
    const isActive = item.href === pathname || (item.submenu && pathname.startsWith(item.href) && item.href !== '/admin'); // Simple active check
    const hasSub = !!item.submenu;
    const isExpanded = expandedMenus.includes(item.name);

    if (hasSub) {
      return (
        <div className="mb-1">
          <button
            onClick={() => toggleMenu(item.name)}
            className={`group flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
              ${isActive ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className={`mx-3 h-5 w-5 ${isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"}`} />}
              <span>{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge > 0 && !isExpanded && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="mt-1 ml-4 pl-3 border-l-2 border-gray-100 space-y-1">
              {item.submenu.map((subItem: any) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors
                    ${pathname === subItem.href
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
                >
                  {subItem.icon && <subItem.icon className="h-4 w-4 mx-2 opacity-70" />}
                  <div className="flex items-center gap-2">

                    {subItem.name}
                    {subItem.badge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {subItem.badge}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg mb-1 transition-all duration-200
          ${pathname === item.href
            ? "bg-primary-600 text-white shadow-md shadow-primary-200"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
        onClick={() => setIsMobileOpen(false)}
      >
        <div className="flex items-center">
          <item.icon className={`mx-3 h-5 w-5 ${pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-gray-500"}`} />
          {item.name}
        </div>
        {item.badge > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
            ${pathname === item.href ? "bg-white text-primary-600" : "bg-red-500 text-white"}`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Trigger */}
      <div className={`md:hidden fixed bottom-15 ${lang === 'ar' ? 'right-6' : 'left-6'} z-50`}>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Nature Hug</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3 mt-2">
            {t("adminPanel")}
          </div>
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />

          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto space-y-3">
          {/* Notification Enable Button */}
          {isSupported && permission !== 'granted' && (
            <button
              onClick={requestPermission}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 bg-primary-50 text-primary-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري التفعيل...</span>
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  <span>تفعيل الإشعارات 🔔</span>
                </>
              )}
            </button>
          )}

          {/* Notification Status - Already Enabled (clickable to refresh) */}
          {isSupported && permission === 'granted' && (
            <button
              onClick={requestPermission}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 disabled:opacity-50"
              title="اضغط لتجديد الاشتراك"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري التحديث...</span>
                </>
              ) : (
                <>
                  <BellRing className="h-4 w-4" />
                  <span>الإشعارات مفعلة ✓</span>
                </>
              )}
            </button>
          )}

          <div className="px-3 py-2">
            <p className="text-xs text-gray-400 text-center">© 2025 Nature Hug</p>
          </div>
        </div>
      </aside>
    </>
  );
}
