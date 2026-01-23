"use client"
import { useCallback, useEffect, useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import { useTranslation } from "react-i18next";
import BuyNowButton from "@/ui/components/store/BuyNowButton";
import AddToCartButton from "@/ui/components/store/CartButton";
import { CollapsibleSection } from "@/ui/components/store/CollapsibleSection";
import Counter from "@/ui/components/store/Counter";
import ImageCarousel from "@/ui/components/store/ImageCarousel";
import { StarRating } from "@/ui/components/store/StarRating";
import { CheckCircle, Info, Minus, ShoppingBag } from "lucide-react";
import { ReviewsSlider } from "@/ui/components/store/ReviewsSlider";
import Link from "next/link";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";
import { ProductView } from "@/domain/entities/views/shop/productView";
import SimilarProductsScroll from "@/ui/components/store/SimilarProductsScroll";
import { motion } from "framer-motion";
import { WishlistButton } from "@/ui/components/store/WishlistButton";


export function ProductDetailScreen({ initProduct: product, similarProducts = [] }: { initProduct: ProductDetailView | null, similarProducts?: ProductView[] }) {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState<String | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    // function
    const toggleSection = useCallback((id: String) => {
        setActiveSection(activeSection === id ? null : id);
    }, [activeSection]);

    const materials = product?.materials?.filter((material) => material.material_type === 'Chemicals');
    if (!product) {
        return <div className="p-6 text-center text-red-600">{t('productNotFound')}</div>;
    }
    console.log(product);
    const sections = []
    if (product.description) {
        sections.push({ id: 'description', title: t('fullDescription'), content: product.description, icon: Info });
    }
    if (product.faq?.best_for.length ?? 0 > 0) {
        sections.push({ id: 'bestfor', title: t('bestFor'), content: product.faq?.best_for, icon: ShoppingBag });
    }
    if (product.faq?.precautions.length ?? 0 > 0) {
        sections.push({ id: 'precautions', title: t('precautions'), content: product.faq?.precautions, icon: Minus });
    }
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`flex flex-col items-center w-full bg-white`}> {/* Changed bg-primary-10 to bg-white for a clean look */}
            <div
                className={`lg:flex lg:space-x-16 px-6 p-10 max-w-7xl w-full`}> {/* Increased horizontal space and padding */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="lg:w-1/2 flex flex-col items-center mb-6 lg:mb-0 p-4"
                >
                    <div className="w-full max-w-md h-96 relative">
                        <ImageCarousel images={[product.image ?? '', ...(product.gallery || [])]} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="lg:w-1/2 flex flex-col justify-start lg:pt-0 pt-8"
                > {/* Adjusted padding */}
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-1">{product.category_name?.toUpperCase()}</p> {/* Added category/type for style */}
                    <h1 className="text-4xl lg:text-5xl font-serif font-semibold text-primary-900 mb-2 leading-tight"> {/* Changed font and color to primary-900 */}
                        {product.name}
                    </h1>
                    <p className="text-gray-700">
                        {product.highlight}
                    </p>
                    <div className="mt-2 mb-4">
                        <span
                            className={`text-sm font-semibold px-4 py-1.5 rounded-full ${(product.stock ?? 0) === 0 ? 'bg-red-100 text-red-700' :
                                (product.stock ?? 0) <= 3 ? 'bg-yellow-100 text-yellow-700' :
                                    'text-green-700' // Default text for plenty of stock
                                }`}>
                            {(product.stock ?? 0) === 0 ? t('outOfStock') : (product.stock ?? 0) <= 3 ? `${t('only')} ${product.stock} ${t('leftInStock')}` : t('inStock')}
                        </span>
                    </div>
                    <div className="mb-8 border-t border-b border-gray-200 py-4"> {/* Added horizontal dividers */}
                        <div className="flex items-center gap-2">
                            <StarRating rating={product.avg_rating ?? 0} />
                            <span
                                className="text-lg font-semibold text-primary-600">{product.avg_rating?.toFixed(1) ?? 'N/A'}</span>
                            <span className="text-sm text-gray-500">
                                {`(${product.reviews?.length ?? 0} ${t('reviews')})`}
                            </span>
                        </div>
                    </div>

                    {/* Price and Variant Selection */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <p className="text-4xl font-extrabold text-primary-900">
                                {t("{{price, currency}}", { price: product.price * quantity })}
                            </p>
                            <WishlistButton
                                productId={product.product_id}
                                variantId={product.variant_id || null}
                                size={28}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full sm:w-1/2">
                            {product.variants?.map(variant => (
                                <Link
                                    aria-disabled={variant.slug === product.slug}
                                    key={variant.id}
                                    href={`/products/${variant.slug}`}
                                    className="w-full"
                                >
                                    <div
                                        className={`text-center text-xs font-medium px-4 py-2 rounded-full transition duration-200 ease-in-out cursor-pointer  ${variant.slug === product.slug ? 'bg-primary-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                                        {variant.type}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons - Moved for better flow */}
                    <div className="flex flex-col gap-4 mb-8">
                        <AddToCartButton
                            product={product}
                            quantity={quantity}
                        // className="w-full py-4 text-xl font-bold bg-primary-800 hover:bg-primary-900 text-white rounded-md shadow-lg transition duration-200" // Styled for "ADD TO BAG"
                        />
                        {product.stock > 0 && <BuyNowButton
                            product={product}
                            quantity={quantity}
                        // className="w-full py-4 text-xl font-bold bg-white hover:bg-gray-100 text-primary-800 border border-primary-800 rounded-md shadow-sm transition duration-200" // Styled for "BUY NOW"
                        />}
                    </div>

                    {/* Collapsible Sections (Features) */}
                    <div
                        className="divide-y divide-gray-200 border-t border-b border-gray-200"> {/* Added top and bottom borders */}
                        {sections.map(section => (
                            <CollapsibleSection
                                key={section.id}
                                id={section.id}
                                title={section.title}
                                content={section.content}
                                icon={section.icon}
                                isOpen={activeSection === section.id}
                                className={`${activeSection === section.id ? 'pb-5' : ''}`}
                                onToggleAction={toggleSection}
                            // iconColor="text-primary-800" // Styling for icons
                            // titleClass="font-semibold text-primary-800 uppercase text-sm tracking-widest" // Styling for titles
                            />
                        ))}
                    </div>

                    {/* Stock Info - Moved to a less prominent location */}


                </motion.div>
            </div>

            {/* Reviews Section - Dark Background */}
            <div
                className='w-full h-full py-16 bg-primary-600 text-white flex-col items-center justify-center'> {/* Used primary-950 and white text */}
                <h2 className="font-bold text-center text-4xl mb-10">
                    {t('reviews').toUpperCase()}
                </h2>
                <div className="w-full mx-auto px-6">
                    <ReviewsSlider product={product} />
                </div>
            </div>

            {/* Similar Products Section */}
            {similarProducts.length > 0 && (
                <div className="w-full py-10 bg-gray-50 flex flex-col ">
                    <h2 className="font-bold text-start text-3xl mb-8 text-primary-900 mx-15">
                        {t('youMightAlsoLike')}
                    </h2>
                    <div className="w-full px-10 scrollbar-hide">
                        <SimilarProductsScroll products={similarProducts} />
                    </div>
                </div>
            )}

            {/* Fixed Bottom Bar - Made it wider and changed background */}
            <div className="w-full fixed bottom-0 left-0 bg-white border-t border-gray-200 shadow-xl z-20">
                <div className={"flex items-center justify-between text-gray-700 px-5 py-4 w-full"}>

                    <div className="flex items-center gap-5 flex-row">
                        <span className="text-lg font-medium hidden sm:block">{t('quantity')}:</span>
                        <Counter
                            quantity={quantity}
                            onIncrease={() => setQuantity(q => Math.min(q + 1, product.stock ?? 1))}
                            onDecrease={() => setQuantity(q => Math.max(q - 1, 1))}
                        />
                    </div>

                    <div className="flex gap-4 sm:w-1/2 w-3/4 ml-2"> {/* Grouped action buttons */}
                        <AddToCartButton
                            product={product}
                            quantity={quantity}
                        // className="px-8 py-3 bg-primary-800 hover:bg-primary-900 text-white rounded-full transition duration-200 font-semibold"
                        />
                        {product.stock > 0 && <BuyNowButton
                            product={product}
                            quantity={quantity}
                        // className="px-8 py-3 bg-white hover:bg-gray-100 text-primary-800 border border-primary-800 rounded-full transition duration-200 font-semibold"
                        />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ProductDetailSkeleton() {
    return (
        <div className="flex flex-col items-center px-6 p-10 w-full bg-white font-sans animate-pulse">
            <div className="lg:flex lg:space-x-16 max-w-7xl w-full">
                {/* Image Section Skeleton */}
                <div className="lg:w-1/2 flex flex-col items-center mb-6 lg:mb-0 p-4">
                    <Skeleton variant="rounded" width="100%" height={384} className="max-w-md" />
                </div>

                {/* Details Section Skeleton */}
                <div className="lg:w-1/2 flex flex-col justify-start pt-4 lg:pt-0">
                    <Skeleton variant="text" width="20%" height={20} className="mb-2" /> {/* For PERFUME label */}
                    <Skeleton variant="text" width="80%" height={60} />
                    <Skeleton variant="text" width="60%" height={20}
                        className="my-2" /> {/* For highlight/short description */}

                    {/* Price and Variants Skeleton */}
                    <div className="flex items-center justify-between py-4 mb-8 border-t border-b border-gray-200">
                        <Skeleton variant="text" width="30%" height={50} />
                        <div className="flex gap-2">
                            <Skeleton variant="rounded" width={80} height={30} />
                            <Skeleton variant="rounded" width={80} height={30} />
                        </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <Skeleton variant="rounded" width="100%" height={56} />
                        <Skeleton variant="rounded" width="100%" height={56} />
                    </div>

                    {/* Collapsible Sections Skeleton */}
                    <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="py-4">
                                <Skeleton variant="text" width="60%" height={24} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Bar Skeleton */}
            <div className="w-full fixed bottom-0 left-0 bg-white border-t border-gray-200 shadow-xl z-20">
                <div className="flex items-center justify-center py-4 max-w-7xl mx-auto">
                    <Skeleton variant="text" width="10%" height={24} className="mr-10 hidden sm:block" />
                    <Skeleton variant="rounded" width={100} height={40} />
                    <div className="flex gap-4 ml-10">
                        <Skeleton variant="rounded" width={150} height={48} />
                        <Skeleton variant="rounded" width={150} height={48} />
                    </div>
                </div>
            </div>
        </div>
    );
}