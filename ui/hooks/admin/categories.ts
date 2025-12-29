'use server'

import { CreateCategory } from "@/domain/use-case/admin/categories/createCategory";
import { DeleteCategory } from "@/domain/use-case/admin/categories/deleteCategory";
import { UpdateCategory } from "@/domain/use-case/admin/categories/updateCategory";
import { Category } from "@/domain/entities/database/category";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(category: Partial<Category>) {
    try {
        await new CreateCategory().execute(category);
        revalidatePath('/admin/products/categories');
        return { success: true };
    } catch (error) {
        console.error("Failed to create category:", error);
        return { success: false, error: "Failed to create category" };
    }
}

export async function deleteCategoryAction(id: number) {
    try {
        await new DeleteCategory().execute(id);
        revalidatePath('/admin/products/categories');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { success: false, error: "Failed to delete category" };
    }
}

export async function updateCategoryAction(category: Partial<Category>) {
    try {
        await new UpdateCategory().execute(category);
        revalidatePath('/admin/products/categories');
        return { success: true };
    } catch (error) {
        console.error("Failed to update category:", error);
        return { success: false, error: "Failed to update category" };
    }
}
