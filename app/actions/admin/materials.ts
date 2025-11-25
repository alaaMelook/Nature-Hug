'use server';

import { GetAllMaterials, AddMaterial } from "@/domain/use-case/admin/materials";
import { Material } from "@/domain/entities/database/material";
import { revalidatePath } from "next/cache";

export async function getMaterialsAction() {
    try {
        const materials = await new GetAllMaterials().execute();
        return { success: true, materials };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function addMaterialAction(material: Partial<Material>) {
    try {
        await new AddMaterial().execute(material);
        revalidatePath('/[lang]/admin/products/create', 'page');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
