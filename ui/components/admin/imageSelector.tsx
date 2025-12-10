'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Upload, Trash2, Loader2, RefreshCwIcon } from 'lucide-react';
import { uploadImageAction, deleteImageAction, getImagesAction } from '@/ui/hooks/admin/gallery';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface ImageSelectorProps {
    images: { image: any; url: string }[];
    onSelect: (url: string) => void;
    selectedUrl?: string;
    onClose: () => void;
}

export function ImageSelector({ images, onSelect, selectedUrl, onClose }: ImageSelectorProps) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<string | undefined>(selectedUrl);
    const [localImages, setLocalImages] = useState(images);
    const [refreshing, setRefreshing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

    const handleSelect = (url: string) => {
        setSelected(url);
    };

    const handleConfirm = () => {
        if (selected) {
            onSelect(selected);
            onClose();
        }
    };
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadImageAction(formData);
        if (result.success && result.url) {
            setLocalImages([{ image: { name: file.name }, url: result.url }, ...localImages]);
            toast.success(t('imageUploaded'));
        } else {
            toast.error(t('errorUploadingImage'));
        }
        setIsUploading(false);
    };
    const refreshImages = async () => {
        setRefreshing(true);
        const result = await getImagesAction();
        if (result.success) {
            setLocalImages(result.images);
            setRefreshing(false);
        }
        else {
            toast.error(t('errorRefreshingImages'));
            setRefreshing(false);
        }
    };
    const handleDelete = async (e: React.MouseEvent, url: string, imageName: string) => {
        e.stopPropagation();
        if (!confirm(t('confirmDeleteImage'))) return;

        setDeletingUrl(url);
        // Extract filename from URL if needed, or use the image object's name property if available
        // Assuming the repository needs the filename. 
        // If the 'image' object has the name, use it.
        // Based on GetAllImages use case, 'image' is the object from storage list.

        const result = await deleteImageAction(imageName);
        if (result.success) {
            setLocalImages(localImages.filter(img => img.url !== url));
            if (selected === url) setSelected(undefined);
            toast.success(t('imageDeleted'));
        } else {
            toast.error(t('errorDeletingImage'));
        }
        setDeletingUrl(null);
    };
    useEffect(() => {
        if (localImages.length === 0) refreshImages();
    }, []);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{t('selectFromGallery')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {/* Upload Button */}
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleUpload}
                                disabled={isUploading}
                            />
                            {isUploading ? (
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            ) : (
                                <>
                                    <Upload className="text-gray-400 mb-2" size={32} />
                                    <span className="text-sm text-gray-500">{t('uploadNewImage')}</span>
                                </>
                            )}
                        </div>

                        {/* Images */}
                        {localImages.map((img, index) => (
                            <div
                                key={index}
                                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden aspect-square group ${selected === img.url ? 'border-blue-500' : 'border-transparent'}`}
                                onClick={() => handleSelect(img.url)}
                            >
                                <Image
                                    src={img.url}
                                    alt={`Gallery image ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                {selected === img.url && (
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 z-10">
                                        <CheckCircle size={16} />
                                    </div>
                                )}
                                <button
                                    onClick={(e) => handleDelete(e, img.url, img.image.name)}
                                    disabled={deletingUrl === img.url}
                                    className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                                    title={t('deleteImage')}
                                >
                                    {deletingUrl === img.url ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 flex justify-between ">
                    <button
                        onClick={refreshImages}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    > <AnimatePresence>
                            {/* 1. Conditionally render the spinner when 'refreshing' is true */}
                            {refreshing ? (
                                <motion.div
                                    key="spinner-icon" // Required key for AnimatePresence

                                    // Defines the initial state (when mounting)
                                    initial={{ rotate: 0 }}

                                    // Defines the continuous, rotating animation
                                    animate={{
                                        rotate: 360, // Target rotation
                                        transition: {
                                            // Rotation transition settings:
                                            repeat: Infinity,
                                            ease: "linear",
                                            duration: 1.0,
                                        },
                                    }}

                                    // Defines the exit animation (when 'refreshing' becomes false)
                                    exit={{
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <RefreshCwIcon size={20} />
                                </motion.div>
                            ) : <RefreshCwIcon size={20} />}
                        </AnimatePresence>
                    </button>

                    <div className="p-4 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selected}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {t('selectImage')}
                        </button>
                    </div> </div>
            </div>
        </div>
    );
}
