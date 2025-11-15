'use client';

import {Governorate} from "@/domain/entities/database/governorate";
import Link from "next/link";
import {useEffect, useState} from "react";
import {CheckoutCart} from "@/ui/components/store/CheckoutCart";
import {Order} from "@/domain/entities/database/order";
import {useCart} from "@/ui/providers/CartProvider";
import {toast} from "sonner";
import {useForm} from "react-hook-form";
import {createOrder} from "@/ui/hooks/store/useCreateOrderActions";
import {useRouter} from "next/navigation";
import {Loader2} from "lucide-react";


type FormValues = Partial<Order> & {
    termsAccepted?: boolean;
};

export function CheckoutGuestScreen({governorates}: { governorates: Governorate[] }) {
    const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);
    const {cart, loading: fetching, getCartNetTotal, getCartTotal, clearCart, totalDiscount} = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'cod' | 'paymob'>('cod');
    const {register, handleSubmit, formState: {errors}, setValue, setError} = useForm<FormValues>({
        defaultValues: {
            guest_address: {}
        }
    });
    const router = useRouter();


    console.log('cart length ,' + cart.length)
    useEffect(() => {
        if (!fetching && cart.length === 0) {
            // Only redirect if not currently submitting an order
            if (!loading) {
                router.push('/'); // ✅ safe here
            }
        }
    }, [cart, router, fetching, loading]);

    useEffect(() => {
        // keep governorate slug in the form in sync with selectedGovernorate
        setValue('guest_address.governorate_slug', selectedGovernorate?.slug);
    }, [selectedGovernorate, setValue]);

    const onSubmit = async (data: FormValues) => {
        // extra validation: governorate
        if (!selectedGovernorate) {
            setError('guest_address', {type: 'manual', message: 'Please select a governorate.'} as any);
            toast.error('Please select a governorate.');
            return;
        }

        if (!data.termsAccepted) {
            setError('termsAccepted', {type: 'manual', message: 'You must accept the Terms and Conditions.'});
            toast.error('You must accept the Terms and Conditions.');
            return;
        }
        setLoading(true);
        const {termsAccepted, ...restData} = data;
        const orderPayload: Partial<Order> = {
            ...restData,
            guest_phone2: data.guest_phone2 ? data.guest_phone2.length > 0 ? data.guest_phone2 : null : null,
            status: 'pending',
            subtotal: getCartTotal(),
            discount_total: totalDiscount,
            shipping_total: selectedGovernorate?.fees ?? 0,
            tax_total: 0.00,
            payment_method: selectedPayment === 'cod' ? 'Cash on Delivery' : 'unpaid',
            grand_total: getCartNetTotal() + (selectedGovernorate?.fees ?? 0),
            guest_address: {...(data.guest_address || {}), governorate_slug: selectedGovernorate?.slug}
        };
        const result = await createOrder(orderPayload, cart);
        if (result.error) {
            toast.error(result.error);
            setLoading(false);
            return;
        } else if (result.order_id) {
            toast.success('Order created successfully!');
            // navigate first then clear cart to avoid any cart-empty watchers redirecting away
            router.push(`/orders/${result.order_id}`);
            await clearCart();
        }
    };
    if (loading) return (<main className="min-h-screen flex justify-center items-center flex-col gap-5">
        <Loader2 className=" w-10 h-10 inline-block animate-spin mr-2" size={16}/>
        <p>Processing your Order...</p>
    </main>)
    return (
        <main className="min-h-screen flex flex-col md:flex-row">

            {/* Left: Shipping Form */}
            <section className="w-full md:w-2/3 border-r border-gray-100 p-8 md:p-12">


                <span className={'flex justify-start mb-8 gap-3 items-end'}>
                <h2 className="text-lg font-semibold self-end">Shipping Information</h2>
                        <span className={'text-sm self-end'}> Make it easier and <Link
                            href={'/login'} className={'text-teal-950 font-semibold'}>Login Here!</Link> </span>
             </span>

                {/* Delivery / Pickup Toggle */}

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full name

                        <input
                            {...register('guest_name', {required: 'Full name is required'})}
                            type="text"
                            placeholder="Enter full name"
                            className="w-full border border-gray-200 rounded-md px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                        {errors.guest_name && (
                            <p className="text-sm text-red-600 mt-1">{errors.guest_name.message as any}</p>
                        )}
                    </label>


                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                        <input
                            {...register('guest_email', {
                                required: 'Email is required',
                                pattern: {value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email'}
                            })}
                            type="email"
                            placeholder="Enter email address"
                            className="w-full border border-gray-200 rounded-md px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                        {errors.guest_email && (
                            <p className="text-sm text-red-600 mt-1">{errors.guest_email.message as any}</p>
                        )}
                    </label>


                    <div className={'flex justify-between gap-3'}>

                        <label className="block text-sm font-medium flex-grow text-gray-700 mb-1">
                            Phone number

                            <input
                                {...register('guest_phone', {
                                    required: 'Phone number is required',
                                    minLength: {value: 6, message: 'Enter a valid phone'}
                                })}
                                type="tel"
                                placeholder="Enter phone number"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                            {errors.guest_phone && (
                                <p className="text-sm text-red-600 mt-1">{errors.guest_phone.message as any}</p>
                            )}
                        </label>


                        <label className="block text-sm font-medium flex-grow text-gray-700 mb-1">
                            Alternative Phone number

                            <input
                                {...register('guest_phone2')}
                                type="tel"
                                placeholder="Enter Another phone number"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                            /> </label>

                    </div>

                    <div className={'flex justify-between gap-3'}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex-grow">
                            Address
                            <input
                                {...register('guest_address.address', {required: 'Address is required'})}
                                type="text"
                                placeholder="Enter Your Address"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                            {errors.guest_address?.message && (
                                <p className="text-sm text-red-600 mt-1">{errors.guest_address?.message as any}</p>
                            )}
                        </label>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Governorate

                            <select
                                {...register('guest_address.governorate_slug')}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                onChange={(e) => {
                                    const gov = governorates.find(gov => gov.slug === e.target.value) || null;
                                    setSelectedGovernorate(gov);
                                }}>
                                <option value={''}>Choose governorate</option>
                                {governorates.map((gov) => (
                                    <option key={gov.slug} value={gov.slug}>{gov.name_en}</option>
                                ))}

                            </select>
                            {errors.guest_address?.message && (
                                <p className="text-sm text-red-600 mt-1">{errors.guest_address?.message as any}</p>
                            )}
                        </label>
                    </div>


                    <h2 className="text-lg font-semibold self-end">Payment Summary</h2>
                    <div className="flex items-center gap-8 mt-4 ">
                        <label className={'flex items-center gap-2'}>
                            <input
                                type="radio"
                                id={`cod`}
                                value={'Cash on Delivery'}
                                checked={selectedPayment === 'cod'}
                                onChange={() => setSelectedPayment('cod')}
                            />
                            Cash on Delivery
                        </label>
                        <label className={'flex items-center gap-2'}>
                            <input
                                type="radio"
                                id={`paymob`}
                                value={'Online Payment'}
                                checked={selectedPayment === 'paymob'}
                                onChange={() => setSelectedPayment('paymob')}
                            />
                            Online Payment
                        </label>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <input
                            {...register('termsAccepted', {required: 'You must accept the Terms and Conditions'})}
                            type="checkbox"
                            className="w-4 h-4 border-gray-300 rounded"
                        />
                        <p className="text-sm text-gray-600">
                            I have read and agree to the <span className="text-primary-600">Terms and Conditions</span>.
                        </p>
                        {errors.termsAccepted && (
                            <p className="text-sm text-red-600 mt-1">{errors.termsAccepted.message as any}</p>
                        )}
                    </div>
                </form>
            </section>

            {/* Right: Cart Summary */}
            <CheckoutCart selectedGovernorate={selectedGovernorate} onPurchase={async () => {
                // trigger form submission via react-hook-form
                await handleSubmit(onSubmit)();
            }}/>
        </main>
    );
}
