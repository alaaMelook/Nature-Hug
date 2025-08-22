"use client";
import React, { useEffect, useState } from "react";
import { ShoppingCart, Star, Box, Rocket, Heart, Zap } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Product {
  id: number;
  created_at: string;
  name_english: string | null;
  name_arabic: string | null;
  description_english: string | null;
  description_arabic: string | null;
  price: number;
  discount: number | null;
  quantity: number | null;
  image_url: string | null;
}

const features = [
  { icon: Heart, title: "Curated Selection", description: "Hand-picked items for quality and style." },
  { icon: Rocket, title: "Fast Shipping", description: "Your order ships within 24 hours." },
  { icon: Box, title: "Secure Packaging", description: "Items are securely packed and protected." },
  { icon: Zap, title: "Exclusive Deals", description: "Access to special promotions and discounts." },
];

type LangKey = "en" | "ar";

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<LangKey>("en");
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLang = (document.documentElement.lang as LangKey) || "en";
      setLanguage(currentLang);
    };
    handleLanguageChange();
    const observer = new MutationObserver(handleLanguageChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        const formatted: Product[] = (data || []).map((p: any) => ({
          ...p,
          id: Number(p.id),
          price: Number(p.price) || 0,
          discount: p.discount != null ? Number(p.discount) : null,
          quantity: p.quantity != null ? Number(p.quantity) : null,
        }));
        setProducts(formatted);
      } catch (err: any) {
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    return () => observer.disconnect();
  }, []);

  const t = {
    en: {
      error: "Error loading products",
      noProd: "No products available",
      noImg: "No Image",
      outOfStock: "Out Of Stock",
      addToCart: "Add to Cart",
      featuredProducts: "Featured Products",
      shopNow: "Shop Now",
      learnMore: "Learn More",
      allRightsReserved: "All rights reserved.",
      heroTitle: <>Where every ingredient <br className="hidden md:inline" /> is a promise.</>,
      heroDescription: "A gentle hug for your skin from nature itself.",
      addedLocal: "Added to local cart (login to sync).",
      addedServer: "Product added to cart!",
    },
    ar: {
      error: "خطأ في تحميل المنتجات",
      noProd: "لا توجد منتجات متاحة",
      noImg: "لا توجد صورة",
      outOfStock: "غير متوفر",
      addToCart: "أضف إلى السلة",
      featuredProducts: "المنتجات المميزة",
      shopNow: "تسوق الآن",
      learnMore: "اعرف المزيد",
      allRightsReserved: "جميع الحقوق محفوظة.",
      heroTitle: <>حيث كل مكون <br className="hidden md:inline" /> هو وعد.</>,
      heroDescription: "عناق لطيف لبشرتك من الطبيعة نفسها.",
      addedLocal: "اتضافت في سلة الضيف (سجّل دخول علشان تتزامن).",
      addedServer: "تم إضافة المنتج لعربة التسوق!",
    },
  }[language];

  // -------- Guest Cart helpers --------
  const addToGuestCart = (productId: number, qty = 1) => {
    const key = "guest_cart";
    const raw = localStorage.getItem(key);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[productId] = (map[productId] || 0) + qty;
    localStorage.setItem(key, JSON.stringify(map));
  };

  // -------- Server Cart helpers --------
  const ensureCustomerAndCart = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) throw new Error("AUTH_REQUIRED");
    const userId = session.user.id;
    const userEmail = session.user.email || null;
    const userName = (session.user.user_metadata as any)?.full_name || null;

    // profile -> customer_id
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("customer_id")
      .eq("id", userId)
      .maybeSingle();

    let customerId = existingProfile?.customer_id as number | undefined;

    if (!customerId) {
      // create a unique phone to satisfy unique constraint
      const phone = userId; // guaranteed unique
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          phone,
          email: userEmail,
          name: userName,
        })
        .select("id")
        .single();
      if (custErr) throw custErr;
      customerId = Number(newCustomer!.id);

      const { error: upErr } = await supabase
        .from("profiles")
        .upsert({ id: userId, customer_id: customerId }, { onConflict: "id" });
      if (upErr) throw upErr;
    }

    // get or create cart
    const { data: existingCart } = await supabase
      .from("carts")
      .select("id")
      .eq("customer_id", customerId)
      .eq("customer_uuid", userId)
      .maybeSingle();

    if (existingCart?.id) return { cartId: Number(existingCart.id) };

    const { data: newCart, error: cartErr } = await supabase
      .from("carts")
      .insert({ customer_id: customerId, customer_uuid: userId })
      .select("id")
      .single();

    if (cartErr) throw cartErr;
    return { cartId: Number(newCart!.id) };
  };

  const handleAddToCart = async (productId: number) => {
    try {
      setAddingToCart(productId);
      let cartId: number | null = null;
      try {
        const ensure = await ensureCustomerAndCart();
        cartId = ensure.cartId;
      } catch (e: any) {
        // no session or not allowed -> fallback to guest
        addToGuestCart(productId, 1);
        alert(t.addedLocal);
        return;
      }

      // check if item exists
      const { data: existingItem, error: exErr } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", productId)
        .maybeSingle();
      if (exErr) throw exErr;

      if (existingItem?.id) {
        const { error: upErr } = await supabase
          .from("cart_items")
          .update({ quantity: Number(existingItem.quantity) + 1 })
          .eq("id", existingItem.id);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabase
          .from("cart_items")
          .insert({ cart_id: cartId, product_id: productId, quantity: 1 });
        if (insErr) throw insErr;
      }

      alert(t.addedServer);
    } catch (err: any) {
      console.error(err);
      // لو اتكسرت بسبب RLS لأي سبب، خليه ضيف
      addToGuestCart(productId, 1);
      alert(t.addedLocal);
    } finally {
      setAddingToCart(null);
    }
  };

  const renderProductContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
          <p className="font-semibold">{t.error}:</p>
          <p>{error}</p>
        </div>
      );
    }
    if (products.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">{t.noProd}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const displayName = language === "ar" ? product.name_arabic : product.name_english;
          return (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={displayName || ""}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400/D1D5DB/4B5563?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">{t.noImg}</span>
                  </div>
                )}
                {product.discount ? (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discount}%
                  </div>
                ) : null}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {displayName}
                </h3>

                <div className="flex items-center mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">(4.5)</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-semibold text-gray-900">
                    {product.price.toFixed(2)} EGP
                  </p>
                  {(product.quantity == null || product.quantity == 0) && (
                    <span className="text-sm text-gray-500">{t.outOfStock}</span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product.id as number)} // ✅ استدعاء الفانكشن
                  disabled={addingToCart === product.id}
                  className="mt-4 w-full bg-[#8B4513] text-white py-2.5 rounded-lg shadow-md hover:bg-[#A0522D] transition-colors duration-300 flex items-center justify-center disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToCart === product.id ? "..." : t.addToCart}
                </button>


              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      <main>
        {/* Hero Section */}
        <section className="bg-white py-12 md:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              {t.heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/cart"
                className="bg-[#8B4513] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#A0522D] transition-colors duration-300 text-center"
              >
                {t.shopNow}
              </Link>
              <Link
                href="/checkout"
                className="bg-[#8B4513] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#A0522D] transition-colors duration-300 text-center"
              >
                {t.learnMore}
              </Link>
            </div>
          </div>
        </section>

        {/* Product Grid Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">
              {t.featuredProducts}
            </h2>
            {renderProductContent()}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-100 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <feature.icon className="w-10 h-10 text-[#8B4513]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white font-semibold text-gray-700 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm md:text-base">
            &copy; {new Date().getFullYear()} Hug Nature. {t.allRightsReserved}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
