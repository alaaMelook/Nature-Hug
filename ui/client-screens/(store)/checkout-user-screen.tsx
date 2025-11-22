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
import { Loader2 } from "lucide-react";


type FormValues = Partial<Order> & {
    termsAccepted?: boolean;
};

export function CheckoutUserScreen({ governorates, user }: { governorates: Governorate[], user: ProfileView }) {
    // default governorate is the first saved address governorate if exists
    const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(user?.address?.[0]?.governorate ?? null);
    // index of selected saved address, or 'new' to create another
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | 'new'>(user?.address && user.address.length > 0 ? 0 : 'new');
    const { cart, loading: fetching, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'cod' | 'paymob'>('cod');
    const { register, handleSubmit, formState: { errors }, setValue, setError } = useForm<FormValues>({
        defaultValues: {
            guest_address: {}
        }
    });
    const router = useRouter();


    console.log('cart length ,' + cart.items.length)
    useEffect(() => {
        if (!fetching && cart.items.length === 0) {
            // Only redirect if not currently submitting an order
            if (!loading) {
                router.push('/'); // ✅ safe here
            }
        }
    }, [cart, router, fetching, loading]);


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
            setError('guest_address', { type: 'manual', message: 'Please select a governorate.' } as any);
            toast.error('Please select a governorate.');
            return;
        }

        if (!data.termsAccepted) {
            setError('termsAccepted', { type: 'manual', message: 'You must accept the Terms and Conditions.' });
            toast.error('You must accept the Terms and Conditions.');
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
            shipping_total: selectedGovernorate?.fees ?? 0,
            tax_total: 0.00,
            payment_method: selectedPayment === 'cod' ? 'Cash on Delivery' : 'unpaid',
            grand_total: getCartTotal(selectedGovernorate?.fees ?? 0),
        };
        // const result = await createOrder(payload, cart);
        // if (result.error) {
        //     toast.error(result.error);
        //     setLoading(false);
        //     return;
        // } else if (result.order_id) {
        //     toast.success('Order created successfully!');
        //     // navigate first, then clear the cart to avoid in-place redirect from cart-empty watchers
        //     router.push(`/orders/${result.order_id}`);
        //     await clearCart();

        // }
    };
    if (loading) return (<main className="min-h-screen flex justify-center items-center flex-col gap-5">
        <Loader2 className=" w-10 h-10 inline-block animate-spin mr-2" size={16} />
        <p>Processing your Order...</p>
    </main>)
    return (
        <main className="min-h-screen flex flex-col md:flex-row">

            {/* Left: Shipping Form */}
            <section className="w-full md:w-2/3 border-r border-gray-100 p-8 md:p-12">


                <span className={'flex justify-start mb-8 gap-3 items-end'}>
                    <h2 className="text-lg font-semibold self-end">Shipping Information</h2>
                </span>

                {/* If user has saved addresses show selector */}
                <label className="block text-sm font-medium text-gray-700 mb-4">
                    Choose saved address
                    <select
                        value={selectedAddressIndex === 'new' ? 'new' : String(selectedAddressIndex)}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'new') {
                                setSelectedAddressIndex('new');
                                // reset governorate to first available when switching to new
                                setSelectedGovernorate(governorates[0] ?? null);
                            } else {
                                const idx = Number(val);
                                setSelectedAddressIndex(idx);
                                const addrGov = user.address?.[idx]?.governorate;
                                setSelectedGovernorate(addrGov ?? null);
                            }
                        }}
                        className="w-full border border-gray-200 rounded-md px-3 py-2 outline-none mb-2"
                    >
                        {user.address?.map((a, i) => (
                            <option key={i} value={String(i)}>{a.address} - {a.governorate?.name_en}</option>
                        ))}
                        <option value={'new'}>Create another address</option>
                    </select>
                </label>


                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full name

                        <input
                            type="text"
                            readOnly
                            disabled={true}

                            value={user?.name ?? ''}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-200"
                        />

                    </label>


                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                        <input
                            type="email"
                            readOnly
                            disabled={true}
                            value={user?.email ?? ''}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-200"
                        />

                    </label>


                    <div className={'flex justify-between gap-3'}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                            {user.phone[0] === null || user.phone[0] === '' ?
                                (<>
                                    <input
                                        {...register('guest_phone', { required: 'Phone is required' })}
                                        type="text"
                                        onChange={(e) => setValue(
                                            'guest_phone',
                                            e.target.value
                                        )}
                                        placeholder="Primary Phone Number"
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 "
                                    />
                                    {errors.guest_phone?.message && (
                                        <p className="text-sm text-red-600 mt-1">{errors.guest_phone?.message as any}</p>
                                    )}
                                </>
                                ) : (
                                    <input
                                        type="text"
                                        readOnly
                                        disabled={true}
                                        value={user?.phone[0] ?? ''}
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-200"
                                    />
                                )}
                        </label>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alternative Phone Number
                            {user.phone.length < 2 || user.phone[1] === null || user.phone[1] === '' ?
                                (
                                    <input
                                        type="text"
                                        onChange={(e) => setValue(
                                            'guest_phone2',
                                            e.target.value
                                        )}
                                        placeholder="Alternative Phone Number"
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 "
                                    />

                                ) : (
                                    <input
                                        type="text"
                                        readOnly
                                        disabled={true}
                                        value={user?.phone[1] ?? ''}
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-200"
                                    />
                                )}
                        </label>
                    </div>

                    <div className={'flex justify-between gap-3'}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex-grow">
                            Address
                            {selectedAddressIndex === 'new' ? (
                                <>
                                    <input
                                        {...register('guest_address.address', { required: 'Address is required' })}
                                        type="text"
                                        onChange={(e) => setValue(
                                            'guest_address.address',
                                            e.target.value
                                        )}
                                        placeholder="Enter Your Address"
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 "
                                    />
                                    {errors.guest_address?.message && (
                                        <p className="text-sm text-red-600 mt-1">{errors.guest_address?.message as any}</p>
                                    )}
                                </>
                            ) : (
                                <input
                                    type="text"
                                    readOnly
                                    disabled={true}
                                    value={user?.address?.[selectedAddressIndex as number]?.address ?? ''}
                                    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-200"
                                />
                            )}
                        </label>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Governorate

                            {selectedAddressIndex === 'new' ? (
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
                            ) : (
                                <select
                                    value={user?.address?.[selectedAddressIndex as number]?.governorate?.slug ?? ''}
                                    disabled={true}
                                    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-200"
                                >
                                    <option
                                        value={user?.address?.[selectedAddressIndex as number]?.governorate?.slug ?? ''}>
                                        {user?.address?.[selectedAddressIndex as number]?.governorate?.name_en ?? '—'}
                                    </option>
                                </select>
                            )}
                            {errors.guest_address?.message && selectedAddressIndex === 'new' && (
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
                            {...register('termsAccepted', { required: 'You must accept the Terms and Conditions' })}
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
            }} />
        </main>
    );
}
