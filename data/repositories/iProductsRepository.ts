import { supabase } from "@/data/supabase/client";
import { Product } from "@/domain/entities/database/product";
import { ProductMaterial } from "@/domain/entities/database/productMaterials";
import { ProductVariant } from "@/domain/entities/database/productVariant";
import { ProductDetailView } from "@/domain/entities/views/shop/productDetailView";
import { ProductView } from "@/domain/entities/views/shop/productView";
import { ProductRepositoryAbstract } from "@/domain/repositories/productRepository";
import { currentLanguage } from "@/providers/TranslationProvider";



export class IProductRepository implements ProductRepositoryAbstract {
    async viewAll(): Promise<ProductView[]> {
        try {
            const { data, error } = await supabase.schema('store').from(`products_view_${currentLanguage}`).select('*');
            if (error) console.error(error);
            return data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    async viewBySlug(slug: string): Promise<ProductDetailView> {
        try {
            const { data, error } = await supabase.schema('store').from(`products_view_${currentLanguage}`).select('*').eq('slug', slug).single();
            if (error) console.error(error);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async viewByCategory(categoryName: string): Promise<ProductView[]> {
        try {
            const { data, error } = await supabase.schema('store').from('products_view_en').select('*').eq('category_name', categoryName);
            if (error) console.error(error);
            return data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // admin

    async getAll(): Promise<Product[]> {
        try {
            const { data, error } = await supabase.schema('store').from('products').select('*');
            if (error) console.error(error);
            return data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    async getVariantsOf(product: Product): Promise<ProductVariant[]> {
        try {
            const { data, error } = await supabase.schema('store').from('product_variants').select('*').eq('product_id', product.id);
            if (error) console.error(error);
            return data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    async getAllUsedMaterials(product: Product | ProductVariant): Promise<ProductMaterial[]> {
        try {
            let key_name = 'product_id' in product && product.product_id !== undefined ? 'variant_id' : 'product_id';
            const { data, error } = await supabase.schema('store').from('materials_used').select('*').eq(key_name, product.id);
            if (error) console.error(error);
            return data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async getBySlug(slug: string): Promise<Product> {
        try {
            const { data, error } = await supabase.schema('store').from('products').select('*').eq('slug', slug).single();
            if (error) console.error(error);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async create(product: Product): Promise<number> {
        try {
            const { data, error } = await supabase.schema('admin').rpc('create_product', { product_data: product });
            if (error) console.error(error);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async update(product: Product): Promise<number> {
        try {
            const { data, error } = await supabase.schema('admin').rpc('update_product', { product_data: product });
            if (error) console.error(error);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async delete(id: number): Promise<void> {
        try {
            const { error } = await supabase.schema('store').from('products').delete().eq('id', id);
            if (error) throw error
        } catch (error) {
            console.error(error);
        }
    }

}
