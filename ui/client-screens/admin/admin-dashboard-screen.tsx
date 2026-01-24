"use client";

import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, TrendingUpDown, ClipboardList, Truck, BrickWall, AlertCircle, Star, ArrowRight, BadgeDollarSignIcon, HandCoins, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAdminDashboard } from "@/ui/hooks/admin/useAdminDashboard";

interface StatCard {
    title: string;
    value: string | number;
    name: string;
    parValue: number | string;
    icon: any;
    change?: number;
    color: string;
    isCurrency?: boolean;
    isCount?: boolean;
    description?: string;
    formula?: string;
}

interface ActionCard {
    title: string;
    count: number;
    icon: any;
    href: string;
    color: string;
    description: string;
}

export function AdminDashboardScreen({ actionStats }: {
    actionStats: SidebarStats;
}) {
    const { t } = useTranslation();
    const { data: dashboard, loading, error, startDate, setStartDate, endDate, setEndDate } = useAdminDashboard();

    const statCards: StatCard[] = [
        {
            title: t("totalCustomers"),
            name: "Customer",
            value: dashboard?.total_customers ?? 0,
            parValue: dashboard?.current_period_customers ?? 0,
            icon: Users,
            change: parseFloat(dashboard?.customers_change ?? "0"),
            color: "text-blue-600 bg-blue-50",
            isCount: true,
            description: "Unique customers who placed orders (by email or phone)",
            formula: "Registered Customers + Unique Guest Orders"
        },
        {
            title: t("totalProducts"),
            name: "Product",
            value: dashboard?.total_products ?? 0,
            parValue: dashboard?.current_period_products ?? 0,
            icon: Package,
            change: parseFloat(dashboard?.products_change ?? "0"),
            color: "text-purple-600 bg-purple-50",
            isCount: true,
            description: "Total active products in the store",
            formula: "Count of all published products"
        },
        {
            title: t("totalOrders"),
            name: "Order",
            value: dashboard?.total_orders ?? 0,
            parValue: dashboard?.current_period_orders ?? 0,
            icon: ShoppingCart,
            change: parseFloat(dashboard?.orders_change ?? "0"),
            color: "text-amber-600 bg-amber-50",
            isCount: true,
            description: "Total orders placed (all statuses except cancelled)",
            formula: "Count of orders"
        },
        {
            title: t("totalRevenue"),
            name: "",
            value: parseFloat(dashboard?.total_revenue ?? "0"),
            parValue: parseFloat(dashboard?.current_period_revenue ?? "0"),
            icon: HandCoins,
            change: parseFloat(dashboard?.revenue_change ?? "0"),
            color: "text-emerald-600 bg-emerald-50",
            isCurrency: true,
            isCount: true,
            description: "Total revenue from delivered/completed orders",
            formula: "Sum of final_order_total for delivered orders"
        },
        {
            title: t("avgOrderValue"),
            name: "avg_order_value",
            value: parseFloat(dashboard?.current_period_avg_order_value ?? "0"),
            parValue: 0,
            icon: BadgeDollarSignIcon,
            color: "text-cyan-600 bg-cyan-50",
            isCurrency: true,
            description: "Average order value in the selected period",
            formula: "Total Revenue ÷ Number of Orders"
        },
        // Customer Retention (Repeat Customer Rate)
        {
            title: "Customer Retention",
            name: "conversion_rate",
            value: parseFloat(dashboard?.current_period_conversion_rate ?? "0"),
            parValue: 0,
            icon: Users,
            color: "text-indigo-600 bg-indigo-50",
            description: "Percentage of customers who ordered more than once",
            formula: "(Repeat Customers ÷ Total Customers) × 100"
        },
        // Website Visitors (from Google Analytics)
        {
            title: "Visitors",
            name: "visitors",
            value: dashboard?.visitors ?? 0,
            parValue: 0,
            icon: Users,
            color: "text-teal-600 bg-teal-50",
            isCount: true,
            description: "Unique website visitors from Google Analytics",
            formula: "GA4 Active Users in selected period"
        },
        // Visitor-based Conversion Rate (from Google Analytics)
        {
            title: "Visitor Conversion",
            name: "visitor_conversion_rate",
            value: parseFloat(dashboard?.visitor_conversion_rate ?? "0"),
            parValue: dashboard?.visitors ?? 0,
            icon: ShoppingBasket,
            color: "text-purple-600 bg-purple-50",
            description: "Percentage of website visitors who placed an order",
            formula: `(Orders ÷ Visitors) × 100`
        }
    ];

    // Remove conversion rate change if 0 means no data? 
    // Actually user said "add all other parametes". current_period_conversion_rate is one.
    // I entered 0 for change.

    const actionCards: ActionCard[] = [
        {
            title: t("newOrders"),
            count: actionStats?.ordersWarningCount?.pending ?? 0,
            icon: ClipboardList,
            href: "/admin/orders",
            color: "bg-blue-500",
            description: t("ordersPendingApproval"),
        },
        {
            title: t("readyToShip"),
            count: actionStats?.ordersWarningCount?.processing ?? 0,
            icon: Truck,
            href: "/admin/shipping",
            color: "bg-emerald-500",
            description: t("ordersProcessing"),
        },
        {
            title: t("lowStockMaterials"),
            count: actionStats?.materialsWarningCount ?? 0,
            icon: BrickWall,
            href: "/admin/materials",
            color: "bg-amber-500",
            description: t("materialsBelowThreshold"),
        },
        {
            title: t("lowStockProducts"),
            count: actionStats?.productsWarningCount?.products ?? 0,
            icon: AlertCircle,
            href: "/admin/products",
            color: "bg-rose-500",
            description: t("outOfStockItems"),
        },
        {
            title: t("pendingReviews"),
            count: actionStats?.productsWarningCount?.reviews ?? 0,
            icon: Star,
            href: "/admin/products/reviews",
            color: "bg-purple-500",
            description: t("reviewsWaitingApproval"),
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100
            }
        }
    };

    const renderChangeIndicator = (stat: StatCard) => {
        if (typeof stat.change === 'undefined') return null;

        const change = stat.change;
        if (stat.isCount) {
            const sign = change > 0 ? '+' : change < 0 ? '-' : '';
            return <>{sign} {stat.isCurrency ? t("{{price, currency}}", { price: Math.abs(change) }) : Math.abs(change)} {(Math.abs(change) > 1 && !stat.isCurrency ? stat.name + "s" : stat.name)}</>;
        }

        const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : TrendingUpDown;

        return (
            <>
                <Icon className="h-3 w-3 mr-1" />
                {Math.abs(change)}%
            </>
        );
    };

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-lg">
                <p>Error loading dashboard: {error}</p>
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm underline hover:text-red-700"
                    >
                        Reload Page
                    </button>
                    {/* Add date filters even in error state to allow changing range */}
                    <div className="flex items-center gap-2 bg-white/50 p-1 rounded border border-red-200 ml-4">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm bg-transparent border-none py-0 focus:ring-0 text-red-700"
                        />
                        <span className="text-red-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm bg-transparent border-none py-0 focus:ring-0 text-red-700"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            animate="visible"
            variants={containerVariants}
            className="space-y-8 pb-20 md:pb-0"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{t("dashboard")}</h2>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">{t("dashboardOverview")}</p>
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200 justify-between px-10 md:px-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border-gray-300 rounded-md text-sm border-none focus:ring-0 text-gray-600"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border-gray-300 rounded-md text-sm border-none focus:ring-0 text-gray-600"
                    />
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4  gap-4 md:gap-6">
                {/* Adjusted grid cols to fit 6 items or responsive */}
                {loading ? (
                    // Skeleton Loaders
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                                <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                            </div>
                            <div>
                                <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="w-32 h-8 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    statCards.map((stat) => (
                        <motion.div
                            key={stat.title}
                            variants={itemVariants}
                            className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group relative cursor-help"
                            title={stat.description}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                                    <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                {stat.change && <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.change > 0 ? "text-emerald-700 bg-emerald-50" :
                                    stat.change < 0 ? "text-rose-700 bg-rose-50" :
                                        "text-gray-600 bg-gray-50"
                                    }`}>
                                    {renderChangeIndicator(stat)}
                                </div>}
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mt-1 tracking-tight">
                                    {stat.isCurrency ? t("{{price, currency}}", { price: stat.value }) : stat.value}
                                    {stat.name === "conversion_rate" || stat.name === "visitor_conversion_rate" ? "%" : ""}
                                </h3>
                            </div>
                            {/* Tooltip on hover */}
                            {stat.description && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap max-w-xs">
                                    <div className="font-semibold mb-1">{stat.description}</div>
                                    {stat.formula && <div className="text-gray-300 text-[10px]">📊 {stat.formula}</div>}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Action Cards */}
            <motion.div variants={itemVariants}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t("actionsRequired")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                    {actionCards.map((action) => (
                        <Link key={action.title} href={action.href} className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${action.color}`} />
                            <div className="p-5 pl-7">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 mb-1">{action.title}</p>
                                        <h4 className="text-3xl font-bold text-gray-900 tracking-tight">{action.count}</h4>
                                    </div>
                                    <div className={`p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:text-white group-hover:${action.color.replace('bg-', 'text-')} transition-colors duration-200`}>
                                        <action.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-xs text-gray-400 font-medium">{action.description}</p>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}