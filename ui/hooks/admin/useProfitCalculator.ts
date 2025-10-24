import { Material } from "@/domain/entities/database/material";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";

export function useProfitCalculator(
    product: Partial<ProductAdminView> | null,
    materials: Material[] = []
) {
    if (!product) return { totalCost: 0, profit: 0, profitMargin: 0 };

    const productMaterials = product.materials || [];
    const totalCost = productMaterials.reduce((total, pm) => {
        const m = materials.find((mat) => mat.id === pm.material_id);
        return total + (m ? m.price_per_gram * pm.grams_used : 0);
    }, 0);

    const price = Number(product.price) || 0;
    const profit = price - totalCost;
    const profitMargin = price > 0 ? (profit / price) * 100 : 0;

    return { totalCost, profit, profitMargin };
}
