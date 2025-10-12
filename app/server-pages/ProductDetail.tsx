'use client';

import { useState } from "react";
import BuyNowButton from "../components/BuyNowButton";
import AddToCartButton from "../components/CartButton";
import CollapsibleText from "../components/CollapsibleText";
import Counter from "../components/Counter";
import { useTranslation } from "../components/TranslationProvider";
import { Info, CheckCircle, ShoppingBag, Minus, Star } from "lucide-react";
import { CollapsibleSection } from "../components/CollapsibleSection";
import { StarRating } from "../components/StarRating";

export default function ProductDetail({ product }: { product: Product | null }) {
    const { language } = useTranslation();
    const [activeSection, setActiveSection] = useState<String>('description');
    const [quantity, setQuantity] = useState<number>(1);
    const toggleSection = (id: String) => {
        setActiveSection(id);
    }

    if (!product) {
        return <div className="p-6 text-center text-red-600">Product not found.</div>;
    }
    const sections = [
        {
            id: 'description',
            title: 'Full Description',
            content: product.description_english,
            icon: Info,
        },
        {
            id: 'ingredients',
            title: 'Materials/Ingredients',
            content: product.materials?.forEach((material) => { `${material.grams_used} of ${material.material.name}` }),
            icon: CheckCircle,
        },
        {
            id: 'bestfor',
            title: 'Best For',
            content: product.meta_description,
            icon: ShoppingBag,
        },
        {
            id: 'precautions',
            title: 'Precautions',
            content: product.description_english,
            icon: Minus,
        },
        {
            id: 'reviews',
            title: `Customer Reviews`,
            icon: Star,
            content: (
                // product.reviews.length > 0 ? (
                //     product.reviews.map(review => (
                //         <div key={review.id} className="p-4 mb-3 border border-gray-100 rounded-lg bg-primary-50 shadow-sm">
                //             <StarRating rating={review.rating} />
                //             <p className="font-semibold text-primary-800 mt-1">{review.user}</p>
                //             <p className="text-sm text-gray-600 mt-1">
                //                 {review.comment_en}
                //             </p>
                //         </div>
                //     ))
                // ) : (
                <p>No reviews yet. Be the first!</p>
                // )
            ),
        },
    ];
    return (
        <div className={`flex items-center p-4 md:p-8 bg-white font-sans`}>
            <div className={`lg:flex lg:space-x-8`}>

                {/* Image Section */}
                <div className="lg:w-1/2 flex justify-center items-center mb-6 lg:mb-0 p-4">
                    <img
                        src={product.image_url || 'https://placehold.co/600x600/94A3B8/ffffff?text=Image+Missing'}
                        alt={product.name_english}
                        className="w-full max-w-md h-auto object-cover rounded-3xl shadow-xl border border-gray-200 transition-transform duration-300 hover:scale-[1.02]"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/94A3B8/ffffff?text=Image+Missing'; }}
                    />
                </div>

                {/* Text and Actions Section */}
                <div className="lg:w-1/2 flex flex-col justify-start">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-primary-800 mb-2 leading-tight">
                        {product.name_english}
                    </h1>

                    <div className="my-3 flex items-center gap-2">
                        <StarRating rating={Number(3)} />
                        <span className="text-lg font-semibold text-primary-600">{3}</span>
                        <span className="text-sm text-gray-500">
                            {/* {`(Based on ${product.reviews.length} reviews)`} */}
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {sections.map(section => (
                            <CollapsibleSection
                                key={section.id}
                                id={section.id}
                                title={section.title}
                                content={section.content}
                                icon={section.icon}
                                isOpen={activeSection === section.id} // Controlled state
                                onToggle={toggleSection} // Controlled handler
                            />
                        ))}
                    </div>


                    {/* Price and Stock */}
                    <div className="pt-4">
                        <div className="flex items-center justify-between py-3 mb-6">
                            {/* Price color changed to primary-800 */}
                            <p className="text-4xl font-black text-primary-800">
                                {product.price.toLocaleString()} EGP
                            </p>
                            <span className={`text-sm font-semibold px-4 py-1.5 rounded-full  ${product.stock > 3 ? '' :
                                product.stock > 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-md' :
                                    'bg-red-100 text-red-700 border border-red-200 shadow-md'
                                }`}>
                                {product.stock === 0 ? 'Out of Stock' : product.stock > 3 ? null : `Only ${product.stock} left in stock!`}
                            </span>
                        </div>

                        {/* Actions (Quantity and Cart) */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between text-gray-700">
                                <span className="text-lg font-medium">Quantity:</span>
                                <Counter
                                    quantity={quantity}
                                    onIncrease={() => setQuantity(quantity + 1)}
                                    onDecrease={() => setQuantity(quantity - 1)}
                                />
                                {quantity === product.stock && <p className='text-sm text-red-500 font-medium'>Max available.</p>}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                <AddToCartButton product={product} quantity={quantity} />
                                <BuyNowButton product={product} quantity={quantity} />
                            </div>
                            {product.stock === 0 && (
                                <div className="text-center text-red-600 font-semibold mt-2 p-2 bg-red-50 rounded-lg">
                                    This item is currently out of stock.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM SECTION: COLLAPSIBLE DETAILS (EXCLUSIVE ACCORDION) --- */}

        </div >
    );
};