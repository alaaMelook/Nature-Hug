import { Material } from "@/domain/entities/database/material";
import { DashboardStats } from "@/domain/entities/views/admin/dashboardMetricsView";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { ReviewAdminView } from "@/domain/entities/views/admin/reviewAdminView";
import { Category } from "../entities/database/category";

export interface AdminRepository {
    getOrderDetails(): Promise<OrderDetailsView[]>;

    getDashboardMetrics(startDate: string,
        endDate: string
    ): Promise<DashboardStats>;

    getAllMaterials(): Promise<Material[]>;

    addMaterial(material: Material): Promise<void>;

    updateMaterial(material: Partial<Material>): Promise<void>;

    deleteMaterial(id: number): Promise<void>;

    createCategory(category: Partial<Category>): Promise<void>;
    deleteCategory(id: number): Promise<void>;
    createProduct(product: ProductAdminView): Promise<number>;

    updateProduct(product: ProductAdminView): Promise<number>;

    deleteProduct(product: ProductAdminView): Promise<void>;

    uploadImage(file: File): Promise<string>;

    updateOrder(order: OrderDetailsView): Promise<void>;

    getAllImages(): Promise<{ image: any, url: string }[]>;

    deleteImage(imageName: string): Promise<void>;

    seeAllReviews(): Promise<ReviewAdminView[]>;

    updateReviewStatus(reviewId: number, status: 'approved' | 'rejected' | 'pending'): Promise<void>;

    getAllPromoCodes(): Promise<any[]>;
    createPromoCode(promoCode: any): Promise<void>;
    deletePromoCode(id: number): Promise<void>;

    getAllGovernorates(): Promise<any[]>;
    updateGovernorateFees(slug: string, fees: number): Promise<void>;
    toggleProductVisibility(id: number, isVariant: boolean, visible: boolean): Promise<void>;
}
