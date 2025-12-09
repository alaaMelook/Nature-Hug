// // create table admin.materials (
//   id serial not null,
//   name character varying(255) not null,
//   price_per_gram numeric(10, 4) not null,
//   stock_grams numeric(10, 2) not null,
//   created_at timestamp with time zone null default now(),
//   updated_at timestamp with time zone null default now(),
//   sku text null,
//   barcode text null,
//   supplier_id integer null,
//   low_stock_threshold numeric null default 0,
//   material_type text null default 'normal'::text,
//   unit store.Unit not null default 'gm'::store."Unit",
//   constraint materials_pkey primary key (id),
//   constraint materials_supplier_id_fkey foreign KEY (supplier_id) references admin.suppliers (id),
//   constraint materials_price_per_gram_check check ((price_per_gram >= (0)::numeric)),
//   constraint materials_stock_grams_check check ((stock_grams >= (0)::numeric))
// ) TABLESPACE pg_default;

export type Unit = 'gm' | 'ml' | 'piece' | 'bottle' | 'unit';
export type MaterialType = 'Chemicals' | 'Labels' | 'Containers' | 'Packaging' | 'Others';
// Supplier
export interface Material {
    id: number;
    name: string;
    price_per_gram: number;
    stock_grams: number;
    created_at: string;
    updated_at: string;
    sku?: string;
    barcode?: string;
    supplier_id?: number | null;
    low_stock_threshold: number | null;
    material_type?: string;
    unit: Unit | null;
}