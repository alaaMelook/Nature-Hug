'use server'

import { AddStock } from "@/domain/use-case/admin/inventory/addStock";
import { revalidatePath } from "next/cache";
import { Material } from "@/domain/entities/database/material";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";

export async function addStockAction(type: 'material' | 'product', product: Material | ProductAdminView, quantity: number,) {
    try {
        await new AddStock().execute(type, product, quantity);
        revalidatePath('/admin/materials');
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to add stock:", error);
        return { success: false, error: error.message || "Failed to add stock" };
    }
}
