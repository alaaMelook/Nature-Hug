import { Category } from "../../database/category";
import { FAQs } from "../../database/faq";

export interface ProductAdminView {
    id: number;
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
    price: number;
    discount: number;
    image_url: string;
    category: Category;
    skin_type: string;
    slug: string;
    stock: number;
    product_type: string;
    highlight_en: string;
    highlight_ar: string;
    faq_en: FAQs;
    faq_ar: FAQs;
    gallery: (string | undefined)[];
    variants: ProductVariantAdminView[];
    materials: ProductMaterialAdminView[];
}
export interface ProductVariantAdminView {
    id: number;
    product_id: number;
    name_en: string;
    name_ar: string;
    price: number;
    stock: number;
    discount: number;
    description_en: string;
    description_ar: string;
    type: string;
    image: string;
    gallery: (string | undefined)[];
    slug: string;
    materials: ProductMaterialAdminView[];
}
export interface ProductMaterialAdminView {
    id: number;
    product_id: number;
    variant_id?: number;
    material_id: number;
    grams_used: number;
    measurement_unit: string;
}

/**
 * DECLARE
    v_product_id BIGINT;
    v_variant_id BIGINT;
    v_variant_data JSONB;
    v_material_data JSONB;
BEGIN
    -- 1. INSERT THE BASE PRODUCT
    INSERT INTO store.products (
        name_en,
        description_en,
        price,
        discount,
        image_url,
        name_ar,
        description_ar,
        category_id,
        skin_type,
        slug,
        stock,
        product_type,
        highlight_en,
        highlight_ar,
        faq_en,
        faq_ar,
        gallery
    )
    VALUES (
        product_data->>'name_en',
        product_data->>'description_en',
        (product_data->>'price')::NUMERIC,
        (product_data->>'discount')::NUMERIC,
        product_data->>'image_url',
        product_data->>'name_ar',
        product_data->>'description_ar',
        (product_data->>'category_id')::BIGINT,
        COALESCE(product_data->>'skin_type', 'normal'),
        product_data->>'slug',
        (product_data->>'stock')::BIGINT,
        COALESCE(product_data->>'product_type', 'normal'),
        product_data->>'highlight_en',
        product_data->>'highlight_ar',
        product_data->'faq_en', -- JSONB insertion
        product_data->'faq_ar', -- JSONB insertion
        product_data->'gallery' -- TEXT[] insertion
    )
    RETURNING id INTO v_product_id;

    -- Check if product was inserted successfully
    IF v_product_id IS NULL THEN
        RAISE EXCEPTION 'Failed to insert the base product record.';
    END IF;

    -- 2. INSERT BASE PRODUCT MATERIALS
    IF product_data ? 'materials' AND jsonb_array_length(product_data->'materials') > 0 THEN
        FOR v_material_data IN SELECT * FROM jsonb_array_elements(product_data->'materials')
        LOOP
            INSERT INTO store.product_materials (
                product_id,
                material_id,
                grams_used,
                measurement_unit
            )
            VALUES (
                v_product_id,
                (v_material_data->>'material_id')::INTEGER,
                (v_material_data->>'grams_used')::NUMERIC(10, 2),
                COALESCE((v_material_data->>'measurement_unit')::store.measurement_units, 'gm')
            );
        END LOOP;
    END IF;

    -- 3. INSERT VARIANTS AND VARIANT MATERIALS
    IF product_data ? 'variants' AND jsonb_array_length(product_data->'variants') > 0 THEN
        FOR v_variant_data IN SELECT * FROM jsonb_array_elements(product_data->'variants')
        LOOP
            -- 3a. Insert the Variant
            INSERT INTO store.product_variants (
                product_id,
                name_en,
                price,
                stock,
                discount,
                name_ar,
                description_en,
                description_ar,
                type,
                image,
                gallery,
                slug
            )
            VALUES (
                v_product_id,
                v_variant_data->>'name_en',
                (v_variant_data->>'price')::NUMERIC,
                (v_variant_data->>'stock')::BIGINT,
                (v_variant_data->>'discount')::NUMERIC,
                v_variant_data->>'name_ar',
                v_variant_data->>'description_en',
                v_variant_data->>'description_ar',
                v_variant_data->>'type',
                v_variant_data->>'image',
                v_variant_data->'gallery', -- TEXT[] insertion
                v_variant_data->>'slug'
            )
            RETURNING id INTO v_variant_id;
            
            -- 3b. Insert Variant Materials (if specified for this variant)
            IF v_variant_data ? 'materials' AND jsonb_array_length(v_variant_data->'materials') > 0 THEN
                FOR v_material_data IN SELECT * FROM jsonb_array_elements(v_variant_data->'materials')
                LOOP
                    INSERT INTO store.product_materials (
                        product_id,
                        variant_id,
                        material_id,
                        grams_used,
                        measurement_unit
                    )
                    VALUES (
                        v_product_id,
                        v_variant_id,
                        (v_material_data->>'material_id')::INTEGER,
                        (v_material_data->>'grams_used')::NUMERIC(10, 2),
                        COALESCE((v_material_data->>'measurement_unit')::store.measurement_units, 'gm')
                    );
                END LOOP;
            END IF;

        END LOOP;
    END IF;

    -- 4. Return the ID of the newly created product
    RETURN v_product_id;

END;
 */