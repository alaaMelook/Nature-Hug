'use server';

import { CartItem } from '@/domain/entities/views/shop/productView';
import { ViewAllProducts } from '@/domain/use-case/store/viewAllProducts'

export async function validateCart(cart: { slug: string, quantity: number }[], lang: LangKey = 'ar'): Promise<{ items: CartItem[], removed: { slug: string, quantity: number, reason: string }[] }> {
    if (cart.length === 0) {
        return { items: [], removed: [] }
    }

    const products = await Promise.all(cart.map(item => new ViewAllProducts(lang).bySlug(item.slug)))

    const productMap = new Map(
        products.map(p => [p.slug, p])
    )

    const validatedItems = []
    const removedItems = []

    for (const item of cart) {
        const product = productMap.get(item.slug)

        // Product no longer exists
        if (!product) {
            removedItems.push({ ...item, reason: 'NOT_FOUND' })
            continue
        }

        // Out of stock
        if (product.stock <= 0) {
            removedItems.push({ ...item, reason: 'OUT_OF_STOCK' })
            continue
        }

        // Adjust quantity if needed
        if (item.quantity > product.stock) {
            validatedItems.push({
                ...product,
                quantity: product.stock,
            })
            continue
        }

        validatedItems.push({
            ...product,
            quantity: item.quantity,
        })
    }

    return {
        items: validatedItems,
        removed: removedItems,
    }
}
