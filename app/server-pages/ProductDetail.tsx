'use client';

import { useState } from "react";
import BuyNowButton from "../components/BuyNowButton";
import AddToCartButton from "../components/CartButton";
import CollapsibleText from "../components/CollapsibleText";
import Counter from "../components/Counter";
import { useTranslation } from "../components/TranslationProvider";

export default function ProductDetail({ product }: { product: Product | null }) {
    const { language } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    if (!product) {
        return <div className="p-6 text-center text-red-600">Product not found.</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-primary-50 font-sans">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-6 md:p-10 w-full max-w-4xl">
                {/* Product Details Layout: Image on one side, text/actions on the other */}
                <div className="md:flex md:space-x-8 rtl:space-x-reverse">

                    {/* Image Section */}
                    <div className="md:w-1/2 flex justify-center items-center mb-6 md:mb-0">
                        <img
                            src={product.image_url || 'https://placehold.co/600x600/94A3B8/ffffff?text=Image+Missing'}
                            alt={product.name_english}
                            className="w-full max-w-xs h-auto object-cover rounded-xl shadow-xl transition-transform duration-300 hover:scale-[1.02]"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/94A3B8/ffffff?text=Image+Missing'; }}
                        />
                    </div>

                    {/* Text and Actions Section */}
                    <div className="md:w-1/2 flex flex-col justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-indigo-800 mb-2 leading-tight">
                                {language === 'ar' ? product.name_arabic : product.name_english}
                            </h1>

                            <hr className="my-4 border-t border-gray-200" />

                            {/* Descriptions */}
                            <CollapsibleText text={language === 'ar' ? product.description_arabic : product.description_english} limit={200} />


                        </div>

                        {/* Price and Stock */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between py-3 mb-6">
                                <p className="text-4xl font-black text-green-600">
                                    {product.price.toLocaleString()} EGP
                                </p>
                                <span className={`text-sm font-semibold px-4 py-1.5 rounded-full shadow-inner ${product.stock > 5 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {product.stock > 0 ? `${product.stock} in Stock` : 'Out of Stock'}
                                </span>
                            </div>

                            {/* Actions (Quantity and Cart) - This replaces the 'أزرار الشراء' comment */}
                            <div className="flex flex-col sm:flex-row gap-4">

                                {/* Quantity Control */}
                                <Counter quantity={quantity} onIncrease={product.stock === quantity ? () => { } : function () { setQuantity(quantity + 1) }} onDecrease={function () { setQuantity(quantity - 1) }} />

                                <AddToCartButton product={product} />
                                <BuyNowButton product={product} />
                            </div>

                            {/* Cart Message / Notification */}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};