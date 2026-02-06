'use client';

import { Governorate } from "@/domain/entities/database/governorate";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckoutCart } from "@/ui/components/store/CheckoutCart";
import { Order } from "@/domain/entities/database/order";
import { useCart } from "@/ui/providers/CartProvider";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { createOrder } from "@/ui/hooks/store/useCreateOrderActions";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Banknote, MapPin, Phone, User, Mail, CheckCircle2, MessageSquare } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics/gtag";

// import { initiatePaymobPayment } from "@/ui/hooks/store/usePaymobActions";

type FormValues = Partial<Order> & {
    termsAccepted?: boolean;
};

export function CheckoutGuestScreen({ governorates }: { governorates: Governorate[] }) {
    const { t, i18n } = useTranslation();
    const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);
    const { cart, clearCart, getCartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'cod' | 'online'>('cod');
    const { register, handleSubmit, formState: { errors }, setValue, setError, watch } = useForm<FormValues>({
        defaultValues: {
            guest_address: {}
        }
    });
    const router = useRouter();
    const products = cart.items;




    useEffect(() => {
        // keep governorate slug in the form in sync with selectedGovernorate
        setValue('guest_address.governorate_slug', selectedGovernorate?.slug);
    }, [selectedGovernorate, setValue]);

    // GA4 Track Begin Checkout
    useEffect(() => {
        if (cart.items.length > 0) {
            trackBeginCheckout(
                cart.items.map(item => ({
                    item_id: item.id || item.slug,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                cart.netTotal
            );
        }
    }, []);


    const onSubmit = async (data: FormValues) => {
        // extra validation: governorate
        if (!selectedGovernorate) {
            setError('guest_address', { type: 'manual', message: t('checkout.errors.selectGovernorate') } as any);
            toast.error(t('checkout.errors.selectGovernorate'));
            return;
        }

        if (!data.termsAccepted) {
            setError('termsAccepted', { type: 'manual', message: t('checkout.errors.acceptTerms') });
            toast.error(t('checkout.errors.acceptTerms'));
            return;
        }

        // Phone number validation
        if (!data.guest_phone || data.guest_phone.trim() === '') {
            setError('guest_phone', { type: 'manual', message: t('checkout.errors.required', { field: t('checkout.phone') }) });
            toast.error(t('checkout.errors.phoneRequired') || 'Phone number is required');
            return;
        }
        setLoading(true);
        const { termsAccepted, ...restData } = data;

        // Calculate subtotal from items directly
        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Calculate discounts sequentially
        let remainingAmount = subtotal;
        const appliedPromoCodesWithCorrectDiscounts: { id: number; code: string; discount: number; auto_apply: boolean }[] = [];

        // First: Apply all fixed amount discounts (amount_off)
        cart.promoCodes?.forEach(p => {
            if (p.amount_off && p.amount_off > 0) {
                const promoDiscount = Math.min(p.amount_off, remainingAmount);
                appliedPromoCodesWithCorrectDiscounts.push({
                    id: p.id,
                    code: p.code,
                    discount: promoDiscount,
                    auto_apply: p.auto_apply ?? false
                });
                remainingAmount -= promoDiscount;
            }
        });

        // Then: Apply percentage discounts on the remaining amount
        cart.promoCodes?.forEach(p => {
            if (p.percentage_off && p.percentage_off > 0) {
                const promoDiscount = remainingAmount * (p.percentage_off / 100);
                appliedPromoCodesWithCorrectDiscounts.push({
                    id: p.id,
                    code: p.code,
                    discount: promoDiscount,
                    auto_apply: p.auto_apply ?? false
                });
                remainingAmount -= promoDiscount;
            }
        });

        const totalDiscount = cart.isAdmin ? 0 : appliedPromoCodesWithCorrectDiscounts.reduce((sum, p) => sum + p.discount, 0);

        // Check if any promo has free shipping
        const hasFreeShipping = cart.promoCodes?.some(p => p.free_shipping) ?? false;
        const shippingTotal = cart.isAdmin ? (selectedGovernorate?.fees ?? 0) : (hasFreeShipping ? 0 : (selectedGovernorate?.fees ?? 0));

        const orderPayload: Partial<Order> = {
            ...restData,
            guest_email: data.guest_email ? data.guest_email.length > 0 ? data.guest_email : null : null,
            guest_phone2: data.guest_phone2 ? data.guest_phone2.length > 0 ? data.guest_phone2 : null : null,
            status: 'pending',
            subtotal: subtotal,
            discount_total: totalDiscount,
            shipping_total: shippingTotal,
            tax_total: 0.00,
            payment_status: cart.isAdmin ? 'paid' : 'pending',
            payment_method: cart.isAdmin ? 'Online Card' : selectedPayment === 'cod' ? 'Cash on Delivery' : 'Online Card',
            grand_total: subtotal - totalDiscount + shippingTotal,
            guest_address: { ...(data.guest_address || {}), governorate_slug: selectedGovernorate?.slug },
            promo_code_id: cart.promoCodeId,
            applied_promo_codes: appliedPromoCodesWithCorrectDiscounts.length > 0 ? appliedPromoCodesWithCorrectDiscounts : null
        };
        const result = await createOrder(orderPayload, cart.isAdmin, products);
        if (result.error) {
            toast.error(result.error);
            setLoading(false);
            return;
        }
        else if (result.order_id) {
            if (selectedPayment === 'online') {
                // try {
                //     const responseData = await initiatePaymobPayment(
                //         result.order_id,
                //         orderPayload.grand_total!,
                //         {
                //             first_name: data.guest_name?.split(' ')[0] || 'Guest',
                //             last_name: data.guest_name?.split(' ').slice(1).join(' ') || 'NA',
                //             email: data.guest_email!,
                //             phone: data.guest_phone!,
                //         },
                //         {
                //             street: data.guest_address?.address || 'NA',
                //             city: selectedGovernorate?.name_en || 'NA',
                //             country: 'EG',
                //             state: selectedGovernorate?.name_en || 'NA',
                //         }
                //     );

                //     if (responseData.error) {
                //         toast.error(responseData.error);
                //         setLoading(false);
                //         return;
                //     }

                //     if (responseData.iframeUrl) {
                //         await clearCart();
                //         window.location.href = responseData.iframeUrl;
                //         return;
                //     }
                // } catch (err) {
                //     console.error(err);
                //     toast.error("checkout.errors.paymentFailed");
                //     setLoading(false);
                //     return;
                // }
            }

            toast.success(t('checkout.success.orderCreated'));

            // GA4 Track Purchase
            trackPurchase(
                result.order_id,
                cart.items.map(item => ({
                    item_id: item.id || item.slug,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                orderPayload.grand_total || 0,
                orderPayload.shipping_total || 0,
                orderPayload.tax_total || 0,
                cart.promoCode || undefined
            );

            // navigate first then clear cart to avoid any cart-empty watchers redirecting away
            router.push(`/orders/${result.order_id}`);
            await clearCart();
        }
    };
    if (loading) return (<main className="min-h-screen flex justify-center items-center flex-col gap-5">
        <Loader2 className=" w-10 h-10 inline-block animate-spin mr-2 text-primary-600" size={32} />
        <p className="text-gray-600 font-medium">{t('checkout.processing')}</p>
    </main>)
    return (
        <main className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Left: Shipping Form */}
                    <section className="w-full lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{t('checkout.title')}</h2>
                                    <p className="text-gray-500 text-sm mt-1">{t('checkout.subtitleGuest')}</p>
                                </div>
                                <div className="text-sm bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                                    <span>{t('checkout.alreadyHaveAccount')}</span>
                                    <Link href={'/login'} className={'underline hover:text-primary-800'}>{t('checkout.login')}</Link>
                                </div>
                            </div>

                            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>

                                {/* Contact Info Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                            <User size={16} />
                                        </div>
                                        {t('checkout.contactInfo')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.fullName')}</span>
                                            <div className="relative">
                                                <input
                                                    {...register('guest_name', { required: t('checkout.errors.required', { field: t('checkout.fullName') }) })}
                                                    type="text"
                                                    placeholder={t('checkout.placeholders.name')}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                            {errors.guest_name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.guest_name.message as any}</p>
                                            )}
                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.email')} <span className="text-gray-400 font-normal">{t('checkout.optional')}</span></span>
                                            <div className="relative">
                                                <input
                                                    {...register('guest_email', {
                                                        pattern: { value: /^\S+@\S+\.\S+$/, message: t('checkout.errors.invalid', { field: t('checkout.email') }) }
                                                    })}
                                                    type="email"
                                                    placeholder={t('checkout.placeholders.email')}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            </div>

                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.phone')}</span>
                                            <div className="relative">
                                                <input
                                                    {...register('guest_phone', {
                                                        required: t('checkout.errors.required', { field: t('checkout.phone') }),
                                                        minLength: { value: 6, message: t('checkout.errors.invalid', { field: t('checkout.phone') }) }
                                                    })}
                                                    type="tel"
                                                    placeholder={t('checkout.placeholders.phone')}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                            {errors.guest_phone && (
                                                <p className="text-sm text-red-600 mt-1">{errors.guest_phone.message as any}</p>
                                            )}
                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.altPhone')} <span className="text-gray-400 font-normal">{t('checkout.optional')}</span></span>
                                            <div className="relative">
                                                <input
                                                    {...register('guest_phone2')}
                                                    type="tel"
                                                    placeholder={t('checkout.placeholders.phone')}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Shipping Address Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                            <MapPin size={16} />
                                        </div>
                                        {t('checkout.shippingAddress')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block md:col-span-2">
                                            <span className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.streetAddress')}</span>
                                            <div className="relative">
                                                <input
                                                    {...register('guest_address.address', { required: t('checkout.errors.required', { field: t('checkout.streetAddress') }) })}
                                                    type="text"
                                                    placeholder={t('checkout.placeholders.address')}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                            {errors.guest_address?.message && (
                                                <p className="text-sm text-red-600 mt-1">{errors.guest_address?.message as any}</p>
                                            )}
                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.governorate')}</span>
                                            <div className="relative">
                                                <select
                                                    {...register('guest_address.governorate_slug')}
                                                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                                                    onChange={(e) => {
                                                        const gov = governorates.find(gov => gov.slug === e.target.value) || null;
                                                        setSelectedGovernorate(gov);
                                                    }}>
                                                    <option value={''}>{t('checkout.selectGovernorate')}</option>
                                                    {governorates.map((gov) => (
                                                        <option key={gov.slug} value={gov.slug}>{i18n.language === 'ar' ? gov.name_ar : gov.name_en}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                            {errors.guest_address?.message && (
                                                <p className="text-sm text-red-600 mt-1">{errors.guest_address?.message as any}</p>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Payment Method Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                            <CreditCard size={16} />
                                        </div>
                                        {t('checkout.paymentMethod')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setSelectedPayment('cod')}
                                            className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${selectedPayment === 'cod' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPayment === 'cod' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <Banknote size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-semibold ${selectedPayment === 'cod' ? 'text-primary-900' : 'text-gray-900'}`}>{t('checkout.cod')}</p>
                                                <p className="text-sm text-gray-500">{t('checkout.codDesc')}</p>
                                            </div>
                                            {selectedPayment === 'cod' && <CheckCircle2 className="text-primary-600" size={20} />}
                                        </div>

                                        <div
                                            onClick={() => { }}

                                            className={` border rounded-xl p-4 flex items-center gap-4 transition-all ${selectedPayment === 'online' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPayment === 'online' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <CreditCard size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-semibold ${selectedPayment === 'online' ? 'text-primary-900' : 'text-gray-900'}`}>{t('checkout.online')}<span className="text-gray-500 mx-2 text-xs">({t('comingSoon')})</span></p>
                                                <p className="text-sm text-gray-500">
                                                    <Trans i18nKey={'otherOnlineOptions'} components={{ a: <Link href="https://wa.me/201090998664" target="_blank" className="text-primary-600 hover:underline font-semibold"></Link>, b: <span className="font-semibold"></span> }} />
                                                </p>
                                            </div>
                                            {selectedPayment === 'online' && <CheckCircle2 className="text-primary-600" size={20} />}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Order Notes Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                            <MessageSquare size={16} />
                                        </div>
                                        {i18n.language === 'ar' ? 'ملاحظات خاصة' : 'Special Instructions'}
                                    </h3>
                                    <textarea
                                        {...register('note')}
                                        placeholder={i18n.language === 'ar'
                                            ? '💭 عندك طلب خاص؟ قولنا هنا! مثلاً: "اتصلوا قبل التوصيل" أو "سيبوها عند الباب" أو "تغليف هدية"...'
                                            : '💭 Have something special in mind? Tell us here! e.g., "Call before delivery" or "Leave at door" or "Gift wrap please"...'}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none text-sm"
                                    />
                                    <p className="text-xs text-gray-500">
                                        💡 {i18n.language === 'ar' ? 'ملاحظاتك هتوصل لشركة الشحن' : 'Your notes will be shared with the delivery team'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <input
                                        {...register('termsAccepted', { required: t('checkout.errors.acceptTerms') })}
                                        type="checkbox"
                                        id="terms"
                                        className="w-5 h-5 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none">
                                        <Trans i18nKey="checkout.terms" components={{ 1: <Link href="/contact-us" target="_blank" className="text-primary-600 font-medium hover:underline" /> }} />
                                    </label>
                                </div>
                                {errors.termsAccepted && (
                                    <p className="text-sm text-red-600 ml-1">{errors.termsAccepted.message as any}</p>
                                )}

                            </form>
                        </div>
                    </section>

                    {/* Right: Cart Summary */}
                    <CheckoutCart selectedGovernorate={selectedGovernorate} onPurchase={async () => {
                        // trigger form submission via react-hook-form
                        await handleSubmit(onSubmit)();
                    }} />
                </div>
            </div>
        </main>
    );
}
