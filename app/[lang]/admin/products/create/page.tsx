import { GetAllImages } from "@/domain/use-case/admin/images";
import { CreateProductForm } from "@/ui/client-screens/admin/create-product-form";

export default async function CreateProductPage() {
    const images = await new GetAllImages().execute();

    return (
        <CreateProductForm initialImages={images} />
    );
}
