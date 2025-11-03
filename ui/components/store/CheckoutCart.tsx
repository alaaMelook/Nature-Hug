import Image from "next/image";
import {useCart} from "@/ui/providers/CartProvider";
import {useState} from "react";
import {Governorate} from "@/domain/entities/database/governorate";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";

export function CheckoutCart({selectedGovernorate, onDiscountApplied, onPurchase}: {
    selectedGovernorate: Governorate | null,
    onDiscountApplied?: (code: string) => void,
    onPurchase: () => void
}) {
    const {cart: items, getCartTotal, getCartNetTotal, totalDiscount} = useCart()
    const [promoCode, setPromoCode] = useState<string>('');
    return (
        <section className=" w-full md:w-1/3 p-4 md:p-6 h-screen space-y-10">
            <Link href={'/cart'}
                  className="flex items-center gap-2 text-gray-600 font-semibold hover:text-gray-800 mb-5">
                <ArrowLeft/>

                <span className="text-sm font-medium ml-5">Back to Cart</span>
            </Link>

            <h2 className="text-lg font-semibold mb-6">Review your cart</h2>

            {/* Cart Items */}
            <div className="space-y-5 mb-10 auto-scroll px-3 pr-10 max-h-5/12 overflow-y-auto">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image
                                className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center text-2xl"
                                src={item.image} alt={item.slug}
                                width={56} height={56}
                            >
                            </Image>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                <p className="text-xs text-gray-500">1x</p>
                            </div>
                        </div>
                        <div>

                            <p className={`text-sm font-semibold text-gray-700 ${item.totalDiscount && item.totalDiscount > 0 ? 'line-through' : ''}`}>{item.price.toFixed(2)} EGP</p>
                            {item.totalDiscount && item.totalDiscount > 0 && (
                                <p className="text-sm font-semibold text-gray-700">{(item.price - item.discount).toFixed(2)} EGP</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Promo Code */}
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden mb-6">
                <input
                    onChange={(e) => setPromoCode(e.target.value)}
                    type="text"
                    placeholder="Promo Code"
                    className="flex-1 px-3 py-2 outline-none text-sm"
                />
                <button
                    className="px-4 py-2 text-primary-600 font-medium hover:bg-primary-50"
                    onClick={() => {
                        onDiscountApplied?.(promoCode)
                    }}
                >
                    Apply
                </button>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm mb-6 self-end">
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{getCartTotal()} EGP</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span
                        className="font-medium">{selectedGovernorate ? `${selectedGovernorate.fees} EGP` : 'Select a Governorate'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span
                        className={`font-bold ${totalDiscount > 0 ? "text-red-500" : ''}`}>{totalDiscount > 0 ? `- ${totalDiscount} EGP` : `${totalDiscount} EGP`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{getCartNetTotal() + (selectedGovernorate?.fees ?? 0)} EGP</span>
                </div>
            </div>

            {/* Pay Button */}
            <button
                onClick={onPurchase}
                className="w-full py-3 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 transition self-end">
                Pay Now
            </button>

        </section>
    );
}