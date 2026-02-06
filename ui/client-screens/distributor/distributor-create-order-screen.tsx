'use client';

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { Governorate } from "@/domain/entities/database/governorate";
import {
    User, Phone, MapPin, Package, Plus, Minus, X,
    Search, ShoppingCart, Loader2, ArrowLeft
} from "lucide-react";

interface OrderItem {
    product: ProductView;
    quantity: number;
    unitPrice: number;
}

interface DistributorCreateOrderScreenProps {
    products: ProductView[];
    governorates: Governorate[];
    lang: string;
}

export function DistributorCreateOrderScreen({ products, governorates, lang }: DistributorCreateOrderScreenProps) {
    const router = useRouter();
    const isRTL = lang === 'ar';

    // Customer Info State
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerPhone2, setCustomerPhone2] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);

    // Products State
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [showProductModal, setShowProductModal] = useState(false);

    // UI State
    const [loading, setLoading] = useState(false);

    // Filtered Products
    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products.slice(0, 20);
        const search = productSearch.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.slug.toLowerCase().includes(search)
        );
    }, [products, productSearch]);

    // Calculations
    const subtotal = orderItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const shipping = selectedGovernorate?.fees ?? 0;
    const grandTotal = subtotal + shipping;

    // Add Product
    const addProduct = (product: ProductView) => {
        const existing = orderItems.find(item => item.product.slug === product.slug);
        if (existing) {
            setOrderItems(prev => prev.map(item =>
                item.product.slug === product.slug
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setOrderItems(prev => [...prev, {
                product,
                quantity: 1,
                unitPrice: product.price
            }]);
        }
        setShowProductModal(false);
        setProductSearch("");
    };

    // Update Quantity
    const updateQuantity = (slug: string, delta: number) => {
        setOrderItems(prev => prev.map(item => {
            if (item.product.slug === slug) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    // Remove Item
    const removeItem = (slug: string) => {
        setOrderItems(prev => prev.filter(item => item.product.slug !== slug));
    };

    // Submit Order
    const handleSubmit = async () => {
        if (!customerName.trim()) {
            toast.error(isRTL ? 'الاسم مطلوب' : 'Name is required');
            return;
        }
        if (!customerPhone.trim()) {
            toast.error(isRTL ? 'رقم الهاتف مطلوب' : 'Phone is required');
            return;
        }
        if (!customerAddress.trim()) {
            toast.error(isRTL ? 'العنوان مطلوب' : 'Address is required');
            return;
        }
        if (!selectedGovernorate) {
            toast.error(isRTL ? 'المحافظة مطلوبة' : 'Governorate is required');
            return;
        }
        if (orderItems.length === 0) {
            toast.error(isRTL ? 'أضف منتجات للطلب' : 'Add products to the order');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/distributor/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guest_name: customerName,
                    guest_phone: customerPhone,
                    guest_phone2: customerPhone2 || null,
                    guest_address: {
                        address: customerAddress,
                        governorate_slug: selectedGovernorate.slug
                    },
                    subtotal,
                    shipping_total: shipping,
                    grand_total: grandTotal,
                    items: orderItems.map(item => ({
                        product_id: item.product.id,
                        variant_id: item.product.variant_id,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                    }))
                })
            });

            const data = await res.json();

            if (data.order_id) {
                toast.success(isRTL ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!');
                router.push(`/${lang}/distributor`);
            } else {
                toast.error(data.error || 'Failed to create order');
            }
        } catch (error) {
            console.error("Failed to create order:", error);
            toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isRTL ? 'إنشاء طلب جديد' : 'Create New Order'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isRTL ? 'أدخل بيانات العميل والمنتجات' : 'Enter customer info and products'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Customer & Products */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-4">
                            <User size={16} /> {isRTL ? 'بيانات العميل' : 'Customer Info'}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isRTL ? 'الاسم' : 'Name'} *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                    placeholder={isRTL ? 'اسم العميل' : 'Customer name'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isRTL ? 'الهاتف' : 'Phone'} *
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                        placeholder="01xxxxxxxxx"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isRTL ? 'هاتف 2' : 'Phone 2'}
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="tel"
                                        value={customerPhone2}
                                        onChange={(e) => setCustomerPhone2(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                        placeholder={isRTL ? 'اختياري' : 'Optional'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isRTL ? 'المحافظة' : 'Governorate'} *
                                </label>
                                <select
                                    value={selectedGovernorate?.slug || ""}
                                    onChange={(e) => {
                                        const gov = governorates.find(g => g.slug === e.target.value);
                                        setSelectedGovernorate(gov || null);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                >
                                    <option value="">{isRTL ? 'اختر المحافظة' : 'Select governorate'}</option>
                                    {governorates.map(gov => (
                                        <option key={gov.slug} value={gov.slug}>
                                            {isRTL ? gov.name_ar : gov.name_en} ({gov.fees} EGP)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isRTL ? 'العنوان' : 'Address'} *
                                </label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                    <textarea
                                        value={customerAddress}
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
                                        rows={2}
                                        placeholder={isRTL ? 'العنوان بالتفصيل' : 'Full address'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                                <Package size={16} /> {isRTL ? 'المنتجات' : 'Products'}
                            </h3>
                            <button
                                onClick={() => setShowProductModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                            >
                                <Plus size={16} /> {isRTL ? 'إضافة منتج' : 'Add Product'}
                            </button>
                        </div>

                        {orderItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                                <p>{isRTL ? 'لا توجد منتجات بعد' : 'No products yet'}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orderItems.map(item => (
                                    <div key={item.product.slug} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">{item.unitPrice} EGP</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.product.slug, -1)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.slug, 1)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <div className="w-24 text-right font-medium">
                                            {(item.unitPrice * item.quantity).toFixed(2)} EGP
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.product.slug)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                            {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{isRTL ? 'المجموع' : 'Subtotal'}</span>
                                <span className="font-medium">{subtotal.toFixed(2)} EGP</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">{isRTL ? 'الشحن' : 'Shipping'}</span>
                                <span className="font-medium">{shipping.toFixed(2)} EGP</span>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t text-lg font-bold">
                                <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                                <span className="text-amber-600">{grandTotal.toFixed(2)} EGP</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || orderItems.length === 0}
                            className="w-full mt-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={20} />
                                    {isRTL ? 'إنشاء الطلب' : 'Create Order'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden m-4"
                    >
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{isRTL ? 'اختر منتج' : 'Select Product'}</h3>
                            <button
                                onClick={() => {
                                    setShowProductModal(false);
                                    setProductSearch("");
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                    placeholder={isRTL ? 'ابحث عن منتج...' : 'Search products...'}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[50vh] p-2">
                            {filteredProducts.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">
                                    {isRTL ? 'لا توجد منتجات' : 'No products found'}
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.slug}
                                            onClick={() => addProduct(product)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {isRTL ? `المخزون: ${product.stock}` : `Stock: ${product.stock}`}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-amber-600">
                                                {product.price} EGP
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
