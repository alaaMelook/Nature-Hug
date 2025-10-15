'use client';

import { useState, useCallback } from "react";
import BuyNowButton from "../components/(shop)/BuyNowButton";
import AddToCartButton from "../components/(shop)/CartButton";
import CollapsibleText from "../components/(shop)/CollapsibleText";
import Counter from "../components/(shop)/Counter";
import ImageCarousel from "../components/(shop)/ImageCarousel"; // Assuming you'll create this component
import { useTranslation } from "../../providers/TranslationProvider";
import { Info, CheckCircle, ShoppingBag, Minus, Star } from "lucide-react";
import { CollapsibleSection } from "../components/(shop)/CollapsibleSection";
import { StarRating } from "../components/(shop)/StarRating";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";

export default function ProductDetail({ product }: { product: ProductDetailView | null }) {
    const { language } = useTranslation();
    const [activeSection, setActiveSection] = useState<String | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    const toggleSection = useCallback((id: String) => {
        if (activeSection == id) {
            setActiveSection(null);
            return;
        }
        setActiveSection(id);
    }, [activeSection]);

    if (!product) {
        return <div className="p-6 text-center text-red-600">Product not found.</div>;
    }

    // Placeholder images for the carousel


    const sections = [
        {
            id: 'description',
            title: 'Full Description',
            content: product.description,
            icon: Info,
        },
        {
            id: 'ingredients',
            title: 'Materials/Ingredients',
            content: product.materials && product.materials.length > 0
                ? product.materials.map((material, index) => <p key={index}>{`${material.grams_used}g of ${material.material_name}`}</p>)
                : <p>No materials listed.</p>,
            icon: CheckCircle,
        },
        {
            id: 'bestfor',
            title: 'Best For',
            content: product.highlight,
            icon: ShoppingBag,
        },
        {
            id: 'precautions',
            title: 'Precautions',
            content: product.description,
            icon: Minus,
        },
        {
            id: 'reviews',
            title: `Customer Reviews`,
            icon: Star,
            content: (
                product.reviews.length > 0 ? (
                    product.reviews.map(review => (
                        <div key={review.id} className="p-4 mb-3 border border-gray-100 rounded-lg bg-primary-50 shadow-sm">
                            <StarRating rating={review.rating} />
                            <p className="font-semibold text-primary-800 mt-1">{review.customer_name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {review.comment}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet. Be the first!</p>
                )
            ),
        },
    ];
    console.log(product.materials?.length);
    return (
        <div className={`flex flex-col items-center px-6 p-4 w-full bg-white font-sans`}>
            <div className={`lg:flex lg:space-x-8 max-w-7xl w-full`}>

                {/* Image Section */}
                <div className="lg:w-1/2 flex flex-col items-center mb-6 lg:mb-0 p-4">
                    <div className="w-full max-w-md h-96 relative">
                        <ImageCarousel images={[product.image ?? '', ...(product.gallery || [])]} />
                    </div>
                    {/* Thumbnail navigation could go here if product had multiple images */}
                </div>


                <div className="lg:w-1/2 flex flex-col justify-start">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-primary-800 mb-2 leading-tight">
                        {product.name}
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

                        {/* Text and Actions Section */}

                    </div>
                </div >
            </div>
        </div>
    );
}