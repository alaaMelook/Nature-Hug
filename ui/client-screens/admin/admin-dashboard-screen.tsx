'use client';
import { DollarSign, Package, ShoppingCart, TrendingDown, TrendingUp, TrendingUpDown, Users, AlertCircle, Truck, ClipboardList, BrickWall, ArrowRight, Star } from "lucide-react";
import { DashboardMetricsView } from "@/domain/entities/views/admin/dashboardMetricsView";
import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface StatCard {
    title: string;
    value: number | string;
    parValue: number | string;
    icon: any;
    change: number;
    color: string;
}

interface ActionCard {
    title: string;
    count: number;
    icon: any;
    href: string;
    color: string;
    description: string;
}

export function AdminDashboardScreen({ dashboard, actionStats }: {
    dashboard: DashboardMetricsView;
    actionStats: SidebarStats;
}) {
    const { t } = useTranslation();

    const statCards: StatCard[] = [
        {
            title: t("totalCustomers"),
            value: dashboard?.total_customers,
            parValue: dashboard?.current_month_customers,
            icon: Users,
            change: dashboard?.customers_change,
            color: "text-blue-600 bg-blue-50",
        },
        {
            title: t("totalProducts"),
            value: dashboard?.total_product,
            parValue: dashboard?.current_month_products,
            icon: Package,
            change: dashboard?.products_change,
            color: "text-purple-600 bg-purple-50",
        },
        {
            title: t("totalOrders"),
            value: dashboard?.total_orders,
            parValue: dashboard?.current_month_orders,
            icon: ShoppingCart,
            change: dashboard?.orders_change,
            color: "text-amber-600 bg-amber-50",
        },
        {
            title: t("totalRevenue"),
            value: dashboard?.total_revenue,
            parValue: dashboard?.current_month_revenue,
            icon: DollarSign,
            change: dashboard?.revenue_change,
            color: "text-emerald-600 bg-emerald-50",
        },
    ];

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

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 pb-20 md:pb-0"
        >
            <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{t("dashboard")}</h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">{t("dashboardOverview")}</p>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((stat) => (
                    <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                                <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.change > 0 ? "text-emerald-700 bg-emerald-50" :
                                stat.change < 0 ? "text-rose-700 bg-rose-50" :
                                    "text-gray-600 bg-gray-50"
                                }`}>
                                {stat.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> :
                                    stat.change < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> :
                                        <TrendingUpDown className="h-3 w-3 mr-1" />}
                                {Math.abs(stat.change)}%
                            </div>
                        </div>
                        <div>
                            <p className="text-xs md:text-sm font-medium text-gray-500">{stat.title}</p>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1 tracking-tight">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
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