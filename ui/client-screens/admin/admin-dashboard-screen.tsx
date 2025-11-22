'use client';
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { DollarSign, Package, ShoppingCart, TrendingDown, TrendingUp, TrendingUpDown, Users } from "lucide-react";
import { DashboardMetricsView } from "@/domain/entities/views/admin/dashboardMetricsView";
import React, { useEffect, useState, useTransition } from "react";
import { toast } from 'sonner';
import Link from "next/link";
import { updateOrder } from '@/ui/hooks/store/useUpdateOrderActions'
import { orderStatus } from "@/lib/utils/status";
import { toTitleCase } from "@/lib/utils/titleCase";
import { useTranslation } from "react-i18next";
function assignStatCards(dashboard: DashboardMetricsView): StatCard[] {

    console.log('transformed', dashboard);
    return [
        {
            title: "Total Customers",
            value: dashboard?.total_customers,
            parValue: dashboard?.current_month_customers,
            icon: Users,
            change: dashboard?.customers_change,
        },
        {
            title: "Total Products",
            value: dashboard?.total_product,
            parValue: dashboard?.current_month_products,
            icon: Package,
            change: dashboard?.products_change,
        },
        {
            title: "Total Orders",
            value: dashboard?.total_orders,
            parValue: dashboard?.current_month_orders,
            icon: ShoppingCart,
            change: dashboard?.orders_change,
        },
        {
            title: "Total Revenue",
            value: dashboard?.total_revenue,
            parValue: dashboard?.current_month_revenue,
            icon: DollarSign,
            change: dashboard?.revenue_change,
        },
    ];
}

export function AdminDashboardScreen({ recentOrders, dashboard }: {
    recentOrders: OrderDetailsView[];
    dashboard: DashboardMetricsView;
}) {
    const { t } = useTranslation();
    const statCards = assignStatCards(dashboard)
    const [orders, setOrders] = useState<OrderDetailsView[]>(recentOrders ?? [])
    // track which orders are being updated so we can disable buttons
    // store updating ids as strings to avoid type mismatch when comparing
    const [updatingIds, setUpdatingIds] = useState<string[]>([])
    const [, startTransition] = useTransition();


    useEffect(() => {
        // convert incoming order_date to Date objects safely and guard phone numbers
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

        // show skeleton for this row only
        setUpdatingIds((s) => [...s, orderIdStr]);

        try {
            // prepare payload matching server use-case
            const payload = {
                order_id: order.order_id,
                order_status: newStatus.toLowerCase(),
            };

            // call server action via startTransition so React can prioritize UI updates
            startTransition(() => {
                // call the server action exported from ui/hooks/store
                void (async () => {
                    try {
                        const result = await updateOrder(payload as any)
                        if (result?.error) {
                            console.error('updateOrder server action returned error', result.error)
                            toast.error(`Failed to update order #${orderIdStr}: ${result.error}`)
                        } else {
                            // update local state after success
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

            return; // exit early because cleanup handled in transition
        } catch (err: any) {
            console.error('Failed to start update transition', err);
            toast.error(`Failed to update order #${orderIdStr}: ${err?.message ?? 'unknown error'}`);
            setUpdatingIds((s) => s.filter(id => id !== orderIdStr));
        }

    }

    async function updateAllOrderStatus(newStatus: string) {
        const orderIdStr = orders.map(order => String(order.order_id));

        // show skeleton for this row only
        setUpdatingIds((s) => orderIdStr);
        orders.map((order: OrderDetailsView) => {
            try {
                // prepare payload matching server use-case

                const payload = {
                    order_id: order.order_id,
                    order_status: newStatus.toLowerCase(),
                };

                // call server action via startTransition so React can prioritize UI updates
                startTransition(() => {
                    // call the server action exported from ui/hooks/store
                    void (async () => {
                        try {
                            const result = await updateOrder(payload as any)
                            if (result?.error) {
                                console.error('updateOrder server action returned error', result.error)
                                // toast.error(`Failed to update order #${orderIdStr}: ${result.error}`)
                            } else {
                                // update local state after success
                                setOrders((s) => s.map(o => String(o.order_id) === updatingIds.find(id => id === String(order.order_id)) ? {
                                    ...o,
                                    order_status: newStatus
                                } : o));
                                // toast.success(`Order #${orderIdStr} updated to ${newStatus}`);
                            }
                        } catch (err: any) {
                            console.error('Failed to update order via server action', err);
                            // toast.error(`Failed to update order #${orderIdStr}: ${err?.message ?? 'unknown error'}`);
                        } finally {
                            setUpdatingIds((s) => s.filter(id => id !== String(order.order_id)));
                        }
                    })()

                })

                return; // exit early because cleanup handled in transition
            } catch (err: any) {
                console.error('Failed to start update transition', err);
                // toast.error(`Failed to update order #${orderIdStr}: ${err?.message ?? 'unknown error'}`);
                setUpdatingIds((s) => s.filter(id => id !== String(order.order_id)));
            }
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600">Welcome to your admin dashboard</p>
            </div>

            {/*Stat Cards*/}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className="p-3 bg-primary-100 rounded-full">
                                <stat.icon className="h-6 w-6 text-primary-600" />
                            </div>
                        </div>

                        <div className=" mt-4 flex items-center">
                            {stat.change && stat.change > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : stat.change && stat.change < 0 ? (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            ) : <TrendingUpDown className="h-4 w-4  text-gray-600 mr-1"></TrendingUpDown>}
                            <span
                                className={`text-sm font-medium ${stat.change && stat.change > 0 ? "text-green-600" : stat.change && stat.change < 0 ? "text-red-600" : "text-gray-600"
                                    }`}>
                                {stat.change}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">from last month</span>
                        </div>
                        <div className={'mt-1 text-sm text-gray-600'}>
                            This month: <span className={'font-medium'}>
                                {stat.parValue}

                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/*Recent Orders*/}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Orders to Accept</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 ">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">Customer Name</th>
                                <th className="px-4 py-2 text-left">Phone(s)</th>
                                <th className="px-4 py-2 text-left">Payment Method</th>
                                <th className="px-4 py-2 text-left">Payment Status</th>
                                <th className="px-4 py-2 text-left">Address</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Total</th>
                                <th className="px-4 py-2 text-right">Created At</th>

                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={9}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        No valid orders to accept.
                                    </td>
                                </tr>
                            ) :
                                orders?.map((order: OrderDetailsView) => (
                                    <tr key={order.order_id}>
                                        <td className="px-4 py-2">{order.order_id}</td>
                                        <td className="px-4 py-2">{order.customer_name}</td>
                                        <td className="px-4 py-2 text-wrap">{order.phone_numbers.toString().split(',').map((phone, index) =>
                                            <div key={index}>{phone}</div>)}</td>
                                        <td className="px-4 py-2">{order.payment_method}</td>
                                        <td className="px-4 py-2">{order.payment_status}</td>
                                        <td className="px-4 py-2">{order.shipping_street_address}, <br /><span>{order.shipping_governorate}</span>
                                        </td>
                                        <td className="px-2 py-1">
                                            <select
                                                onChange={(e) => updateOrderStatus(order, e.target.value)}
                                                className={'px-4 py-1 border rounded border-gray-500 '}

                                                value={toTitleCase(order.order_status)}>
                                                {orderStatus.map((status, index) => (
                                                    <option key={index} value={status}>{status}</option>))}

                                            </select></td>
                                        <td className="px-4 py-2">{order.final_order_total} EGP</td>
                                        <td className="px-4 py-2 text-right">
                                            {t('{{date, datetime}}', { date: new Date(order.order_date) })}
                                            {/* {new Date(order.order_date).toLocaleString('en-GB', {
                                            timeZone: 'Africa/Cairo', hour12: true
                                        }).split(',').map((info, ind) =>
                                            <div key={ind}>{info}</div>
                                        )} */}
                                        </td>
                                        <td className="py-4 whitespace-nowrap px-4">

                                        </td>
                                    </tr>
                                ))}
                            <tr>
                                <td colSpan={9}
                                    className="px-6 py-4 whitespace-nowrap text-sm underline text-center">
                                    <Link className={'flex justify-end'} href={"/admin/orders"}> View All </Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>

            </div>
            {/*           <div
                className={'flex justify-end gap-5'}>


                <button
                    type="button"
                    data-test-id={`decline-all`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateAllOrderStatus('declined')
                    }}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded disabled:opacity-50 pointer-events-auto"
                >
                    Decline All
                </button>
                <button
                    type="button"
                    data-test-id={`accept-all`}
                    onClick={
                        (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateAllOrderStatus('processing')
                        }
                    }
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded disabled:opacity-50 pointer-events-auto">
                    Accept All

                </button>
            </div>*/}
        </div>
    );

}