'use server'

import { CreatePromoCode } from "@/domain/use-case/admin/promo-codes/createPromoCode";
import { DeletePromoCode } from "@/domain/use-case/admin/promo-codes/deletePromoCode";
import { UpdatePromoCode } from "@/domain/use-case/admin/promo-codes/updatePromoCode";
import { revalidatePath } from "next/cache";
import { PromoCode } from "@/domain/entities/database/promoCode";

export async function createPromoCodeAction(promoCode: PromoCode) {
    try {
        await new CreatePromoCode().execute(promoCode);
        revalidatePath('/admin/promo-codes');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to create promo code:", error);
        return { success: false, error: error.message || "Failed to create promo code" };
    }
}

export async function deletePromoCodeAction(id: number) {
    try {
        await new DeletePromoCode().execute(id);
        revalidatePath('/admin/promo-codes');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete promo code:", error);
        return { success: false, error: error.message || "Failed to delete promo code" };
    }
}

export async function updatePromoCodeAction(promoCode: any) {
    try {
        await new UpdatePromoCode().execute(promoCode);
        revalidatePath('/admin/promo-codes');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update promo code:", error);
        return { success: false, error: error.message || "Failed to update promo code" };
    }
}
