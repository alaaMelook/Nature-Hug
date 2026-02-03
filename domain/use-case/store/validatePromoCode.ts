import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";

export class ValidatePromoCode {
    constructor(private repo = new IProductServerRepository()) { }

    async execute(code: string, cartItems: { slug: string, quantity: number }[], customerId?: number) {
        // 1. Get Promo Code
        const promo = await this.repo.getPromoCode(code);
        if (!promo || !promo.is_active) {
            return { isValid: false, error: "Invalid promo code" };
        }

        // 2. Check customer eligibility (if promo code is restricted to specific customers)
        if (promo.eligible_customer_ids && promo.eligible_customer_ids.length > 0) {
            if (!customerId || !promo.eligible_customer_ids.includes(customerId)) {
                return { isValid: false, error: "This promo code is not available for your account" };
            }
        }

        // 2. Fetch Products to get prices and IDs
        const products = [];
        for (const item of cartItems) {
            const product = await this.repo.viewBySlug(item.slug);
            if (product) {
                products.push({ ...product, quantity: item.quantity });
            }
        }

        // 2.5 Calculate cart total for minimum order validation
        const cartTotal = products.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // 2.6 Check minimum order amount
        if (promo.min_order_amount && promo.min_order_amount > 0) {
            if (cartTotal < promo.min_order_amount) {
                return {
                    isValid: false,
                    error: `Minimum order amount is ${promo.min_order_amount} EGP`
                };
            }
        }

        // 3. Calculate Discount
        let totalDiscount = 0;
        if (promo.free_shipping && promo.all_cart && promo.percentage_off === 100) {
            return { isValid: true, discount: 0, promoCode: promo.code, details: promo, isAdmin: true };
        }
        if (promo.all_cart) {
            // Handle fixed amount discount
            if (promo.amount_off && promo.amount_off > 0) {
                // Fixed amount discount - ensure we don't discount more than cart total
                totalDiscount = Math.min(promo.amount_off, cartTotal);
            }
            else if (promo.percentage_off > 0) {
                totalDiscount = products.reduce((acc, item) => acc + (item.price * item.quantity) * (promo.percentage_off / 100), 0);
            }
            else if (promo.is_bogo) {
                // remove the cheapest counts in promo.bogo_get_count, but make sure there's enough products == promo.bogo_buy_count
                const sortedProducts = [...products].sort((a, b) => a.price - b.price);
                let cartCount = sortedProducts.reduce((acc, item) => acc + item.quantity, 0);
                if (cartCount < promo.bogo_buy_count + promo.bogo_get_count) {
                    return { isValid: false, error: "Not enough products in cart" };
                }

                totalDiscount = 0;
                let i = promo.bogo_get_count;
                for (const item of sortedProducts) {
                    if (i === 0) break;
                    else if (item.quantity > i) {
                        totalDiscount += item.price * i;
                        break;
                    }
                    else {
                        totalDiscount += item.price * item.quantity;
                        i -= item.quantity;
                    }
                }
            }
            else if (promo.free_shipping) {
                totalDiscount = 0;
            }
            else {
                return { isValid: false, error: "Invalid promo code" };
            }
        }
        else if ((promo.eligible_product_slugs?.length ?? 0) > 0) {
            //  offers happens on certain items only!!

            const eligibleProducts = products.filter(item => promo.eligible_product_slugs?.includes(item.slug));
            if (eligibleProducts.length === 0) {
                return { isValid: false, error: "No eligible products found" };
            }
            const eligibleTotal = eligibleProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            // Handle fixed amount discount for specific products
            if (promo.amount_off && promo.amount_off > 0) {
                // Fixed amount discount - ensure we don't discount more than eligible products total
                totalDiscount = Math.min(promo.amount_off, eligibleTotal);
            }
            else if (promo.percentage_off > 0) {
                totalDiscount = eligibleProducts.reduce((acc, item) => acc + (item.price * item.quantity) * (promo.percentage_off / 100), 0);
            }
            else if (promo.is_bogo) {
                // remove the cheapest counts in promo.bogo_get_count, but make sure there's enough products == promo.bogo_buy_count
                // keep in mind that cheapest products can have multiple quantities

                const sortedProducts = [...eligibleProducts].sort((a, b) => a.price - b.price);
                let cartCount = sortedProducts.reduce((acc, item) => acc + item.quantity, 0);
                if (cartCount < promo.bogo_buy_count + promo.bogo_get_count) {
                    return { isValid: false, error: "Not enough products in cart" };
                }
                totalDiscount = 0;
                let i = promo.bogo_get_count;
                for (const item of sortedProducts) {
                    if (i === 0) break;
                    else if (item.quantity > i) {
                        totalDiscount += item.price * i;
                        break;
                    }
                    else {
                        totalDiscount += item.price * item.quantity;
                        i -= item.quantity;
                    }
                }


            }
            else if (promo.free_shipping) {
                totalDiscount = 0;
            }
            else {
                return { isValid: false, error: "Invalid promo code" };
            }
        }
        else {
            return { isValid: false, error: "Invalid promo code" };
        }

        return {
            isAdmin: promo.free_shipping && promo.percentage_off === 100,
            isValid: true,
            discount: totalDiscount,
            promoCode: promo.code,
            details: promo
        };
    }
}
