import { GetAllImages } from "@/domain/use-case/admin/images";
import { GetAllCategories } from "@/domain/use-case/shop/getAllCategories";
import { CreateProductForm } from "@/ui/client-screens/admin/create-product-form";

export default async function CreateProductPage() {
    const images = await new GetAllImages().execute();
    const categories = await new GetAllCategories().execute();

    return (
        <CreateProductForm initialImages={images} initialCategories={categories} />
    );
}
