import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { Product } from "@/domain/entities/database/product";
import { ProductVariant } from "@/domain/entities/database/productVariant";
import { ProductMaterial } from "@/domain/entities/database/productMaterials";
import { IProductRepository } from "@/data/repositories/iProductsRepository";
import { Review } from "@/domain/entities/database/review";
import { Category } from "../entities/database/category";

export interface ProductRepository {
    viewBySlug(slug: string): Promise<ProductDetailView>;
    viewAll(): Promise<ProductView[]>;
    viewRecent(count: number): Promise<ProductView[]>;
    viewByCategory(categoryName: string): Promise<ProductView[]>;

    getAll(): Promise<Product[]>;
    getVariantsOf(product: Product): Promise<ProductVariant[]>;
    getAllUsedMaterials(product: Product | ProductVariant): Promise<ProductMaterial[]>;
    getAllCategories(): Promise<Category[]>;

    getBySlug(slug: string): Promise<Product>;
    addReview(review: Review): Promise<void>;
    create(product: Product): Promise<number>;
    update(product: Product): Promise<number>;  // for restocking, adding faq or any queries..
    delete(slug: string): Promise<void>;

}
