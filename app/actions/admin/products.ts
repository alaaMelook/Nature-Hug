'use server'

import { CreateProduct } from "@/domain/use-case/admin/products/createProduct";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";

export async function createProductAction(product: ProductAdminView) {
    try {
        await new CreateProduct().execute(product);
        return { success: true };
    } catch (error) {
        console.error("Failed to create product:", error);
        return { success: false, error: "Failed to create product" };
    }
}
