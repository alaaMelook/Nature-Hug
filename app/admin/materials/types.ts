// app/admin/materials/types.ts
// fixme
export interface Supplier {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name_english: string;
  name_arabic?: string;
}

export interface MaterialProduct {
  id?: number;
  product: Product;
}

export interface Material {
  id: number;
  name: string;
  price_per_gram: number;
  stock_grams: number;
  supplier_id?: number | null;
  unit_id?: number | null; // ✅ مهم جداً
  low_stock_threshold?: number | null;
  material_type?: "normal" | "special" | "other";
  products?: MaterialProduct[];
  created_at?: string;

  // Relations
  supplier?: Supplier | null;
  unit?: Unit | null;
}

export interface MaterialFormData {
  name: string;
  price_per_gram: string;
  stock_grams: string;
  supplier_id: string;
  unit_id: string; // ✅ مهم جداً
  low_stock_threshold: string;
  material_type: "normal" | "special" | "other";
  products: number[]; // product IDs
}
