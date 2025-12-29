import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";
import { CreateProductForm } from "@/ui/client-screens/admin/create-product-form";
import { GetProductForEdit } from "@/domain/use-case/admin/products/getProductForEdit";
import { GetAllImages } from "@/domain/use-case/admin/images";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;

    const [categories, product, images] = await Promise.all([
        new GetAllCategories().execute(),
        new GetProductForEdit().execute(resolvedParams.slug),
        new GetAllImages().execute()
    ]);

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
