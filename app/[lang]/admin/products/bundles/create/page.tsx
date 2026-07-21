import { GetAllImages } from "@/domain/use-case/admin/images";
import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";
import { CreateBundleForm } from "@/ui/client-screens/admin/create-bundle-form";

export default async function CreateBundlePage() {
    const [images, categories] = await Promise.all([
        new GetAllImages().execute(),
        new GetAllCategories().execute()
    ]);

    return (
        <CreateBundleForm initialImages={images} initialCategories={categories} />
    );
}
