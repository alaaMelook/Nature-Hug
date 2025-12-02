'use server'
import { Material } from "@/domain/entities/database/material";
import { AddMaterial, DeleteMaterial, UpdateMaterial } from "@/domain/use-case/admin/materials";
import { revalidatePath } from "next/cache";

export async function insertMaterials(form: Partial<Material>[]) {
    try {
        await Promise.all(form.map(async (material) => {
            await new AddMaterial().execute(material);
            console.log("Material inserted:", material);
        }));
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
    } catch (error: any) {
        console.error("Error deleting material:", error);
        if (error?.code === '23503') {
            return { error: 'DELETE_RESTRICTED' };
        }
        return { error: 'Delete failed' };
    }
}

export async function updateMaterial(material: Partial<Material>) {
    try {
        await new UpdateMaterial().execute(material);
        revalidatePath('/admin', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Error updating material:", error);
        return { error: 'Update failed' };
    }
}