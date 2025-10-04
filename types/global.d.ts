export { };

declare global {
  interface Product {
    id: number;
    created_at: string;
    name_english: string;
    name_arabic: string;
    description_english: string;
    description_arabic: string;
    price: number;
    discount: number | null;
    stock: number;
    image_url: string | null;
    category_id: number;
    skin_type?: string | null;
    sizes?: string | null;
    status: "active" | "inactive";
    slug?: string | null;
    meta_description?: string | null;
    materials?: ProductMaterial[];
  }

  interface Material {
    id: number;
    name: string;
    price_per_gram: number;
    stock_grams: number;
    created_at: string;
    updated_at: string;
  }

  interface ProductMaterial {
    id: number;
    product_id: number;
    material_id: number;
    grams_used: number;
    material: Material;
  }

  interface CartItem {
    id: number;
    name_english: string;
    name_arabic: string;
    price: number;
    discount: number | null;
    image_url: string | null;
    quantity: number;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
  }

  interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    success: boolean;
  }

  interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => Promise<void>;
    removeFromCart: (product: Product) => Promise<void>;
    updateQuantity: (product: Product, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getCartTotal: () => number;
    getCartNetTotal: () => number;
    getCartCount: () => number;
  }

  type FormEvent = React.FormEvent<HTMLFormElement>;
  type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
  type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
}
