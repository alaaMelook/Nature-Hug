'use server';

import { Bundles } from "@/domain/use-case/admin/bundles";
import { BundleAdminView } from "@/domain/entities/views/admin/bundleAdminView";
import { revalidatePath } from "next/cache";

export async function createBundleAction(bundle: Partial<BundleAdminView>) {
    try {
        const id = await new Bundles().create(bundle);
        revalidatePath('/admin/products/bundles');
        return { success: true, id };
    } catch (error: any) {
        console.error("Failed to create bundle:", error);
        return { success: false, error: error.message || "Failed to create bundle" };
    }
}

export async function updateBundleAction(bundle: Partial<BundleAdminView>) {
    try {
        await new Bundles().update(bundle);
        revalidatePath('/admin/products/bundles');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update bundle:", error);
        return { success: false, error: error.message || "Failed to update bundle" };
    }
}

export async function deleteBundleAction(id: number) {
    try {
        await new Bundles().delete(id);
        revalidatePath('/admin/products/bundles');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete bundle:", error);
        return { success: false, error: error.message || "Failed to delete bundle" };
    }
}

export async function duplicateBundleAction(id: number) {
    try {
        const newId = await new Bundles().duplicate(id);
        revalidatePath('/admin/products/bundles');
        return { success: true, id: newId };
    } catch (error: any) {
        console.error("Failed to duplicate bundle:", error);
        return { success: false, error: error.message || "Failed to duplicate bundle" };
    }
}
