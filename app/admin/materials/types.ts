// types.ts
export type Product = {
  id: number;
  name_english?: string;
  name_arabic?: string;
};

export type Material = {
  id: number;
  name: string;
  price_per_gram: number;
  stock_grams: number;
  supplier_id?: number | null;
  low_stock_threshold?: number | null;
  created_at?: string;
  updated_at?: string;

  material_type?: "normal" | "variant" | "perfume";

  unit?: Unit;
  supplier?: Supplier;

  // كل مادة هترجع مصفوفة من روابط product_materials,
  // وكل رابط فيه حقل product (نتيجة الانضمام product:products(...))
  products?: {
    product: Product;
    id?: number; // اختياري: id صف الرابط لو احتجته
    grams_used?: number; // لو انت بتجيب هذا الحقل من product_materials
  }[];
};

export type Unit = {
  id: number;
  name: string;
};

export type Supplier = {
  id: number;
  name: string;
};

export type MaterialFormData = {
  name: string;
  price_per_gram: string;
  stock_grams: string;
  supplier_id?: string;
  low_stock_threshold?: string;
  material_type: "normal" | "variant" | "perfume";

  // IDs للـ products اللي هتربط بالمادة
  products?: number[];
};
