import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const ImageCarousel = ({ images }: { images: (string | null)[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    const prevSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    return (
        <div className="flex-grow flex-shrink rounded-xl group flex flex-col sm:flex-row gap-x-4">
            {/* Thumbnails (Left Side - now top for mobile) */}
            <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto  sm:overflow-y-auto w-full sm:w-20 pb-1 sm:pb-0">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`relative sm:w-20 sm:h-20 w-15 h-15 rounded-lg overflow-hidden border-2 transition duration-300 ${index === activeIndex
                            ? 'border-primary-600 shadow-sm'
                            : 'border-transparent hover:border-primary-300 '
                            } flex-shrink-0`}
                    >
                        <Image
                            src={images[index] || 'https://placehold.co/80x80/white/ffffff?text=?'}
                            alt={`Thumbnail ${index + 1}`}
                            className="object-cover w-full h-full"
                            onError={(e) =>
                            (e.currentTarget.src =
                                'https://placehold.co/80x80/94A3B8/ffffff?text=?')
                            }
                            fill={true}
                        />
                        {index !== activeIndex && <div className="absolute inset-0 transition duration-600 bg-gray-300/70  flex-shrink-0 hover:bg-gray-300/40"></div>}
                    </button>
                ))}
            </div>

            {/* Main Image and Pagination (Right Column - now main area) */}
            <div className="sm:relative flex-1 h-full w-full rounded-xl overflow-hidden  flex flex-col">
                <div className="relative w-full h-90 rounded-xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }} >
                            <Image
                                src={images[activeIndex] || 'https://placehold.co/600x600/94A3B8/ffffff?text=?'}
                                alt={`Product view ${activeIndex + 1}`}
                                className="w-full h-full object-contain rounded-xl"
                                onError={(e) =>
                                (e.currentTarget.src =
                                    'https://placehold.co/600x600/94A3B8/ffffff?text=Image+Missing')
                                }
                                fill={true}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* --- Pagination (Dots or Page Numbers) --- */}
                <div className="mt-6 mb-3 flex justify-center items-center gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`sm:w-3 sm:h-3 w-1 h-1 rounded-full transition-colors duration-600 ${index === activeIndex
                                ? 'bg-primary-600 scale-110'
                                : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageCarousel;
