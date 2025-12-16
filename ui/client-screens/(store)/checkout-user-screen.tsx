'use client';

import { Governorate } from "@/domain/entities/database/governorate";
import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { useEffect, useState } from "react";
import { CheckoutCart } from "@/ui/components/store/CheckoutCart";
import { Order } from "@/domain/entities/database/order";
import { useCart } from "@/ui/providers/CartProvider";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { createOrder } from "@/ui/hooks/store/useCreateOrderActions";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Plus, CreditCard, Banknote, CheckCircle2, Phone, User, Mail, Edit2 } from "lucide-react";

import { useTranslation, Trans } from "react-i18next";
import Link from "next/link";


type FormValues = Partial<Order> & {
    termsAccepted?: boolean;
};

export function CheckoutUserScreen({ governorates, user }: { governorates: Governorate[], user: ProfileView }) {
    const { t, i18n } = useTranslation();
    // default governorate is the first saved address governorate if exists
    const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(user?.address?.[0]?.governorate ?? null);
    // index of selected saved address, or 'new' to create another
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | 'new'>(user?.address && user.address.length > 0 ? 0 : 'new');
    const { cart, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'cod' | 'online'>('cod');
    const { register, handleSubmit, formState: { errors }, setValue, setError } = useForm<FormValues>({
        defaultValues: {
            guest_address: {}
        }
    });
    const router = useRouter();
    const products = cart.items;



    useEffect(() => {
        // keep governorate slug in the form in sync with selectedGovernorate only when using form mode
        if (selectedAddressIndex === 'new') {
            setValue('guest_address.governorate_slug', selectedGovernorate?.slug);
        } else {
            // when using saved address, ensure selectedGovernorate matches it
            const idx = selectedAddressIndex as number;
            const addrGov = user?.address?.[idx]?.governorate;
            setSelectedGovernorate(addrGov ?? null);
        }
    }, [selectedGovernorate, setValue, selectedAddressIndex, user]);



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
        setLoading(true);
        let payload: Partial<Order>;
        // If using a saved address, build payload from user.address entry (do not use form values)
        if (selectedAddressIndex !== 'new' && user.address && user.address[selectedAddressIndex as number]) {
            const addr = user.address[selectedAddressIndex as number];
            payload = {
                customer_id: user.id,
                shipping_address_id: addr.id,
            };
        } else {
            payload = {
                customer_id: user.id,
                guest_address: { address: data.guest_address?.address, governorate_slug: selectedGovernorate?.slug }
            }
        }

        payload = {
            ...payload,
            status: 'pending',
            guest_email: data.guest_email,
            guest_name: data.guest_name,
            guest_phone: data.guest_phone,
            guest_phone2: data.guest_phone2 ?? null,
            subtotal: cart.netTotal,
            discount_total: cart.discount,
            shipping_total: cart.free_shipping ? 0 : selectedGovernorate?.fees ?? 0,
            tax_total: 0.00,
            payment_method: cart.isAdmin ? 'Online Card' : selectedPayment === 'cod' ? 'Cash on Delivery' : 'Online Card',
            grand_total: getCartTotal(cart.free_shipping ? 0 : selectedGovernorate?.fees ?? 0),
            promo_code_id: cart.promoCodeId
        };
        const result = await createOrder(payload, cart.isAdmin, products);
        if (result.error) {
            toast.error(result.error);
            setLoading(false);
            return;
        } else if (result.order_id) {
            if (selectedPayment === 'online') {
                // try {
                //     const responseData = await initiatePaymobPayment(
                //         result.order_id,
                //         payload.grand_total!,
                //         {
                //             first_name: user.name.split(' ')[0],
                //             last_name: user.name.split(' ').slice(1).join(' ') || 'NA',
                //             email: user.email,
                //             phone: user.phone[0] || data.guest_phone!,
                //         },
                //         {
                //             street: payload.guest_address?.address || user.address?.[selectedAddressIndex as number]?.address || 'NA',
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
            // navigate first, then clear the cart to avoid in-place redirect from cart-empty watchers
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
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">{t('checkout.title')}</h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    <Trans i18nKey="checkout.subtitleUser" values={{ name: user.name }} components={{ 1: <span className="font-semibold text-gray-900" /> }} />
                                </p>
                            </div>

                            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>

                                {/* Contact Info (Read Only / Editable Phone) */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                            <User size={16} />
                                        </div>
                                        {t('checkout.contactInfo')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.fullName')}</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    disabled
                                                    value={user?.name ?? ''}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                                />
                                                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.email')}</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    readOnly
                                                    disabled
                                                    value={user?.email ?? ''}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                                />
                                                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.phone')}</label>
                                            {user.phone[0] === null || user.phone[0] === '' ? (
                                                <div className="relative">
                                                    <input
                                                        {...register('guest_phone', { required: t('checkout.errors.required', { field: t('checkout.phone') }) })}
                                                        type="text"
                                                        onChange={(e) => setValue('guest_phone', e.target.value)}
                                                        placeholder={t('checkout.placeholders.phone')}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                    />
                                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                    {errors.guest_phone?.message && (
                                                        <p className="text-sm text-red-600 mt-1">{errors.guest_phone?.message as any}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        disabled
                                                        value={user?.phone[0] ?? ''}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                                    />
                                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.altPhone')}</label>
                                            {user.phone.length < 2 || user.phone[1] === null || user.phone[1] === '' ? (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        onChange={(e) => setValue('guest_phone2', e.target.value)}
                                                        placeholder={t('checkout.placeholders.phone')}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                    />
                                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        disabled
                                                        value={user?.phone[1] ?? ''}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                                    />
                                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                </div>
                                            )}
                                        </div>
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

                                    {/* Address Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {user.address?.map((addr, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedAddressIndex(idx);
                                                    setSelectedGovernorate(addr.governorate ?? null);
                                                }}
                                                className={`cursor-pointer border rounded-xl p-4 relative transition-all ${selectedAddressIndex === idx ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${selectedAddressIndex === idx ? 'border-primary-600' : 'border-gray-400'}`}>
                                                        {selectedAddressIndex === idx && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{addr.address}</p>
                                                        <p className="text-sm text-gray-500">{i18n.language === 'ar' ? addr.governorate?.name_ar : addr.governorate?.name_en}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add New Address Card */}
                                        <div
                                            onClick={() => {
                                                setSelectedAddressIndex('new');
                                                setSelectedGovernorate(governorates[0] ?? null);
                                            }}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[100px] border-dashed transition-all ${selectedAddressIndex === 'new' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedAddressIndex === 'new' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <Plus size={16} />
                                            </div>
                                            <span className={`text-sm font-medium ${selectedAddressIndex === 'new' ? 'text-primary-700' : 'text-gray-600'}`}>{t('checkout.addNewAddress')}</span>
                                        </div>
                                    </div>

                                    {/* New Address Form (Conditional) */}
                                    {selectedAddressIndex === 'new' && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <label className="block md:col-span-2">
                                                    <span className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checkout.streetAddress')}</span>
                                                    <div className="relative">
                                                        <input
                                                            {...register('guest_address.address', { required: t('checkout.errors.required', { field: t('checkout.streetAddress') }) })}
                                                            type="text"
                                                            onChange={(e) => setValue('guest_address.address', e.target.value)}
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
                                    )}
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
