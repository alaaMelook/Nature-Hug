import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";
import { EditProductForm } from "@/ui/client-screens/admin/edit-product-form";
import { GetProductForEdit } from "@/domain/use-case/admin/products/getProductForEdit";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const categories = await new GetAllCategories().execute();
    const product = await new GetProductForEdit().execute(resolvedParams.slug);

    if (!product) {
        notFound();
    }

    return (
        <EditProductForm
            initialCategories={categories}
            initialProduct={product}
        />
    );
}

