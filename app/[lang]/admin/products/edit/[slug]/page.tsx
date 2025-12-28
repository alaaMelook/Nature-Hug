import { GetAllImages } from "@/domain/use-case/admin/images";
import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";
import { CreateProductForm } from "@/ui/client-screens/admin/create-product-form";
import { GetAllProductsWithDetails } from "@/domain/use-case/admin/products";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const images = await new GetAllImages().execute();
    const categories = await new GetAllCategories().execute();
    const products = await new GetAllProductsWithDetails().execute();

    // Find the product by slug
    const product = products.find(p => p.slug === resolvedParams.slug);

    if (!product) {
        notFound();
    }

    return (
        <CreateProductForm
            initialImages={images}
            initialCategories={categories}
            editMode={true}
            initialProduct={product}
        />
    );
}
