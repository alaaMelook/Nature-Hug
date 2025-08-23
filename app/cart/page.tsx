"use client";
import { useState, useEffect } from "react";
import {
  XMarkIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "../components/TranslationProvider";

interface Product {
  id: number;

  name: string; // unified field

  price: number;

  image_url: string | null;
}

interface CartItem {
  id: number;

  quantity: number;

  products: Product;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useTranslation();

  // Simulate an API call to fetch cart data with a delay.
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/cart?lang=${language}`, {
          method: "GET",

          credentials: "include", // Ensures cookies (uuid) are sent
        });

        const data = await res.json();

        // Assuming the fetched data now includes name_arabic

        setItems(data || []);
      } catch (err) {
        console.error("Error fetching cart:", err);

        setItems([]);
      }

      setLoading(false);
    };

    fetchCart();
  }, [language]);
  // Calculate the subtotal of all items in the cart.
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * (item.products?.price || 0),
    0
  );

  /**
   * Handles the removal of an item from the cart.
   * This is a client-side update for demonstration.
   * @param {number} itemId The ID of the item to remove.
   */
  const handleRemoveItem = (itemId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  // ------------------ Conditional Rendering ------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white transition-colors duration-300 ">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-900 mb-4"></div>
        <p className="text-xl text-slate-600  font-medium">
          {t("loadingCart")}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white  p-8 text-center transition-colors duration-300 ">
        <ShoppingBagIcon className="h-20 w-20 text-slate-400 mb-6" />
        <h1 className="text-4xl font-extrabold text-slate-900  mb-2">
          {t("emptyCart")}
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-sm">
          {t("startAdding")}
        </p>
        <button className="flex items-center space-x-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-full shadow-lg hover:bg-slate-700 transition duration-300">
          <ArrowRightIcon className="h-5 w-5" />
          <span>{t("shopNow")}</span>
        </button>
      </div>
    );
  }

  // ------------------ Main Cart Content ------------------
  return (
    <div className="bg-gray-100 min-h-screen py-16  antialiased text-slate-900 transition-colors duration-300">
      <div className=" max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border border-slate-100 "
              >
                <div className="flex items-center gap-6 w-full">
                  <div className="flex-shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden shadow-inner">
                    <img
                      src={
                        item.products?.image_url ||
                        "https://placehold.co/100x100/E2E8F0/FFF?text=No+Image"
                      }
                      alt={item.products.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-weight-500 text-slate-900 ">
                      {item.products?.name}
                    </h3>
                    <p className="text-sm text-slate-500  mt-1">
                      {t("quantity")}: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 sm:mt-0 sm:ml-auto">
                  <p className="text-xl font-weight-700 text-slate-900  w-28 text-right">
                    EGP{" "}
                    {(item.quantity * (item.products?.price || 0)).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors duration-300"
                    aria-label={t("remove")}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Section */}
          <div className="mt-12 lg:mt-0 lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:sticky lg:top-8 border border-slate-100 ">
              <h2 className="text-2xl font-bold mb-6 border-b border-slate-200  pb-4">
                {t("subtotal")}
              </h2>
              <div className="flex justify-between items-center text-slate-700  mb-4">
                <span className="text-lg">{t("subtotal")}</span>
                <span className="text-lg font-semibold text-slate-900 ">
                  EGP {subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-500  mb-6">
                {t("checkoutInfo")}
              </p>
              <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-full text-lg shadow-lg hover:bg-slate-700 transition-colors duration-300">
                {t("proceedToCheckout")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
