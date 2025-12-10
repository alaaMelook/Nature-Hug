'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImageAction, deleteImageAction } from '@/ui/hooks/admin/gallery';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type ImageItem = {
    url: string;
    image: { name: string };
    status: 'complete' | 'uploading' | 'error';
    tempId?: string;
};

export function GalleryScreen({ images }: { images: { image: any, url: string }[] }) {
    const { t } = useTranslation();
    const [localImages, setLocalImages] = useState<ImageItem[]>(images.map(img => ({ ...img, status: 'complete' })));
    const [isUploading, setIsUploading] = useState(false);
    const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const filesArray = Array.from(files);

        // optimistic update
        const optimisticImages: ImageItem[] = filesArray.map(file => ({
            url: URL.createObjectURL(file), // Create a temporary URL for preview
            image: { name: file.name },
            status: 'uploading',
            tempId: Math.random().toString(36).substr(2, 9)
        }));

        setLocalImages(prev => [...optimisticImages, ...prev]);

        let successCount = 0;

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            const optimisticId = optimisticImages[i].tempId;
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadImageAction(formData);

            if (result.success && result.url) {
                // Update the specific image status to complete and set the real URL
                setLocalImages(prev => prev.map(img =>
                    img.tempId === optimisticId
                        ? { ...img, url: result.url, status: 'complete', tempId: undefined }
                        : img
                ));
                successCount++;
            } else {
                // Mark as error
                setLocalImages(prev => prev.map(img =>
                    img.tempId === optimisticId
                        ? { ...img, status: 'error' }
                        : img
                ));
                toast.error(t('errorUploadingImage') + `: ${file.name}`);
            }
        }

        if (successCount === filesArray.length) {
            toast.success(t('imageUploaded'));
        } else if (successCount > 0) {
            toast.warning(t('someImagesFailedToUpload'));
        }

        e.target.value = '';
        setIsUploading(false);
    };

    const handleDelete = async (e: React.MouseEvent, url: string, imageName: string) => {
        e.preventDefault();
        if (!confirm(t('confirmDeleteImage'))) return;

        setDeletingUrl(url);

        const result = await deleteImageAction(imageName);
        if (result.success) {
            setLocalImages(localImages.filter(img => img.url !== url));
            toast.success(t('imageDeleted'));
        } else {
            toast.error(t('errorDeletingImage'));
        }
        setDeletingUrl(null);
    };

    const handleRemoveFailed = (tempId: string) => {
        setLocalImages(localImages.filter(img => img.tempId !== tempId));
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex"
        >
            <div className="p-6 flex-1">
                <h1 className="text-2xl font-semibold mb-4">{t('gallery')}</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                    {/* Upload Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                    >
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleUpload}
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <div className="flex flex-col items-center justify-center">
                                <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                                <span className="text-sm text-gray-500">{t('uploading')}...</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="text-gray-400 mb-2" size={32} />
                                <span className="text-sm text-gray-500">{t('uploadNewImage')}</span>
                            </>
                        )}
                    </motion.div>

                    {/* Images */}
                    <AnimatePresence>
                        {localImages.map((img, index) => (
                            <motion.div
                                key={img.url + index} // Use composite key for uniqueness during rapid local updates
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 aspect-square border border-gray-100 bg-white"
                            >
                                <Image
                                    src={img.url}
                                    alt={img.image.name}
                                    className={`w-full h-full object-cover ${img.status === 'uploading' ? 'opacity-50 blur-[1px]' : ''}`}
                                />
                                {img.status === 'uploading' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-blue-600" size={24} />
                                    </div>
                                )}

                                {img.status === 'error' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/80 p-2 text-center">
                                        <span className="text-red-500 font-semibold text-xs mb-1">{t('failed')}</span>
                                        <button
                                            onClick={() => handleRemoveFailed(img.tempId!)}
                                            className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded shadow-sm hover:bg-red-50"
                                        >
                                            {t('dismiss')}
                                        </button>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                {img.status === 'complete' && (
                                    <button
                                        onClick={(e) => handleDelete(e, img.url, img.image.name)}
                                        disabled={deletingUrl === img.url}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                        title={t('deleteImage')}
                                    >
                                        {deletingUrl === img.url ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                    </button>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-xs text-white truncate px-1">{img.image.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}