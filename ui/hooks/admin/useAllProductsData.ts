'use server'
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { DeleteProduct } from "@/domain/use-case/admin/products";




export async function deleteProduct(product: ProductAdminView) {
    await new DeleteProduct().execute(product.slug!)
}



