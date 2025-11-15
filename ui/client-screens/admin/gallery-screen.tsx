export function GalleryScreen({ images }: { images: { image: any, url: string }[] }) {
    return (
        <div className="flex">
            <div className="p-6 flex-1">
                <h1 className="text-2xl font-semibold mb-4">Gallery</h1>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {images.length === 0 ? (
                        <div className="text-gray-500">No images uploaded yet.</div>
                    ) : images.map(img => (
                        <div key={img.image.name} className="rounded p-2 shadow-sm hover:shadow-2xl transition-shadow duration-100">
                            <img src={img.url} alt={img.image.name} className="w-full h-100 object-cover rounded" />
                            <div className="mt-2 text-xs text-gray-600 truncate">{img.image.name}</div>
                        </div>

                    ))}
                </div>
            </div>
        </div>
    );
}