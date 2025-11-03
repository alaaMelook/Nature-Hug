import {Material} from "@/domain/entities/database/material";
import {DashboardMetricsView} from "@/domain/entities/views/admin/dashboardMetricsView";
import {OrderDetailsView} from "@/domain/entities/views/admin/orderDetailsView";
import {ProductAdminView} from "@/domain/entities/views/admin/productAdminView";

export interface AdminRepository {
    getOrderDetails(): Promise<OrderDetailsView[]>;

    getDashboardMetrics(): Promise<DashboardMetricsView>;

    getAllMaterials(): Promise<Material[]>;

    addMaterial(material: Material): Promise<void>;

    deleteMaterial(id: number): Promise<void>;

    createProduct(product: ProductAdminView): Promise<number>;

    updateProduct(product: ProductAdminView): Promise<number>;

    deleteProduct(slug: string): Promise<void>;

    uploadImage(file: File): Promise<string>;
}
