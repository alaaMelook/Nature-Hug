export type Material = {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  price_per_gram: number;
  stock_grams: number;
  unit_id: number;
  supplier_id?: number;
  category_id?: number;
  low_stock_threshold?: number;
  created_at: string;
  updated_at?: string;

  // Relations
  unit?: Unit;
  supplier?: Supplier;
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
  sku?: string;
  barcode?: string;
  price_per_gram: string;
  stock_grams: string;
  unit_id: string;
  supplier_id?: string;
};