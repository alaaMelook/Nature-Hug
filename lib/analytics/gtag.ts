// Google Analytics 4 E-commerce Event Tracking
// Docs: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

export interface ProductItem {
    item_id: string | number;
    item_name: string;
    price: number;
    quantity?: number;
    item_category?: string;
    item_variant?: string;
}

// Track when user views a product
export function trackViewItem(product: ProductItem) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "view_item", {
        currency: "EGP",
        value: product.price,
        items: [{
            item_id: product.item_id,
            item_name: product.item_name,
            price: product.price,
            quantity: 1,
            item_category: product.item_category,
            item_variant: product.item_variant,
        }]
    });
    console.log("[GA4] view_item:", product.item_name);
}

// Track when user adds to cart
export function trackAddToCart(product: ProductItem, quantity: number = 1) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "add_to_cart", {
        currency: "EGP",
        value: product.price * quantity,
        items: [{
            item_id: product.item_id,
            item_name: product.item_name,
            price: product.price,
            quantity: quantity,
            item_category: product.item_category,
            item_variant: product.item_variant,
        }]
    });
    console.log("[GA4] add_to_cart:", product.item_name, "x", quantity);
}

// Track when user removes from cart
export function trackRemoveFromCart(product: ProductItem, quantity: number = 1) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "remove_from_cart", {
        currency: "EGP",
        value: product.price * quantity,
        items: [{
            item_id: product.item_id,
            item_name: product.item_name,
            price: product.price,
            quantity: quantity,
        }]
    });
    console.log("[GA4] remove_from_cart:", product.item_name);
}

// Track when user views cart
export function trackViewCart(items: ProductItem[], totalValue: number) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "view_cart", {
        currency: "EGP",
        value: totalValue,
        items: items.map(item => ({
            item_id: item.item_id,
            item_name: item.item_name,
            price: item.price,
            quantity: item.quantity || 1,
        }))
    });
    console.log("[GA4] view_cart:", items.length, "items");
}

// Track when user begins checkout
export function trackBeginCheckout(items: ProductItem[], totalValue: number) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "begin_checkout", {
        currency: "EGP",
        value: totalValue,
        items: items.map(item => ({
            item_id: item.item_id,
            item_name: item.item_name,
            price: item.price,
            quantity: item.quantity || 1,
        }))
    });
    console.log("[GA4] begin_checkout:", totalValue, "EGP");
}

// Track when user adds payment info
export function trackAddPaymentInfo(paymentMethod: string, totalValue: number) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "add_payment_info", {
        currency: "EGP",
        value: totalValue,
        payment_type: paymentMethod,
    });
    console.log("[GA4] add_payment_info:", paymentMethod);
}

// Track when user adds shipping info
export function trackAddShippingInfo(shippingMethod: string, totalValue: number) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "add_shipping_info", {
        currency: "EGP",
        value: totalValue,
        shipping_tier: shippingMethod,
    });
    console.log("[GA4] add_shipping_info:", shippingMethod);
}

// Track successful purchase
export function trackPurchase(
    orderId: string | number,
    items: ProductItem[],
    totalValue: number,
    shipping: number = 0,
    tax: number = 0,
    coupon?: string
) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "purchase", {
        transaction_id: orderId.toString(),
        currency: "EGP",
        value: totalValue,
        shipping: shipping,
        tax: tax,
        coupon: coupon,
        items: items.map(item => ({
            item_id: item.item_id,
            item_name: item.item_name,
            price: item.price,
            quantity: item.quantity || 1,
        }))
    });
    console.log("[GA4] purchase:", orderId, totalValue, "EGP");
}

// Track product list view (category pages)
export function trackViewItemList(listName: string, items: ProductItem[]) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "view_item_list", {
        item_list_name: listName,
        items: items.map((item, index) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            price: item.price,
            index: index,
        }))
    });
    console.log("[GA4] view_item_list:", listName, items.length, "items");
}

// Track product click from list
export function trackSelectItem(listName: string, product: ProductItem, index: number) {
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "select_item", {
        item_list_name: listName,
        items: [{
            item_id: product.item_id,
            item_name: product.item_name,
            price: product.price,
            index: index,
        }]
    });
    console.log("[GA4] select_item:", product.item_name, "from", listName);
}
