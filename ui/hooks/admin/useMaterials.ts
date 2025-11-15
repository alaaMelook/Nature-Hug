'use server'
import { Material } from "@/domain/entities/database/material";
import { AddMaterial, DeleteMaterial, UpdateMaterial } from "@/domain/use-case/admin/materials";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export async function insertMaterials(form: Partial<Material>[]) {
    try {
        form.forEach(async (material) => {

            await new AddMaterial().execute(material);
            console.log("Material inserted:", material);
        });
    } catch (error) {
        console.error("Error inserting material:", error);
        return { error: 'Insert failed' };
    }
    revalidatePath('/admin', 'layout');
    return { success: true };
}

export async function deleteMaterial(id: number) {
    try {
        await new DeleteMaterial().execute(id);
        revalidatePath('/admin', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Error deleting material:", error);
        return { error: 'Delete failed' };
    }
}

export async function updateMaterial(material: Partial<Material>) {
    try {
        await new UpdateMaterial().execute(material);
        revalidatePath('/admin', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Error deleting material:", error);
        return { error: 'Update failed' };
    }


}