"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    ArrowLeft, Store, ShoppingCart, TrendingUp, Users, Package,
    Plus, Minus, X, Search, Loader2, DollarSign, Tag,
    BarChart3, Phone, User, CreditCard, Banknote, Wallet,
    ChevronDown, Check, Trophy, Award, Star, Pencil
} from "lucide-react";
import { Bazaar } from "@/domain/entities/database/bazaar";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { PromoCode } from "@/domain/entities/database/promoCode";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { createAdminOrderAction } from "@/ui/hooks/admin/useAdminCreateOrder";

interface BazaarReport {
    totalSales: number;
    orderCount: number;
    customerCount: number;
    topProducts: { name: string; quantity: number; revenue: number }[];
    topStaff: { name: string; orderCount: number; totalSales: number }[];
    paymentBreakdown: { method: string; count: number; total: number }[];
}

interface POSItem {
    product: ProductView;
    quantity: number;
    unitPrice: number;
}

interface BazaarDetailScreenProps {
    bazaar: Bazaar;
    report: BazaarReport;
    orders: OrderDetailsView[];
    products: ProductView[];
    promoCodes: PromoCode[];
    isPosOnly?: boolean;
    currentUserId?: number | null;
}

type ActiveTab = 'report' | 'pos' | 'orders';

const PAYMENT_METHODS = [
    { key: 'cash', label: 'Cash', labelAr: 'كاش', icon: Banknote, color: 'bg-green-50 border-green-300 text-green-700' },
    { key: 'instapay', label: 'InstaPay', labelAr: 'إنستاباي', icon: CreditCard, color: 'bg-blue-50 border-blue-300 text-blue-700' },
    { key: 'wallet', label: 'Wallet', labelAr: 'محفظة', icon: Wallet, color: 'bg-purple-50 border-purple-300 text-purple-700' },
];

export default function BazaarDetailScreen({ bazaar, report, orders, products, promoCodes, isPosOnly = false, currentUserId }: BazaarDetailScreenProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang as string;
    const isAr = i18n.language === 'ar';
    const [activeTab, setActiveTab] = useState<ActiveTab>(isPosOnly ? 'pos' : 'report');

    // ====== POS STATE ======
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [posItems, setPosItems] = useState<POSItem[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [promoCodeInput, setPromoCodeInput] = useState("");
    const [appliedPromos, setAppliedPromos] = useState<PromoCode[]>([]);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [posLoading, setPosLoading] = useState(false);
    const [showProducts, setShowProducts] = useState(false);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [paidTouched, setPaidTouched] = useState(false);
    const paidAmountRef = useRef(paidAmount);
    paidAmountRef.current = paidAmount;
    const [posNote, setPosNote] = useState("");
    const [totalOverride, setTotalOverride] = useState<number>(0);
    const [totalTouched, setTotalTouched] = useState(false);
    const totalOverrideRef = useRef(totalOverride);
    totalOverrideRef.current = totalOverride;

    // Payment info (InstaPay/Wallet numbers & QR)
    const [paymentInfoMap, setPaymentInfoMap] = useState<Record<string, { account_number?: string; account_name?: string; qr_code_url?: string }>>({});

    useEffect(() => {
        fetch('/api/admin/payment-info')
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const map: Record<string, any> = {};
                    data.data.forEach((info: any) => { map[info.method] = info; });
                    setPaymentInfoMap(map);
                }
            })
            .catch(() => {});
    }, []);

    // Customer search
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");
    const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
    const [searchingCustomers, setSearchingCustomers] = useState(false);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);

    // Customer search with debounce
    useEffect(() => {
        if (customerSearchQuery.length < 2) {
            setCustomerSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchingCustomers(true);
            try {
                const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(customerSearchQuery)}`);
                const data = await res.json();
                if (Array.isArray(data)) setCustomerSearchResults(data);
            } catch {
                console.error("Customer search error");
            } finally {
                setSearchingCustomers(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [customerSearchQuery]);

    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products;
        const s = productSearch.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s));
    }, [products, productSearch]);

    const subtotal = useMemo(() => posItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0), [posItems]);

    const discount = useMemo(() => {
        if (appliedPromos.length === 0) return 0;
        let remaining = subtotal;
        let total = 0;

        appliedPromos.forEach(promo => {
            // BOGO logic: Buy X Get Y at Z% off cheapest
            if (promo.is_bogo && promo.bogo_buy_count > 0 && promo.bogo_get_count > 0) {
                // Expand cart items into individual unit prices
                const unitPrices: number[] = [];
                posItems.forEach(item => {
                    for (let i = 0; i < item.quantity; i++) {
                        unitPrices.push(item.unitPrice);
                    }
                });
                // Sort ascending (cheapest first)
                unitPrices.sort((a, b) => a - b);

                const groupSize = promo.bogo_buy_count + promo.bogo_get_count;
                const totalUnits = unitPrices.length;
                const discountPct = (promo.bogo_discount_percentage ?? 100) / 100;

                // For each complete group of (buy+get), discount the cheapest 'get' items
                let bogoDiscount = 0;
                const fullGroups = Math.floor(totalUnits / groupSize);
                // The cheapest items in each group get the discount
                // Since sorted ascending, the first (fullGroups * get_count) cheapest items get discounted
                const discountedCount = fullGroups * promo.bogo_get_count;
                for (let i = 0; i < discountedCount && i < unitPrices.length; i++) {
                    bogoDiscount += unitPrices[i] * discountPct;
                }

                total += bogoDiscount;
                remaining -= bogoDiscount;
            }
            // Fixed amount off
            else if (promo.amount_off && promo.amount_off > 0) {
                const d = Math.min(promo.amount_off, remaining);
                total += d;
                remaining -= d;
            }
            // Percentage off
            else if (promo.percentage_off && promo.percentage_off > 0) {
                const d = remaining * (promo.percentage_off / 100);
                total += d;
                remaining -= d;
            }
        });

        return Math.min(total, subtotal);
    }, [appliedPromos, subtotal, posItems]);

    const grandTotal = subtotal - discount;

    // Auto-fill paid amount with finalTotal when not manually edited
    const finalTotal = totalTouched ? totalOverride : grandTotal;
    useEffect(() => {
        if (!totalTouched) {
            setTotalOverride(grandTotal);
        }
    }, [grandTotal, totalTouched]);
    useEffect(() => {
        if (!paidTouched) {
            setPaidAmount(finalTotal);
        }
    }, [finalTotal, paidTouched]);

    // Change = Paid - Final Total
    const changeAmount = paidAmount - finalTotal;

    const addProduct = (product: ProductView) => {
        const existing = posItems.find(item => item.product.slug === product.slug);
        if (existing) {
            setPosItems(prev => prev.map(item =>
                item.product.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setPosItems(prev => [...prev, { product, quantity: 1, unitPrice: product.price }]);
        }
        setProductSearch("");
    };

    const updateQuantity = (slug: string, delta: number) => {
        setPosItems(prev => prev.map(item => {
            if (item.product.slug === slug) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (slug: string) => {
        setPosItems(prev => prev.filter(item => item.product.slug !== slug));
    };

    const updateUnitPrice = (slug: string, newPrice: number) => {
        if (isNaN(newPrice) || newPrice < 0) return;
        setPosItems(prev => prev.map(item =>
            item.product.slug === slug ? { ...item, unitPrice: newPrice } : item
        ));
    };

    const applyPromoCode = () => {
        const promo = promoCodes.find(p =>
            p.code.toLowerCase() === promoCodeInput.toLowerCase() && p.is_active
        );
        if (promo) {
            if (appliedPromos.some(p => p.id === promo.id)) {
                toast.error(isAr ? 'الكود مطبق بالفعل' : 'Code already applied');
                return;
            }
            setAppliedPromos(prev => [...prev, promo]);
            setPromoCodeInput("");
            toast.success(isAr ? `تم تطبيق ${promo.code}` : `Applied ${promo.code}`);
        } else {
            toast.error(isAr ? 'كود غير صحيح' : 'Invalid promo code');
        }
    };

    const handlePOSSubmit = async () => {
        if (!customerName.trim()) {
            toast.error(isAr ? 'اسم العميل مطلوب' : 'Customer name is required');
            return;
        }
        
        if (posItems.length === 0) {
            toast.error(isAr ? 'أضف منتجات للأوردر' : 'Add products to the order');
            return;
        }

        setPosLoading(true);
        try {
            const orderData = {
                guest_name: customerName,
                guest_phone: customerPhone,
                guest_phone2: null,
                guest_email: null,
                guest_address: { address: `Bazaar: ${bazaar.name}`, governorate_slug: 'cairo' },
                subtotal,
                discount_total: discount,
                shipping_total: 0,
                tax_total: 0,
                grand_total: totalOverrideRef.current,
                payment_method: paymentMethod,
                payment_status: "paid",
                status: "completed",
                note: posNote ? `Bazaar Order - ${bazaar.name} | ${posNote}` : `Bazaar Order - ${bazaar.name}`,
                promo_code_id: appliedPromos[0]?.id ?? null,
                bazaar_id: bazaar.id,
                items: posItems.map(item => ({
                    product_id: item.product.id,
                    variant_id: item.product.variant_id,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    discount: 0
                }))
            };

            const result = await createAdminOrderAction(orderData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(isAr ? '✅ تم تسجيل الأوردر بنجاح' : '✅ Order recorded successfully');
                // Reset POS
                setCustomerName("");
                setCustomerPhone("");
                setPosItems([]);
                setAppliedPromos([]);
                setPromoCodeInput("");
                setPaymentMethod("cash");
                setPaidAmount(0);
                setPaidTouched(false);
                setPosNote("");
                setTotalOverride(0);
                setTotalTouched(false);
                router.refresh();
            }
        } catch (error) {
            console.error("POS submit error:", error);
            toast.error(isAr ? 'حدث خطأ' : 'An error occurred');
        } finally {
            setPosLoading(false);
        }
    };

    const tabs = isPosOnly
        ? [
            { key: 'pos' as ActiveTab, label: isAr ? '🛒 نقطة البيع' : '🛒 POS', icon: ShoppingCart },
            { key: 'orders' as ActiveTab, label: isAr ? '📋 طلباتي' : '📋 My Orders', icon: Package },
        ]
        : [
            { key: 'report' as ActiveTab, label: isAr ? '📊 التقرير' : '📊 Report', icon: BarChart3 },
            { key: 'pos' as ActiveTab, label: isAr ? '🛒 نقطة البيع' : '🛒 POS', icon: ShoppingCart },
            { key: 'orders' as ActiveTab, label: isAr ? '📋 الطلبات' : '📋 Orders', icon: Package },
        ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
                <button onClick={() => router.push(`/${lang}/admin/bazaars`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Store className="text-primary-600" size={24} />
                        {bazaar.name}
                    </h1>
                    <p className="text-sm text-gray-500">{bazaar.location} • {bazaar.start_date} → {bazaar.end_date}</p>
                </div>
                {!isPosOnly && (
                    <button
                        onClick={() => router.push(`/${lang}/admin/bazaars/${bazaar.id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        <Pencil size={16} />
                        {isAr ? 'تعديل' : 'Edit'}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 sm:gap-2 mb-6 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'report' && <ReportTab report={report} orders={orders} bazaar={bazaar} isAr={isAr} />}
            {activeTab === 'pos' && (
                <POSTab
                    isAr={isAr}
                    customerName={customerName} setCustomerName={setCustomerName}
                    customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
                    posItems={posItems} showProducts={showProducts} setShowProducts={setShowProducts}
                    productSearch={productSearch} setProductSearch={setProductSearch}
                    filteredProducts={filteredProducts} addProduct={addProduct}
                    updateQuantity={updateQuantity} removeItem={removeItem}
                    updateUnitPrice={updateUnitPrice}
                    promoCodeInput={promoCodeInput} setPromoCodeInput={setPromoCodeInput}
                    applyPromoCode={applyPromoCode} appliedPromos={appliedPromos}
                    setAppliedPromos={setAppliedPromos}
                    paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                    subtotal={subtotal} discount={discount} grandTotal={grandTotal}
                    paidAmount={paidAmount} setPaidAmount={setPaidAmount} setPaidTouched={setPaidTouched}
                    changeAmount={changeAmount}
                    posNote={posNote} setPosNote={setPosNote}
                    totalOverride={totalOverride} setTotalOverride={setTotalOverride}
                    totalTouched={totalTouched} setTotalTouched={setTotalTouched}
                    finalTotal={finalTotal}
                    posLoading={posLoading} handlePOSSubmit={handlePOSSubmit}
                    customerSearchQuery={customerSearchQuery} setCustomerSearchQuery={setCustomerSearchQuery}
                    customerSearchResults={customerSearchResults} searchingCustomers={searchingCustomers}
                    showCustomerSearch={showCustomerSearch} setShowCustomerSearch={setShowCustomerSearch}
                    setCustomerSearchResults={setCustomerSearchResults}
                    promoCodes={promoCodes} bazaar={bazaar}
                    paymentInfoMap={paymentInfoMap}
                    t={t}
                />
            )}
            {activeTab === 'orders' && <OrdersTab orders={orders} isAr={isAr} lang={lang} />}
        </motion.div>
    );
}

// ======================== REPORT TAB ========================
function ReportTab({ report, orders, bazaar, isAr }: { report: BazaarReport; orders: any[]; bazaar: Bazaar; isAr: boolean }) {
    const [selectedDay, setSelectedDay] = useState<string>('all');
    const [startHour, setStartHour] = useState<number>(0);
    const [endHour, setEndHour] = useState<number>(23);

    // Generate bazaar days
    const bazaarDays = useMemo(() => {
        const days: { label: string; date: string }[] = [];
        const start = new Date(bazaar.start_date);
        const end = new Date(bazaar.end_date);
        let current = new Date(start);
        let dayNum = 1;
        while (current <= end) {
            days.push({
                label: `${isAr ? 'يوم' : 'Day'} ${dayNum} (${current.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })})`,
                date: current.toISOString().split('T')[0],
            });
            current.setDate(current.getDate() + 1);
            dayNum++;
        }
        return days;
    }, [bazaar.start_date, bazaar.end_date, isAr]);

    // Filter orders by selected day and hour range
    const filteredOrders = useMemo(() => {
        if (selectedDay === 'all' && startHour === 0 && endHour === 23) return orders;
        return orders.filter((order: any) => {
            if (!order.created_at) return true;
            const orderDate = new Date(order.created_at);
            if (selectedDay !== 'all') {
                const dayStart = new Date(selectedDay + 'T00:00:00');
                dayStart.setHours(startHour, 0, 0, 0);
                const dayEnd = new Date(selectedDay + 'T00:00:00');
                if (endHour < startHour) dayEnd.setDate(dayEnd.getDate() + 1);
                dayEnd.setHours(endHour, 59, 59, 999);
                return orderDate >= dayStart && orderDate <= dayEnd;
            }
            const hour = orderDate.getHours();
            if (startHour <= endHour) return hour >= startHour && hour <= endHour;
            return hour >= startHour || hour <= endHour;
        });
    }, [orders, selectedDay, startHour, endHour]);

    // Compute report from filtered orders
    const computedReport = useMemo(() => {
        if (selectedDay === 'all' && startHour === 0 && endHour === 23) return report;
        const totalSales = filteredOrders.reduce((acc: number, o: any) => acc + (o.grand_total || 0), 0);
        const orderCount = filteredOrders.length;
        const uniqueCustomers = new Set(filteredOrders.map((o: any) => o.customer_name).filter(Boolean));
        const paymentMap: Record<string, { count: number; total: number }> = {};
        filteredOrders.forEach((o: any) => {
            const method = o.payment_method || 'unknown';
            if (!paymentMap[method]) paymentMap[method] = { count: 0, total: 0 };
            paymentMap[method].count++;
            paymentMap[method].total += o.grand_total || 0;
        });
        const staffMap: Record<string, { orderCount: number; totalSales: number }> = {};
        filteredOrders.forEach((o: any) => {
            const name = o.created_by_user_name || 'Unknown';
            if (!staffMap[name]) staffMap[name] = { orderCount: 0, totalSales: 0 };
            staffMap[name].orderCount++;
            staffMap[name].totalSales += o.grand_total || 0;
        });
        return {
            totalSales, orderCount, customerCount: uniqueCustomers.size,
            topProducts: report.topProducts,
            topStaff: Object.entries(staffMap).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.totalSales - a.totalSales),
            paymentBreakdown: Object.entries(paymentMap).map(([method, data]) => ({ method, ...data })),
        };
    }, [filteredOrders, report, selectedDay, startHour, endHour]);

    const hourOptions = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="space-y-6 print-report">
            {/* Filter Bar + Print */}
            <div className="bg-white rounded-xl border p-3 sm:p-4 flex flex-wrap items-end gap-3 sm:gap-4 no-print">
                <div className="w-full sm:flex-1 sm:min-w-[180px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{isAr ? 'اليوم' : 'Day'}</label>
                    <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 outline-none bg-white">
                        <option value="all">{isAr ? 'كل الأيام' : 'All Days'}</option>
                        {bazaarDays.map(day => (<option key={day.date} value={day.date}>{day.label}</option>))}
                    </select>
                </div>
                <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{isAr ? 'من الساعة' : 'From Hour'}</label>
                    <select value={startHour} onChange={(e) => setStartHour(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 outline-none bg-white">
                        {hourOptions.map(h => (<option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>))}
                    </select>
                </div>
                <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{isAr ? 'إلى الساعة' : 'To Hour'}</label>
                    <select value={endHour} onChange={(e) => setEndHour(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 outline-none bg-white">
                        {hourOptions.map(h => (<option key={h} value={h}>{h.toString().padStart(2, '0')}:59</option>))}
                    </select>
                </div>
                <button onClick={() => window.print()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                    🖨️ {isAr ? 'طباعة' : 'Print'}
                </button>
            </div>
            <div className="hidden print-only text-center mb-4">
                <h2 className="text-xl font-bold">{isAr ? 'تقرير البازار' : 'Bazaar Report'} - {bazaar.name}</h2>
                <p className="text-sm text-gray-600">{selectedDay !== 'all' ? `${selectedDay} | ` : ''}{startHour.toString().padStart(2, '0')}:00 - {endHour.toString().padStart(2, '0')}:59</p>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { label: isAr ? 'إجمالي المبيعات' : 'Total Sales', value: `${computedReport.totalSales.toLocaleString()} EGP`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
                    { label: isAr ? 'عدد الطلبات' : 'Orders', value: computedReport.orderCount, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
                    { label: isAr ? 'عدد العملاء' : 'Customers', value: computedReport.customerCount, icon: Users, color: 'text-purple-600 bg-purple-50' },
                ].map((card, i) => (
                    <div key={i} className="bg-white rounded-xl border p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${card.color}`}><card.icon size={20} /></div>
                            <span className="text-sm font-medium text-gray-500">{card.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Payment Breakdown */}
            {computedReport.paymentBreakdown.length > 0 && (
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                        <CreditCard size={16} /> {isAr ? 'طرق الدفع' : 'Payment Methods'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {computedReport.paymentBreakdown.map((pm, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 capitalize">{pm.method}</p>
                                    <p className="text-xs text-gray-500">{pm.count} {isAr ? 'طلب' : 'orders'}</p>
                                </div>
                                <p className="font-bold text-gray-900">{pm.total.toLocaleString()} EGP</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Products */}
            {computedReport.topProducts.length > 0 && (
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                        <Trophy size={16} /> {isAr ? 'المنتجات الأكثر مبيعاً' : 'Top Products'}
                    </h3>
                    <div className="space-y-2">
                        {computedReport.topProducts.slice(0, 10).map((product, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        i === 1 ? 'bg-gray-100 text-gray-700' :
                                            i === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-50 text-gray-500'
                                        }`}>{i + 1}</span>
                                    <span className="font-medium text-gray-900">{product.name}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-500">{product.quantity} {isAr ? 'قطعة' : 'pcs'}</span>
                                    <span className="font-semibold text-gray-900">{product.revenue.toLocaleString()} EGP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Staff */}
            {computedReport.topStaff.length > 0 && (
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                        <Award size={16} /> {isAr ? 'أكتر Staff مبيعات' : 'Top Staff'}
                    </h3>
                    <div className="space-y-2">
                        {computedReport.topStaff.map((staff, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-50 text-gray-500'
                                        }`}>{i + 1}</span>
                                    <span className="font-medium text-gray-900">{staff.name}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-500">{staff.orderCount} {isAr ? 'طلب' : 'orders'}</span>
                                    <span className="font-semibold text-gray-900">{staff.totalSales.toLocaleString()} EGP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ======================== POS TAB ========================
function POSTab({
    isAr, customerName, setCustomerName, customerPhone, setCustomerPhone,
    posItems, showProducts, setShowProducts, productSearch, setProductSearch,
    filteredProducts, addProduct, updateQuantity, removeItem, updateUnitPrice,
    promoCodeInput, setPromoCodeInput, applyPromoCode, appliedPromos, setAppliedPromos,
    paymentMethod, setPaymentMethod,
    subtotal, discount, grandTotal, paidAmount, setPaidAmount, setPaidTouched,
    changeAmount,
    posNote, setPosNote,
    totalOverride, setTotalOverride, totalTouched, setTotalTouched, finalTotal,
    posLoading, handlePOSSubmit,
    customerSearchQuery, setCustomerSearchQuery, customerSearchResults,
    searchingCustomers, showCustomerSearch, setShowCustomerSearch, setCustomerSearchResults,
    promoCodes, bazaar, paymentInfoMap, t
}: any) {
    // Get bazaar-specific promos that are active and not already applied
    const bazaarPromos = (promoCodes || []).filter((p: PromoCode) =>
        p.is_active &&
        p.bazaar_only &&
        (p.bazaar_id === bazaar?.id || !p.bazaar_id) &&
        !appliedPromos.some((ap: PromoCode) => ap.id === p.id)
    );

    const quickApplyPromo = (promo: PromoCode) => {
        setAppliedPromos((prev: PromoCode[]) => [...prev, promo]);
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Products & Customer */}
            <div className="lg:col-span-3 space-y-4">
                {/* Customer Quick Entry */}
                <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <User size={16} /> {isAr ? 'بيانات العميل' : 'Customer'}
                        </h3>
                        <button
                            onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                            className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                        >
                            {isAr ? '🔍 بحث' : '🔍 Search'}
                        </button>
                    </div>

                    {showCustomerSearch && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                value={customerSearchQuery}
                                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                                placeholder={isAr ? 'بحث بالاسم أو الرقم...' : 'Search by name or phone...'}
                                autoFocus
                            />
                            {searchingCustomers && <Loader2 className="w-4 h-4 animate-spin mt-2 mx-auto text-gray-400" />}
                            {customerSearchResults.length > 0 && (
                                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                                    {customerSearchResults.map((c: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setCustomerName(c.name || "");
                                                setCustomerPhone(c.phone || "");
                                                setShowCustomerSearch(false);
                                                setCustomerSearchQuery("");
                                                setCustomerSearchResults([]);
                                            }}
                                            className="w-full text-left p-2 hover:bg-white rounded text-sm"
                                        >
                                            <p className="font-medium">{c.name || 'No name'}</p>
                                            <p className="text-xs text-gray-500">{c.phone}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                            placeholder={isAr ? 'اسم العميل *' : 'Customer Name *'}
                        />
                        <div className="relative">
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                                placeholder="01xxxxxxxxx *"
                            />
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <Package size={16} /> {isAr ? 'المنتجات' : 'Products'}
                        </h3>
                        <button
                            onClick={() => setShowProducts(!showProducts)}
                            className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                        >
                            <Plus size={16} /> {isAr ? 'إضافة' : 'Add'}
                        </button>
                    </div>

                    {/* Product Search & Grid */}
                    <AnimatePresence>
                        {showProducts && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                                <div className="relative mb-3">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        placeholder={isAr ? 'بحث المنتجات...' : 'Search products...'}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                                    {filteredProducts.map((product: ProductView) => (
                                        <button
                                            key={product.slug}
                                            onClick={() => addProduct(product)}
                                            className="text-left p-2.5 border border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 hover:shadow-sm transition-all group"
                                        >
                                            <div className="flex items-start gap-2">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                        <Package size={16} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-xs text-gray-900 leading-tight line-clamp-2 group-hover:text-primary-700">{product.name}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-xs text-primary-600 font-bold">{product.price} EGP</p>
                                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${product.stock > 5 ? 'bg-green-50 text-green-600' : product.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                                            {product.stock > 0 ? `${product.stock}` : isAr ? 'نفد' : 'Out'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Cart Items */}
                    {posItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{isAr ? 'أضف منتجات للأوردر' : 'Add products to order'}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {posItems.map((item: POSItem) => (
                                <div key={item.product.slug} className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">{item.product.name}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateUnitPrice(item.product.slug, parseFloat(e.target.value) || 0)}
                                                className="w-16 sm:w-20 text-xs text-gray-500 bg-transparent border-b border-dashed border-gray-300 focus:border-primary-500 outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                min="0"
                                                step="0.01"
                                            />
                                            <span className="text-xs text-gray-400">EGP</span>
                                            {item.unitPrice !== item.product.price && (
                                                <span className="text-xs text-orange-500 line-through ml-1">{item.product.price}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => updateQuantity(item.product.slug, -1)} className="p-1.5 sm:p-1 hover:bg-gray-200 rounded"><Minus size={14} /></button>
                                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product.slug, 1)} className="p-1.5 sm:p-1 hover:bg-gray-200 rounded"><Plus size={14} /></button>
                                    </div>
                                    <span className="text-sm font-semibold text-right">{(item.unitPrice * item.quantity).toLocaleString()} EGP</span>
                                    <button onClick={() => removeItem(item.product.slug)} className="p-1.5 sm:p-1 text-red-500 hover:bg-red-50 rounded"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Summary & Payment */}
            <div className="lg:col-span-2 space-y-4">
                {/* Promo Code */}
                <div className="bg-white rounded-xl border p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <Tag size={16} /> {isAr ? 'كود خصم' : 'Promo Code'}
                    </h3>
                    {appliedPromos.length > 0 && (
                        <div className="space-y-2 mb-3">
                            {appliedPromos.map((promo: PromoCode) => (
                                <div key={promo.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-green-600" />
                                        <span className="font-medium text-green-700 text-sm">{promo.code}</span>
                                        <span className="text-xs text-green-600">
                                            {promo.is_bogo
                                                ? `Buy ${promo.bogo_buy_count} Get ${promo.bogo_get_count} at ${promo.bogo_discount_percentage}% off`
                                                : promo.percentage_off ? `${promo.percentage_off}%` : `${promo.amount_off} EGP`}
                                        </span>
                                    </div>
                                    <button onClick={() => setAppliedPromos((prev: PromoCode[]) => prev.filter((p: PromoCode) => p.id !== promo.id))} className="text-red-500"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                            placeholder={isAr ? 'أدخل الكود' : 'Enter code'}
                        />
                        <button onClick={applyPromoCode} disabled={!promoCodeInput.trim()} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium">
                            {isAr ? 'تطبيق' : 'Apply'}
                        </button>
                    </div>

                    {/* Available Bazaar Offers */}
                    {bazaarPromos.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-500 mb-2">{isAr ? 'عروض متاحة' : 'Available Offers'}</p>
                            <div className="space-y-1.5">
                                {bazaarPromos.map((promo: PromoCode) => (
                                    <button
                                        key={promo.id}
                                        onClick={() => quickApplyPromo(promo)}
                                        className="w-full flex items-center justify-between p-2.5 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-purple-600" />
                                            <div>
                                                <span className="font-medium text-purple-800 text-sm">{promo.code}</span>
                                                <span className="text-xs text-purple-600 block">
                                                    {promo.is_bogo
                                                        ? `Buy ${promo.bogo_buy_count} Get ${promo.bogo_get_count} at ${promo.bogo_discount_percentage ?? 100}% off`
                                                        : promo.percentage_off ? `${promo.percentage_off}% off` : `${promo.amount_off} EGP off`}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">{isAr ? 'تطبيق' : 'Apply'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl border p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <CreditCard size={16} /> {isAr ? 'طريقة الدفع' : 'Payment'}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map(pm => (
                            <button
                                key={pm.key}
                                onClick={() => setPaymentMethod(pm.key)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-sm font-medium ${paymentMethod === pm.key
                                    ? `${pm.color} border-current`
                                    : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <pm.icon size={20} />
                                <span>{isAr ? pm.labelAr : pm.label}</span>
                            </button>
                        ))}
                    </div>
                    {/* Payment Details (InstaPay / Wallet) */}
                    {(paymentMethod === 'instapay' || paymentMethod === 'wallet') && paymentInfoMap[paymentMethod] && (
                        (() => {
                            const info = paymentInfoMap[paymentMethod];
                            const hasInfo = info.account_number || info.account_name || info.qr_code_url;
                            if (!hasInfo) return null;
                            return (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    {info.account_name && (
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">{isAr ? 'الاسم:' : 'Name:'}</span> {info.account_name}
                                        </p>
                                    )}
                                    {info.account_number && (
                                        <p className="text-sm text-gray-700 mt-1">
                                            <span className="font-medium">{isAr ? 'الرقم:' : 'Number:'}</span>{' '}
                                            <span className="font-mono text-base select-all">{info.account_number}</span>
                                        </p>
                                    )}
                                    {info.qr_code_url && (
                                        <div className="mt-2 flex justify-center">
                                            <img src={info.qr_code_url} alt="QR Code" className="w-40 h-40 rounded-lg border border-gray-200 object-contain bg-white" />
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    )}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl border p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <DollarSign size={16} /> {isAr ? 'ملخص الطلب' : 'Summary'}
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                            <span className="font-medium">{subtotal.toLocaleString()} EGP</span>
                        </div>
                        <div className={`flex justify-between ${discount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            <span>{isAr ? 'الخصم' : 'Discount'}</span>
                            <span className="font-medium">{discount > 0 ? `-${discount.toLocaleString()} EGP` : '0 EGP'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t text-lg font-bold">
                            <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={totalOverride}
                                    onChange={(e) => {
                                        setTotalTouched(true);
                                        setTotalOverride(parseFloat(e.target.value) || 0);
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className={`w-28 px-2 py-1.5 border rounded-lg text-sm text-right font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${totalTouched ? 'border-primary-400 text-primary-600' : 'border-gray-200 text-primary-600'}`}
                                    placeholder="0"
                                    min="0"
                                />
                                <span className="text-xs text-gray-400">EGP</span>
                            </div>
                        </div>
                        {totalTouched && totalOverride !== grandTotal && (
                            <p className="text-[10px] text-orange-500 text-right">
                                {isAr ? `الإجمالي الأصلي: ${grandTotal.toLocaleString()} EGP` : `Original: ${grandTotal.toLocaleString()} EGP`}
                            </p>
                        )}

                        {/* Paid Amount (editable) */}
                        <div className="flex justify-between items-center pt-3 border-t border-dashed">
                            <span className="text-gray-600 text-sm font-medium">{isAr ? 'المدفوع' : 'Paid'}</span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={paidAmount}
                                    onChange={(e) => {
                                        setPaidTouched(true);
                                        setPaidAmount(parseFloat(e.target.value) || 0);
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="0"
                                    min="0"
                                />
                                <span className="text-xs text-gray-400">EGP</span>
                            </div>
                        </div>

                        {/* Change (auto-calculated) */}
                        <div className={`flex justify-between items-center text-sm font-semibold ${changeAmount >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                            <span>{isAr ? 'الباقي' : 'Change'}</span>
                            <span>{changeAmount.toLocaleString()} EGP</span>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="bg-white rounded-xl border p-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
                            {isAr ? '📝 ملاحظات' : '📝 Note'}
                        </label>
                        <textarea
                            value={posNote}
                            onChange={(e) => setPosNote(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none placeholder-gray-400"
                            placeholder={isAr ? 'أضف ملاحظة على الأوردر...' : 'Add a note to the order...'}
                        />
                    </div>

                    <button
                        onClick={handlePOSSubmit}
                        disabled={posLoading || posItems.length === 0}
                        className="w-full mt-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {posLoading ? (
                            <><Loader2 className="animate-spin" size={20} /> {isAr ? 'جاري التسجيل...' : 'Recording...'}</>
                        ) : (
                            <><Check size={20} /> {isAr ? 'تأكيد الأوردر' : 'Confirm Order'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ======================== ORDERS TAB ========================
function OrdersTab({ orders, isAr, lang }: { orders: any[]; isAr: boolean; lang: string }) {
    const router = useRouter();

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl border">
                <ShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">{isAr ? 'لا توجد طلبات' : 'No orders yet'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">#</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">{isAr ? 'العميل' : 'Customer'}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">{isAr ? 'الإجمالي' : 'Total'}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">{isAr ? 'الدفع' : 'Payment'}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">{isAr ? 'الحالة' : 'Status'}</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">{isAr ? 'بواسطة' : 'By'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <tr
                                key={order.order_id}
                                onClick={() => router.push(`/${lang}/admin/orders/${order.order_id}`)}
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-3 font-medium text-gray-900">#{order.order_id}</td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-900">{order.grand_total?.toLocaleString()} EGP</td>
                                <td className="px-4 py-3 capitalize text-gray-600">{order.payment_method}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{order.created_by_user_name || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
