'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
    order_id: number;
    order_status: string;
    subtotal: number;
    shipping_total: number;
    discount_total: number;
    grand_total: number;
    created_at: string;
    customer_name: string;
    customer_phone: string;
    governorate_name_en?: string;
    governorate_name_ar?: string;
    cancel_requested?: boolean;
}

interface DistributorOrdersScreenProps {
    orders: Order[];
    lang: string;
}

export function DistributorOrdersScreen({ orders: initialOrders, lang }: DistributorOrdersScreenProps) {
    const isRTL = lang === 'ar';
    const [orders, setOrders] = useState(initialOrders);
    const [requestingCancel, setRequestingCancel] = useState<number | null>(null);

    const handleRequestCancel = async (orderId: number) => {
        if (!confirm(isRTL ? 'هل تريد طلب إلغاء هذا الطلب؟' : 'Request cancellation for this order?')) {
            return;
        }

        setRequestingCancel(orderId);
        try {
            const res = await fetch(`/api/distributor/orders/${orderId}/cancel-request`, {
                method: 'POST',
            });

            if (res.ok) {
                toast.success(isRTL ? 'تم إرسال طلب الإلغاء' : 'Cancellation request sent');
                // Update local state
                setOrders(orders.map(o =>
                    o.order_id === orderId ? { ...o, cancel_requested: true } : o
                ));
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to request cancellation');
            }
        } catch (error) {
            toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
        } finally {
            setRequestingCancel(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'processing': return <Package className="w-4 h-4" />;
            case 'delivered':
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isRTL ? 'طلباتي' : 'My Orders'}
                    </h1>
                    <p className="text-gray-600">
                        {isRTL ? `لديك ${orders.length} طلب` : `You have ${orders.length} orders`}
                    </p>
                </div>
                <a
                    href={`/${lang}/distributor/create-order`}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors"
                >
                    + {isRTL ? 'طلب جديد' : 'New Order'}
                </a>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">
                        {isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}
                    </h3>
                    <p className="text-gray-500 mt-2">
                        {isRTL ? 'ابدأ بإنشاء أول طلب لك' : 'Start by creating your first order'}
                    </p>
                    <a
                        href={`/${lang}/distributor/create-order`}
                        className="mt-4 inline-block px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors"
                    >
                        {isRTL ? 'إنشاء طلب' : 'Create Order'}
                    </a>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'رقم الطلب' : 'Order #'}
                                </th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'العميل' : 'Customer'}
                                </th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'المحافظة' : 'Governorate'}
                                </th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'التفاصيل المالية' : 'Financial Details'}
                                </th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'الحالة' : 'Status'}
                                </th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'التاريخ' : 'Date'}
                                </th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isRTL ? 'إجراءات' : 'Actions'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order, index) => (
                                <motion.tr
                                    key={order.order_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-900">
                                            #{order.order_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.customer_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.customer_phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {isRTL ? order.governorate_name_ar : order.governorate_name_en}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between w-32">
                                                <span className="text-gray-500 text-xs">{isRTL ? 'المجموع:' : 'Sub:'}</span>
                                                <span className="font-medium">{order.subtotal.toFixed(2)}</span>
                                            </div>
                                            {order.discount_total > 0 && (
                                                <div className="flex justify-between w-32 text-green-600">
                                                    <span className="text-xs">{isRTL ? 'خصم:' : 'Disc:'}</span>
                                                    <span className="font-medium">-{order.discount_total.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between w-32 text-gray-500">
                                                <span className="text-xs">{isRTL ? 'شحن:' : 'Ship:'}</span>
                                                <span className="font-medium">{order.shipping_total.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between w-32 border-t pt-1 mt-1">
                                                <span className="font-bold text-gray-900">{isRTL ? 'الإجمالي:' : 'Total:'}</span>
                                                <span className="font-bold text-amber-600">{order.grand_total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                                            {getStatusIcon(order.order_status)}
                                            {order.order_status}
                                        </span>
                                        {order.cancel_requested && (
                                            <span className="block mt-1 text-xs text-orange-600 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                {isRTL ? 'طلب إلغاء' : 'Cancel Requested'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.order_status === 'pending' && !order.cancel_requested && (
                                            <button
                                                onClick={() => handleRequestCancel(order.order_id)}
                                                disabled={requestingCancel === order.order_id}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                                            >
                                                {requestingCancel === order.order_id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    isRTL ? 'طلب إلغاء' : 'Request Cancel'
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
