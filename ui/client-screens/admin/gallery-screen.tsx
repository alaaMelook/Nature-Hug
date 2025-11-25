'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { uploadImageAction, deleteImageAction } from '@/app/actions/admin/gallery';
import { toast } from 'sonner';

export function GalleryScreen({ images }: { images: { image: any, url: string }[] }) {
    const { t } = useTranslation();
    const [localImages, setLocalImages] = useState(images);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

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

    return (
        <div className="flex">
            <div className="p-6 flex-1">
                <h1 className="text-2xl font-semibold mb-4">{t('gallery')}</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                    {/* Upload Button */}
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white">
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
                        <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 aspect-square border border-gray-100 bg-white">
                            <img
                                src={img.url}
                                alt={img.image.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

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

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-white truncate px-1">{img.image.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}