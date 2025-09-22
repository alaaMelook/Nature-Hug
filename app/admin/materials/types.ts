export type Material = {
  id: number;
  name: string;
  price_per_gram: number;
  stock_grams: number;
  supplier_id?: number;
  category_id?: number;
  low_stock_threshold?: number;
  created_at: string;
  updated_at?: string;

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

export type Category = {
  id: number;
  name_english: string;
};

export type MaterialFormData = {
  name: string;
  price_per_gram: string;
  stock_grams: string;
  supplier_id?: string;
  category_id?: string;
  low_stock_threshold?: string;
};
