import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Material } from "@/domain/entities/database/material";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { ReviewAdminView } from "@/domain/entities/views/admin/reviewAdminView";



export class GetSidebarStats {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(): Promise<SidebarStats> {
        try {
            // Fetch all necessary data in parallel
            const [products, materials, orders, reviews] = await Promise.all([
                this.repo.viewAllWithDetails(),
                this.repo.getAllMaterials(),
                this.repo.getOrderDetails(),
                this.repo.seeAllReviews()
            ]);

            // Calculate Products Warning Count
            // Logic: Stock <= 0 OR Pending Reviews
            const outOfStockProducts = products.filter((p: ProductAdminView) => p.stock <= 0).length;
            const pendingReviews = reviews.filter((r: ReviewAdminView) => r.status === 'pending').length;
            const productsWarningCount = { products: outOfStockProducts, reviews: pendingReviews };

            // Calculate Materials Warning Count
            // Logic: Stock <= Low Stock Threshold
            const materialsWarningCount = materials.filter((m: Material) => {
                const threshold = m.low_stock_threshold ?? 0;
                return m.stock_grams <= threshold;
            }).length;

            // Calculate Orders Warning Count
            // Logic: Order Status is 'Processing'
            const ordersWarningCount = { pending: orders.filter((o: OrderDetailsView) => o.order_status.toLowerCase() === 'pending').length, processing: orders.filter((o: OrderDetailsView) => o.order_status.toLowerCase() === 'processing').length };

            return {
                productsWarningCount,
                materialsWarningCount,
                ordersWarningCount
            };
        } catch (error) {
            console.error("[GetSidebarStats] Error fetching stats:", error);
            // Return 0s in case of error to avoid breaking the UI
            return {
                productsWarningCount: { products: 0, reviews: 0 },
                materialsWarningCount: 0,
                ordersWarningCount: { pending: 0, processing: 0 }
            };
        }
    }
}
