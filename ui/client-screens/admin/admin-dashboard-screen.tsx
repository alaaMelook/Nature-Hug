'use client';
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { DollarSign, Package, ShoppingCart, TrendingDown, TrendingUp, TrendingUpDown, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { DashboardMetricsView } from "@/domain/entities/views/admin/dashboardMetricsView";
import React, { useEffect, useState, useTransition } from "react";
import { toast } from 'sonner';
import Link from "next/link";
import { updateOrder } from '@/ui/hooks/store/useUpdateOrderActions'
import { orderStatus } from "@/lib/utils/status";
import { toTitleCase } from "@/lib/utils/titleCase";
import { useTranslation } from "react-i18next";

interface StatCard {
    title: string;
    value: number | string;
    parValue: number | string;
    icon: any;
    change: number;
}

export function AdminDashboardScreen({ recentOrders, dashboard }: {
    recentOrders: OrderDetailsView[];
    dashboard: DashboardMetricsView;
}) {
    const { t } = useTranslation();

    const statCards: StatCard[] = [
        {
            title: t("totalCustomers"),
            value: dashboard?.total_customers,
            parValue: dashboard?.current_month_customers,
            icon: Users,
            change: dashboard?.customers_change,
        },
        {
            title: t("totalProducts"),
            value: dashboard?.total_product,
            parValue: dashboard?.current_month_products,
            icon: Package,
            change: dashboard?.products_change,
        },
        {
            title: t("totalOrders"),
            value: dashboard?.total_orders,
            parValue: dashboard?.current_month_orders,
            icon: ShoppingCart,
            change: dashboard?.orders_change,
        },
        {
            title: t("totalRevenue"),
            value: dashboard?.total_revenue,
            parValue: dashboard?.current_month_revenue,
            icon: DollarSign,
            change: dashboard?.revenue_change,
        },
    ];

    const [orders, setOrders] = useState<OrderDetailsView[]>(recentOrders ?? [])
    const [updatingIds, setUpdatingIds] = useState<string[]>([])
    const [, startTransition] = useTransition();


    useEffect(() => {
        const newOrders: OrderDetailsView[] = (recentOrders || []).map((order) => ({
            ...order,
            order_date: order.order_date ? new Date(order.order_date) as any : new Date(),
            phone_numbers: (order as any).phone_numbers || [],
        }));
        setOrders(newOrders)
    }, [recentOrders]);

    async function updateOrderStatus(order: OrderDetailsView, newStatus: string) {
        const orderIdStr = String(order.order_id);
        if (updatingIds.includes(orderIdStr)) return;

        setUpdatingIds((s) => [...s, orderIdStr]);

        try {
            const payload = {
                order_id: order.order_id,
                order_status: newStatus.toLowerCase(),
            };

            startTransition(() => {
                void (async () => {
                    try {
                        const result = await updateOrder(payload as any)
                        if (result?.error) {
                            console.error('updateOrder server action returned error', result.error)
                            toast.error(`Failed to update order #${orderIdStr}: ${result.error}`)
                        } else {
                            setOrders((s) => s.map(o => String(o.order_id) === orderIdStr ? {
                                ...o,
                                order_status: newStatus
                            } : o));
                            toast.success(`Order #${orderIdStr} updated to ${newStatus}`);
                        }
                    } catch (err: any) {
                        console.error('Failed to update order via server action', err);
                        toast.error(`Failed to update order #${orderIdStr}: ${err?.message ?? 'unknown error'}`);
                    } finally {
                        setUpdatingIds((s) => s.filter(id => id !== orderIdStr));
                    }
                })()
            })
            return;
        } catch (err: any) {
            console.error('Failed to start update transition', err);
            toast.error(`Failed to update order #${orderIdStr}: ${err?.message ?? 'unknown error'}`);
            setUpdatingIds((s) => s.filter(id => id !== orderIdStr));
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t("dashboard")}</h2>
                <p className="text-gray-500 mt-1">{t("dashboardOverview")}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-primary-50 rounded-lg">
                                <stat.icon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className={`flex items-center text-sm font-medium ${stat.change > 0 ? "text-green-600 bg-green-50 px-2 py-0.5 rounded-full" :
                                stat.change < 0 ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-full" :
                                    "text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full"
                                }`}>
                                {stat.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> :
                                    stat.change < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> :
                                        <TrendingUpDown className="h-3 w-3 mr-1" />}
                                {Math.abs(stat.change)}%
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                            <span>{t("currentMonth")}</span>
                            <span className="font-medium text-gray-700">{stat.parValue}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-900">{t("recentOrders")}</h3>
                    <Link href="/admin/orders" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                        {t("viewAllOrders")}
                    </Link>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("orderId")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("customer")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("status")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("total")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("date")}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        {t("noRecentOrders")}
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.order_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="font-medium text-gray-900">{order.customer_name}</div>
                                        <div className="text-xs text-gray-400">{order.phone_numbers[0]}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            onChange={(e) => updateOrderStatus(order, e.target.value)}
                                            value={toTitleCase(order.order_status)}
                                            disabled={updatingIds.includes(String(order.order_id))}
                                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 ring-1 ring-inset cursor-pointer focus:ring-2 focus:ring-primary-500 outline-none
                                                ${order.order_status.toLowerCase() === 'delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                    order.order_status.toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                        order.order_status.toLowerCase() === 'processing' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                                            'bg-yellow-50 text-yellow-800 ring-yellow-600/20'}`}
                                        >
                                            {orderStatus.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.final_order_total} {t("EGP")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {t('{{date, datetime}}', { date: new Date(order.order_date) })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/orders/${order.order_id}`} className="text-primary-600 hover:text-primary-900">
                                            {t("viewDetails")}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                    {orders.length === 0 ? (
                        <div className="px-6 py-10 text-center text-gray-500">
                            {t("noRecentOrders")}
                        </div>
                    ) : orders.map((order) => (
                        <div key={order.order_id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-sm font-bold text-gray-900">#{order.order_id}</span>
                                    <div className="text-sm text-gray-600">{order.customer_name}</div>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{order.final_order_total} {t("EGP")}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <select
                                    onChange={(e) => updateOrderStatus(order, e.target.value)}
                                    value={toTitleCase(order.order_status)}
                                    disabled={updatingIds.includes(String(order.order_id))}
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 ring-1 ring-inset cursor-pointer focus:ring-2 focus:ring-primary-500 outline-none
                                        ${order.order_status.toLowerCase() === 'delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                            order.order_status.toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                order.order_status.toLowerCase() === 'processing' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                                    'bg-yellow-50 text-yellow-800 ring-yellow-600/20'}`}
                                >
                                    {orderStatus.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <span className="text-xs text-gray-500">
                                    {t('{{date, datetime}}', { date: new Date(order.order_date) })}
                                </span>
                            </div>

                            <div className="pt-2">
                                <Link href={`/admin/orders/${order.order_id}`} className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    {t("viewDetails")}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}