"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { Governorate } from "@/domain/entities/database/governorate";
import { PromoCode } from "@/domain/entities/database/promoCode";
import {
    User, Phone, Mail, MapPin, Package, Tag, Plus, Minus, X,
    Search, ShoppingCart, Loader2, ArrowLeft, DollarSign, UserSearch, Check, MessageSquare
} from "lucide-react";
import { createAdminOrderAction } from "@/ui/hooks/admin/useAdminCreateOrder";

interface OrderItem {
    product: ProductView;
    quantity: number;
    unitPrice: number; // editable
}

interface CustomerSearchResult {
    type: 'registered' | 'guest';
    id: number | null;
    name: string;
    phone: string;
    phone2: string;
    email: string;
    addresses: { address: string; governorate_slug: string }[];
}

interface AdminCreateOrderScreenProps {
    products: ProductView[];
    governorates: Governorate[];
    promoCodes: PromoCode[];
}

export function AdminCreateOrderScreen({ products, governorates, promoCodes }: AdminCreateOrderScreenProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();

    // Customer Search State
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");
    const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResult[]>([]);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [searchingCustomers, setSearchingCustomers] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);

    // Customer Info State
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerPhone2, setCustomerPhone2] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);

    // Products State
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [showProductModal, setShowProductModal] = useState(false);

    // Promo Code State
    const [promoCodeInput, setPromoCodeInput] = useState("");
    const [appliedPromos, setAppliedPromos] = useState<PromoCode[]>([]);

    // Price Overrides
    const [shippingOverride, setShippingOverride] = useState<number | null>(null);

    // Order Notes
    const [orderNote, setOrderNote] = useState("");

    // UI State
    const [loading, setLoading] = useState(false);

    // Customer Search with debounce
    useEffect(() => {
        const searchCustomers = async () => {
            if (customerSearchQuery.length < 2) {
                setCustomerSearchResults([]);
                return;
            }

            setSearchingCustomers(true);
            try {
                const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(customerSearchQuery)}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCustomerSearchResults(data);
                }
            } catch (error) {
                console.error("Customer search error:", error);
            } finally {
                setSearchingCustomers(false);
            }
        };

        const timer = setTimeout(searchCustomers, 300);
        return () => clearTimeout(timer);
    }, [customerSearchQuery]);

    // Handle customer selection
    const handleSelectCustomer = (customer: CustomerSearchResult) => {
        setSelectedCustomer(customer);
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
        setCustomerPhone2(customer.phone2 || "");
        setCustomerEmail(customer.email || "");

        // Set address from first address if available
        if (customer.addresses && customer.addresses.length > 0) {
            const addr = customer.addresses[0];
            setCustomerAddress(addr.address || "");

            // Find matching governorate
            const gov = governorates.find(g => g.slug === addr.governorate_slug);
            if (gov) {
                setSelectedGovernorate(gov);
            }
        }

        setShowCustomerSearch(false);
        setCustomerSearchQuery("");
        toast.success(`Customer "${customer.name}" selected`);
    };

    // Clear selected customer
    const clearSelectedCustomer = () => {
        setSelectedCustomer(null);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerPhone2("");
        setCustomerEmail("");
        setCustomerAddress("");
        setSelectedGovernorate(null);
    };

    // Filtered Products for Search
    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products;
        const search = productSearch.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.slug.toLowerCase().includes(search)
        );
    }, [products, productSearch]);

    // Calculate current subtotal for promo validation
    const currentSubtotal = useMemo(() => {
        return orderItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    }, [orderItems]);

    // Filter and Apply Auto-Apply Promo Codes - now checks min_order_amount
    useEffect(() => {
        const autoApplyPromos = promoCodes.filter(p => p.auto_apply && p.is_active);

        if (autoApplyPromos.length > 0) {
            setAppliedPromos(prev => {
                const newPromosToApply: PromoCode[] = [];
                const promosToRemove: number[] = [];

                autoApplyPromos.forEach(promo => {
                    const alreadyApplied = prev.some(p => p.id === promo.id);

                    // Check Customer Eligibility
                    if (promo.eligible_customer_ids && promo.eligible_customer_ids.length > 0) {
                        if (!selectedCustomer || !selectedCustomer.id || !promo.eligible_customer_ids.includes(selectedCustomer.id)) {
                            if (alreadyApplied) promosToRemove.push(promo.id);
                            return;
                        }
                    }

                    // Check Minimum Order Amount
                    if (promo.min_order_amount && promo.min_order_amount > 0) {
                        if (currentSubtotal < promo.min_order_amount) {
                            // Remove if was applied but no longer qualifies
                            if (alreadyApplied) promosToRemove.push(promo.id);
                            return;
                        }
                    }

                    // If not already applied, add it
                    if (!alreadyApplied) {
                        newPromosToApply.push(promo);
                    }
                });

                // Remove promos that no longer qualify
                let updatedPromos = prev.filter(p => !promosToRemove.includes(p.id));

                if (newPromosToApply.length > 0) {
                    toast.success(t("checkout.autoPromoApplied", { amount: newPromosToApply.length }) || "Auto promo code applied!");
                    return [...updatedPromos, ...newPromosToApply];
                }

                if (promosToRemove.length > 0) {
                    return updatedPromos;
                }

                return prev;
            });
        }
    }, [promoCodes, selectedCustomer, t, currentSubtotal]);

    // Calculations
    const subtotal = useMemo(() => {
        return orderItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    }, [orderItems]);

    const shipping = useMemo(() => {
        // Free shipping promo code overrides everything
        const hasFreeShipping = appliedPromos.some(p => p.free_shipping);
        if (hasFreeShipping) return 0;
        if (shippingOverride !== null) return shippingOverride;
        return selectedGovernorate?.fees ?? 0;
    }, [selectedGovernorate, shippingOverride, appliedPromos]);

    const discount = useMemo(() => {
        if (appliedPromos.length === 0) return 0;

        let totalDiscount = 0;

        // Calculate discount from each promo
        appliedPromos.forEach(promo => {
            // Fixed amount discount
            if (promo.amount_off && promo.amount_off > 0) {
                totalDiscount += promo.amount_off;
            }
            // Percentage discount
            else if (promo.percentage_off && promo.percentage_off > 0) {
                totalDiscount += subtotal * (promo.percentage_off / 100);
            }
        });

        // Make sure discount doesn't exceed subtotal
        return Math.min(totalDiscount, subtotal);
    }, [appliedPromos, subtotal]);

    const grandTotal = useMemo(() => {
        return subtotal + shipping - discount;
    }, [subtotal, shipping, discount]);

    // Add Product to Order
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

    // Update Item Quantity
    const updateQuantity = (slug: string, delta: number) => {
        setOrderItems(prev => prev.map(item => {
            if (item.product.slug === slug) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    // Update Item Price
    const updateItemPrice = (slug: string, price: number) => {
        setOrderItems(prev => prev.map(item =>
            item.product.slug === slug ? { ...item, unitPrice: price } : item
        ));
    };

    // Remove Item
    const removeItem = (slug: string) => {
        setOrderItems(prev => prev.filter(item => item.product.slug !== slug));
    };

    // Apply Promo Code
    const applyPromoCode = () => {
        const promo = promoCodes.find(p =>
            p.code.toLowerCase() === promoCodeInput.toLowerCase() && p.is_active
        );
        if (promo) {
            // Check if already applied
            if (appliedPromos.some(p => p.id === promo.id)) {
                toast.error(t("promoAlreadyApplied") || "This code is already applied");
                return;
            }
            // Check usage limit
            if (promo.usage_limit && (promo.usage_count || 0) >= promo.usage_limit) {
                toast.error(t("promoLimitReached") || "This promo code has reached its usage limit");
                return;
            }
            setAppliedPromos(prev => [...prev, promo]);
            setPromoCodeInput("");
            toast.success(t("promoApplied", { code: promo.code }));
        } else {
            toast.error(t("invalidPromoCode"));
        }
    };

    // Remove Promo Code
    const removePromoCode = (promoId: number) => {
        setAppliedPromos(prev => prev.filter(p => p.id !== promoId));
    };

    // Submit Order
    const handleSubmit = async () => {
        // Validation
        if (!customerName.trim()) {
            toast.error(t("adminOrders.errors.nameRequired"));
            return;
        }
        if (!customerPhone.trim()) {
            toast.error(t("adminOrders.errors.phoneRequired"));
            return;
        }
        if (!customerAddress.trim()) {
            toast.error(t("adminOrders.errors.addressRequired"));
            return;
        }
        if (!selectedGovernorate) {
            toast.error(t("adminOrders.errors.governorateRequired"));
            return;
        }
        if (orderItems.length === 0) {
            toast.error(t("adminOrders.errors.noProducts"));
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                guest_name: customerName,
                guest_phone: customerPhone,
                guest_phone2: customerPhone2 || null,
                guest_email: customerEmail || null,
                guest_address: {
                    address: customerAddress,
                    governorate_slug: selectedGovernorate.slug
                },
                subtotal,
                discount_total: discount,
                shipping_total: shipping,
                tax_total: 0,
                grand_total: grandTotal,
                payment_method: "Admin Order",
                payment_status: "pending",
                status: "processing",
                note: orderNote.trim() || null,
                promo_code_id: appliedPromos[0]?.id ?? null,
                items: orderItems.map(item => ({
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
            } else if (result.order_id) {
                toast.success(t("adminOrders.orderCreated"));
                router.push(`/admin/orders/${result.order_id}`);
            }
        } catch (error) {
            console.error("Failed to create order:", error);
            toast.error(t("adminOrders.errors.createFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 max-w-6xl mx-auto"
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
                    <h1 className="text-2xl font-bold text-gray-900">{t("adminOrders.createOrder")}</h1>
                    <p className="text-sm text-gray-500">{t("adminOrders.createOrderDesc")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Customer Info & Products */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                                <User size={16} /> {t("adminOrders.customerInfo")}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                            >
                                <UserSearch size={16} />
                                {t("searchCustomers")}
                            </button>
                        </div>

                        {/* Customer Search Dropdown */}
                        {showCustomerSearch && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={customerSearchQuery}
                                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                        placeholder={t("adminOrders.searchByNamePhoneEmail") || "Search by name, phone, or email..."}
                                        autoFocus
                                    />
                                    {searchingCustomers && (
                                        <Loader2 className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                                    )}
                                </div>

                                {/* Search Results */}
                                {customerSearchResults.length > 0 && (
                                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                                        {customerSearchResults.map((customer, idx) => (
                                            <button
                                                key={`${customer.type}-${customer.phone}-${idx}`}
                                                onClick={() => handleSelectCustomer(customer)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-white rounded-lg transition-colors text-left border border-transparent hover:border-gray-200"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">{customer.name || t("adminOrders.noName") || "No name"}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {customer.phone} {customer.email && `• ${customer.email}`}
                                                    </p>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${customer.type === 'registered'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {customer.type === 'registered' ? t("adminOrders.account") || "Account" : t("adminOrders.guest") || "Guest"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {customerSearchQuery.length >= 2 && !searchingCustomers && customerSearchResults.length === 0 && (
                                    <p className="mt-2 text-sm text-gray-500 text-center py-2">{t("noCustomers")}</p>
                                )}
                            </div>
                        )}

                        {/* Selected Customer Indicator */}
                        {selectedCustomer && (
                            <div className="mb-4 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-700">
                                        <strong>{selectedCustomer.name}</strong> {t("adminOrders.selected") || "selected"} ({selectedCustomer.type === 'registered' ? t("adminOrders.account") || "Account" : t("adminOrders.guest") || "Guest"})
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearSelectedCustomer}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("adminOrders.customerName")} *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                    placeholder={t("adminOrders.placeholders.name")}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("adminOrders.phone")} *
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                        placeholder="01xxxxxxxxx"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("adminOrders.phone2")}
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="tel"
                                        value={customerPhone2}
                                        onChange={(e) => setCustomerPhone2(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                        placeholder={t("adminOrders.optional")}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("adminOrders.email")}
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                        placeholder={t("adminOrders.optional")}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("adminOrders.address")} *
                                </label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                    <textarea
                                        value={customerAddress}
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                                        rows={2}
                                        placeholder={t("adminOrders.placeholders.address")}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("adminOrders.governorate")} *
                                </label>
                                <select
                                    value={selectedGovernorate?.slug || ""}
                                    onChange={(e) => {
                                        const gov = governorates.find(g => g.slug === e.target.value);
                                        setSelectedGovernorate(gov || null);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                >
                                    <option value="">{t("adminOrders.selectGovernorate")}</option>
                                    {governorates.map(gov => (
                                        <option key={gov.slug} value={gov.slug}>
                                            {i18n.language === 'ar' ? gov.name_ar : gov.name_en} ({t("{{price, currency}}", { price: gov.fees })})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                                <Package size={16} /> {t("adminOrders.orderItems")}
                            </h3>
                            <button
                                onClick={() => setShowProductModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                            >
                                <Plus size={16} /> {t("adminOrders.addProduct")}
                            </button>
                        </div>

                        {orderItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                                <p>{t("adminOrders.noItemsYet")}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orderItems.map(item => (
                                    <div key={item.product.slug} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">{item.product.slug}</p>
                                        </div>

                                        {/* Quantity Controls */}
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

                                        {/* Unit Price */}
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItemPrice(item.product.slug, parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-center"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        {/* Line Total */}
                                        <div className="w-24 text-right font-medium">
                                            {t("{{price, currency}}", { price: item.unitPrice * item.quantity })}
                                        </div>

                                        {/* Remove */}
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

                    {/* Order Notes Section */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-4">
                            <MessageSquare size={16} /> {t("orderNotes") || "Order Notes"}
                        </h3>
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder={t("addOrderNotes") || "Add notes for this order... (will be sent to shipping company)"}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            💡 {t("notesWillBeSentToShipping") || "Notes will be sent to the shipping company when creating shipment"}
                        </p>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <DollarSign size={16} /> {t("adminOrders.orderSummary")}
                        </h3>

                        <div className="space-y-4">
                            {/* Promo Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("adminOrders.promoCode")}
                                </label>
                                {appliedPromos.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        {appliedPromos.map((promo, idx) => (
                                            <div key={promo.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-green-600" />
                                                    <span className="font-medium text-green-700">{promo.code}</span>
                                                    <span className="text-xs text-green-600">
                                                        {promo.free_shipping
                                                            ? t("freeShipping") || "Free Shipping"
                                                            : `${promo.percentage_off}%`
                                                        }
                                                    </span>
                                                    {idx === 0 && appliedPromos.length > 1 && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                            {promo.stacking_mode === 'sequential' ? 'Sequential' : 'Additive'}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removePromoCode(promo.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCodeInput}
                                        onChange={(e) => setPromoCodeInput(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                                        placeholder={t("adminOrders.enterPromoCode")}
                                    />
                                    <button
                                        onClick={applyPromoCode}
                                        disabled={!promoCodeInput.trim()}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
                                    >
                                        {t("apply")}
                                    </button>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t("subtotal")}</span>
                                    <span className="font-medium">{t("{{price, currency}}", { price: subtotal })}</span>
                                </div>

                                {/* Shipping - Editable */}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">{t("shippingLabel")}</span>
                                    <input
                                        type="number"
                                        value={shippingOverride !== null ? shippingOverride : (selectedGovernorate?.fees ?? 0)}
                                        onChange={(e) => setShippingOverride(parseFloat(e.target.value) || 0)}
                                        className="w-24 px-2 py-1 border border-gray-200 rounded text-sm text-right"
                                        min="0"
                                    />
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>{t("discount")}</span>
                                        <span className="font-medium">-{t("{{price, currency}}", { price: discount })}</span>
                                    </div>
                                )}

                                {/* Grand Total */}
                                <div className="flex justify-between items-center pt-3 border-t text-lg font-bold">
                                    <span>{t("total")}</span>
                                    <span className="text-primary-600">{t("{{price, currency}}", { price: grandTotal })}</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading || orderItems.length === 0}
                                className="w-full mt-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        {t("adminOrders.creating")}
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        {t("adminOrders.createOrderBtn")}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Selection Modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden m-4"
                    >
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{t("adminOrders.selectProduct")}</h3>
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
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                    placeholder={t("adminOrders.searchProducts")}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[50vh] p-2">
                            {filteredProducts.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">{t("adminOrders.noProductsFound")}</p>
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
                                                <p className="text-xs text-gray-500">{product.slug} • Stock: {product.stock}</p>
                                            </div>
                                            <span className="font-semibold text-primary-600">
                                                {t("{{price, currency}}", { price: product.price })}
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
