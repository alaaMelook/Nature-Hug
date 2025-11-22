'use client';

import React, { useEffect, useState } from 'react';
import { OrderSummaryView } from '@/domain/entities/views/shop/orderSummaryView';
import Link from 'next/link';
import Image from 'next/image';
import { statusColor } from "@/lib/utils/statusColors";
import { useSupabase } from "@/ui/hooks/useSupabase";
import { useTranslation } from "react-i18next";

export default function OrderDetailScreen({ order, fromCheckout }: {
    order: OrderSummaryView | null,
    fromCheckout?: boolean | string | null
}) {
    const { t } = useTranslation();
    const { user } = useSupabase();
    const [formatted, setFormatted] = useState('');

    useEffect(() => {
        if (order && order.created_at) {
            const date = new Date(order.created_at);
            setFormatted(t('{{date, datetime}}', { date: date }));
        }
    }, []);
    // If order is null, show a friendly fallback UI. If `fromCheckout` is true, still show thank-you banner.
    if (!order) {
        return (
            <div className="max-w-3xl mx-auto my-16 p-6 bg-white rounded-lg shadow text-center">
                Oh no! We couldn't find the details for this order.

            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto my-10 p-6 bg-white rounded-lg shadow">
            {fromCheckout && (
                <>
                    <div
                        className=" p-4 rounded-lg bg-gradient-to-r from-green-500 to-green-300 text-white text-center">
                        <h2 className="text-2xl font-semibold">Thank you — your order is confirmed!</h2>
                        <p className="mt-1 text-sm opacity-90">We've received your order and are preparing it for
                            shipment.</p>
                    </div>


                </>
            )} {!user && (
                <div
                    className="p-4 text-black text-center">
                    <h2 className="text-lg font-semibold">You can always come back later to this page easily,
                        if you {''}
                        <Link href={'/login'} className={'text-teal-600 text-decoration-line: underline'}>
                            signed up here
                        </Link>
                    </h2>
                </div>
            )}
            {order && (
                <>
                    <div className=" mt-6 flex justify-between items-start gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-amber-800">Order #{order.order_id}</h1>
                            <p className="text-sm text-gray-600">Placed on {formatted}</p>
                            <div
                                className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.order_status)}`}>
                                {order.order_status}
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500">Items</p>
                            <p className="text-lg font-semibold">{order.item_count}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 border rounded-md">

                            <h3 className="font-semibold my-3 mx-10 ">Items</h3>
                            <div className="divide-y divide-gray-100 ">
                                {(order.order_items || []).map((it) => (
                                    <div key={it.slug} className="flex items-center gap-4 p-4">
                                        <Image
                                            src={it.image || ''}
                                            alt={it.slug}
                                            width={64}
                                            height={64}
                                            className="w-16 h-16 bg-gray-100 rounded-md object-cover"
                                        ></Image>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium"> {it.name_en} </p>
                                            <p className="text-xs text-gray-500 mt-1">Qty: {it.quantity} </p>
                                        </div>
                                        <div>
                                            <p className="text-md font-semibold text-gray-700">{it.quantity} x {t('{{price, currency}}', { price: it.price })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>

                        <aside
                            className="p-4 border rounded-md bg-white h-max shadow-sm self-center items-center">
                            <h4 className="font-semibold mb-3">Summary</h4>
                            <dl className="text-sm text-gray-700 space-y-2">
                                <div className="flex justify-between">
                                    <dt>Subtotal</dt>
                                    <dd>{t("{{price, currency}}", { price: order.subtotal })}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Discount</dt>
                                    <dd>-{t("{{price, currency}}", { price: order.discount_total })}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Shipping</dt>
                                    <dd>{t("{{price, currency}}", { price: order.shipping_total })}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Tax</dt>
                                    <dd>{t("{{price, currency}}", { price: order.tax_total })}</dd>
                                </div>
                                <div className="flex justify-between font-semibold text-lg">
                                    <dt>Total</dt>
                                    <dd>{t("{{price, currency}}", { price: order.grand_total })}</dd>
                                </div>
                            </dl>

                            {order.applied_promo_code && (
                                <div className="mt-4 p-2 bg-green-50 text-green-800 rounded text-sm">
                                    Promo <b>{order.applied_promo_code}</b> applied ({order.promo_percentage ?? 0}% off)
                                </div>
                            )}

                            <Link href="/"
                                className="block mt-4 text-center px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800"> Order
                                Again</Link>
                        </aside>
                        <div className="mt-6 flex justify-between items-center p-4 bg-gray-50 rounded-md col-span-3">
                            <div>
                                <p className="text-sm text-gray-600">Payment status</p>
                                <p className="font-medium">{order.payment_status} {order.payment_status === 'unpaid' && (
                                    <Link href={'#'} className={'ml-10 text-teal-800'}>pay now!</Link>)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Grand total</p>
                                <p className="text-2xl font-extrabold">{t("{{price, currency}}", { price: order.grand_total })}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {!order && user && (
                <div className="py-12">
                    <h3 className="text-xl font-semibold text-gray-800">Order not found</h3>
                    <p className="mt-3 text-sm text-gray-600">We couldn't find the order details. This may be because
                        the order ID is invalid or the order hasn't been processed yet.</p>

                    <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
                        <Link href="/orders" className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800">View
                            my orders</Link>
                        <Link href="/contact-us"
                            className="px-4 py-2 border border-gray-200 rounded text-gray-700 hover:bg-gray-50">Contact
                            support</Link>
                    </div>
                </div>
            )}

        </div>
    );
}
