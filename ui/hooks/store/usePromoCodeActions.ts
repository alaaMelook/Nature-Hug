'use server'

import { ValidatePromoCode } from "@/domain/use-case/store/validatePromoCode";

export async function validatePromoCodeAction(code: string, cartItems: { slug: string, quantity: number }[], customerId?: number) {
    try {
        const result = await new ValidatePromoCode().execute(code.toUpperCase(), cartItems, customerId);
        return result;
    } catch (error: any) {
        console.error("Failed to validate promo code:", error);
        return { isValid: false, error: error.message || "Failed to validate promo code" };
    }
}
