import { GetAllImages } from "@/domain/use-case/admin/images";
import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";
import { Bundles } from "@/domain/use-case/admin/bundles";
import { CreateBundleForm } from "@/ui/client-screens/admin/create-bundle-form";
import { notFound } from "next/navigation";

export default async function EditBundlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const [images, categories, bundle] = await Promise.all([
        new GetAllImages().execute(),
        new GetAllCategories().execute(),
        new Bundles().getById(parseInt(id))
    ]);

    if (!bundle) {
        notFound();
    }

    return (
        <CreateBundleForm 
            editMode 
            initialBundle={bundle} 
            initialCategories={categories} 
            initialImages={images} 
        />
    );
}
