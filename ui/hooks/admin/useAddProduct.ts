'use server'

import { AddProduct } from "@/domain/use-case/admin/products";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";

export async function useAddProduct(payload: Partial<ProductAdminView>) {
    let id = await new AddProduct().execute(payload as ProductAdminView);
    if (!id) throw new Error('Failed to add product');
    return id;
}
