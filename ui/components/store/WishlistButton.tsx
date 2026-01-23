'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface WishlistButtonProps {
    productId: number;
    variantId?: number | null;  // Optional variant ID
    className?: string;
    size?: number;
}

export function WishlistButton({ productId, variantId, className = '', size = 20 }: WishlistButtonProps) {
    const [inWishlist, setInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    console.log('[WishlistButton] Rendered with productId:', productId, 'variantId:', variantId);

    // Check if in wishlist on mount
    useEffect(() => {
        const checkWishlist = async () => {
            try {
                let url = `/api/wishlist/check?product_id=${productId}`;
                if (variantId) {
                    url += `&variant_id=${variantId}`;
                }
                const res = await fetch(url);
                const data = await res.json();
                setInWishlist(data.inWishlist);
            } catch (error) {
                console.error('Failed to check wishlist:', error);
            }
        };
        checkWishlist();
    }, [productId, variantId]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setLoading(true);
        try {
            if (inWishlist) {
                // Remove from wishlist
                let url = `/api/wishlist?product_id=${productId}`;
                if (variantId) {
                    url += `&variant_id=${variantId}`;
                }
                const res = await fetch(url, { method: 'DELETE' });
                if (res.ok) {
                    setInWishlist(false);
                    toast.success(t('removedFromWishlist') || 'Removed from wishlist');
                }
            } else {
                // Add to wishlist
                const res = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product_id: productId,
                        variant_id: variantId || null
                    })
                });
                if (res.ok) {
                    setInWishlist(true);
                    toast.success(t('addedToWishlist') || 'Added to wishlist');
                } else {
                    const data = await res.json();
                    if (res.status === 401) {
                        toast.error(t('loginToWishlist') || 'Please login to use wishlist');
                    } else {
                        toast.error(data.error || 'Failed to update wishlist');
                    }
                }
            }
        } catch (error) {
            console.error('Wishlist error:', error);
            toast.error('Failed to update wishlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={loading}
            className={`p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all ${inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                } ${loading ? 'opacity-50 cursor-wait' : ''} ${className}`}
            title={inWishlist ? (t('removeFromWishlist') || 'Remove from wishlist') : (t('addToWishlist') || 'Add to wishlist')}
        >
            <Heart
                size={size}
                fill={inWishlist ? 'currentColor' : 'none'}
                className={`transition-all ${loading ? 'animate-pulse' : ''}`}
            />
        </button>
    );
}
