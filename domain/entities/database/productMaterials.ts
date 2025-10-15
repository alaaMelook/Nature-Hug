export type measure_unit = 'gm' | 'ml';


export interface ProductMaterial {
    id: number;
    product_id: number;
    material_id: number;
    grams_used: number;
    created_at: string;
    variant_id?: number;
    measurement_unit: measure_unit | string;
}
