'use server'

import { CreateProduct } from "@/domain/use-case/admin/products/createProduct";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { DeleteProduct } from "@/domain/use-case/admin/products";

import { ViewProduct } from "@/domain/use-case/store/viewProduct";
import { CheckProduct } from "@/domain/use-case/admin/products/checkProduct";


export async function createProductAction(product: ProductAdminView) {
    try {
        let exists = await new CheckProduct().execute(product.slug!);
        if (exists) {
            return { success: false, error: "Product already exists" };
        }
        console.log(product.variants.map(v => v.materials));
        let id = await new CreateProduct().execute(product);
        return { success: true, id: id };
    } catch (error) {
        console.error("Failed to create product:", error);
        return { success: false, error: "Failed to create product" };
    }
}
export async function deleteProduct(product: ProductAdminView) {
    try {
        await new DeleteProduct().execute(product.slug!)
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, error: "Failed to delete product" };
    }
}
