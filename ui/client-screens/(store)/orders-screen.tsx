'use client';

import React from 'react';
import {OrderSummaryView} from '@/domain/entities/views/shop/orderSummaryView';
import Link from 'next/link';
import {statusColor} from "@/lib/statusColors";

export default function OrdersScreen({orders}: { orders: OrderSummaryView[] }) {
    return (
        <div className="max-w-5xl mx-auto my-10 p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-amber-800">My Orders</h1>
                <p className="text-sm text-gray-600">Showing recent {orders?.length ?? 0} orders</p>
            </div>

            <div className="space-y-4">
                {orders.length === 0 && (
                    <div className="p-6 text-center text-gray-500">You have no orders yet.</div>
                )}

                {orders.map(order => (
                    <Link href={`/orders/${order.order_id}`}>
                        <div key={order.order_id}
                             className="p-4 border rounded-md hover:shadow-sm transition flex items-center justify-between gap-4">
                            <div>
                                <div className={'flex justify-between mb-2'}>
                                    <span className="font-medium text-amber-800 align-text-top">Order
                                #{order.order_id.toString()}
                            </span>
                                    <div
                                        className={`inline-flex items-start mx-5 px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.order_status)}`}>
                                        {order.order_status}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">Placed {new Date(order.created_at).toLocaleString()}</p>
                                <p className="text-sm text-gray-600 mt-1">{order.item_count} items
                                    • {order.payment_status}</p>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-semibold">{order.grand_total?.toLocaleString()} EGP</p>
                                <span className="text-sm text-primary-600 mt-2">View
                                details</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
