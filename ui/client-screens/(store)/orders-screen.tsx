'use client';

import React, { useState } from 'react';
import { OrderSummaryView } from '@/domain/entities/views/shop/orderSummaryView';
import Link from 'next/link';
import { statusColor } from "@/lib/utils/statusColors";
import { useTranslation } from "react-i18next";

export default function OrdersScreen({ orders }: { orders: OrderSummaryView[] }) {
    const growBy = 5;
    const [visibleCount, setVisibleCount] = useState<number>(growBy);
    const { t } = useTranslation();

    const visibleOrders = orders.slice(0, visibleCount);
    return (
        <div className="max-w-5xl mx-40 my-10 p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-amber-800">{t("ordersScreen.title")}</h1>
                <p className="text-sm text-gray-600">
                    {t("ordersScreen.showing", {
                        count: Math.min(visibleCount, orders?.length ?? 0),
                        total: orders?.length ?? 0
                    })}
                </p>
            </div>

            <div className="space-y-4">
                {(orders.length === 0) && (
                    <div className="p-6 text-center text-gray-500">{t("ordersScreen.noOrders")}</div>
                )}

                {visibleOrders.map(order => (
                    <Link href={`/orders/${order.order_id}`} key={order.order_id}
                        className={'flex flex-col justify-between gap-4 px-10'}>
                        <div
                            className="p-4 shadow-sm rounded-md bg-primary-10 hover:shadow-primary-200 transition flex items-center justify-between gap-4 px-10">
                            <div>
                                <div className={'flex justify-between mb-2'}>
                                    <span className="font-medium text-amber-800 align-text-top">
                                        {t("ordersScreen.orderNumber", { id: order.order_id.toString() })}
                                    </span>
                                    <div
                                        className={`inline-flex items-start mx-5 px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.order_status)}`}>
                                        {order.order_status}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">

                                    {t("ordersScreen.placed", { date: t('{{date, datetime}}', { date: new Date(order.created_at) }) })}

                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {t("ordersScreen.itemsCount", { count: order.item_count })} • {order.payment_status}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-semibold">{t("{{price, currency}}", { price: order.grand_total })}</p>
                                <span className="text-sm text-primary-600 mt-2">{t("ordersScreen.viewDetails")}</span>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* Show more / show less controls */}
                {orders.length > visibleOrders.length && (
                    <div className="flex justify-end mt-4 ">
                        <button
                            onClick={() => setVisibleCount((c) => Math.min(orders.length, c + growBy))}
                            className="px-4 py-2 text-primary-900 rounded hover:underline "
                        >
                            {t("ordersScreen.showMore")}
                        </button>
                    </div>
                )}

                {orders.length > 5 && visibleOrders.length >= orders.length && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setVisibleCount(5)}
                            className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-50"
                        >
                            {t("ordersScreen.showLess")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
