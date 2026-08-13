'use server';

import { CartItem } from '@/domain/entities/views/shop/productView';
import { ViewAllProducts } from '@/domain/use-case/store/viewAllProducts'

export async function validateCart(cart: CartItem[], lang: LangKey = 'ar'): Promise<{ items: CartItem[], removed: { slug: string, quantity: number, reason: string }[] }> {
    if (cart.length === 0) {
        return { items: [], removed: [] }
    }

    const slugs = cart.map(item => item.slug);
    const products = await new ViewAllProducts(lang).batchBySlugs(slugs);

    const productMap = new Map(
        products.map(p => [p.slug, p])
    )

    const validatedItems: CartItem[] = []
    const removedItems: { slug: string, quantity: number, reason: string }[] = []

    for (const item of cart) {
        const product = productMap.get(item.slug)

        // Product no longer exists
        if (!product) {
            removedItems.push({ slug: item.slug, quantity: item.quantity, reason: 'NOT_FOUND' })
            continue
        }

        // Out of stock
        if (product.stock <= 0) {
            removedItems.push({ slug: item.slug, quantity: item.quantity, reason: 'OUT_OF_STOCK' })
            continue
        }

        const quantity = item.quantity > product.stock ? product.stock : item.quantity;

        if (item.slug.startsWith('bundle-')) {
            validatedItems.push({
                ...product,
                name: item.name || product.name,
                price: item.price !== undefined ? item.price : product.price,
                original_price: item.original_price !== undefined ? item.original_price : product.original_price,
                discount: item.discount !== undefined ? item.discount : product.discount,
                selected_variants: item.selected_variants,
                product_type: 'bundle',
                quantity: quantity,
            });
            continue;
        }

        validatedItems.push({
            ...product,
            quantity: quantity,
        })
    }

    return {
        items: validatedItems,
        removed: removedItems,
    }
}
