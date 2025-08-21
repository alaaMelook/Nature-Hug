"use client";
import React, { useEffect, useState } from "react";
import { ShoppingCart, Star, Box, Rocket, Heart, Zap } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import "./globals.css";

interface Product {
  id: string | number;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  discount: number | null;
  quantity: number | null;
  image_url: string | null;
}

const features = [
  {
    icon: Heart,
    title: "Curated Selection",
    description: "Hand-picked items for quality and style.",
  },
  {
    icon: Rocket,
    title: "Fast Shipping",
    description: "Your order ships within 24 hours.",
  },
  {
    icon: Box,
    title: "Secure Packaging",
    description: "Items are securely packed and protected.",
  },
  {
    icon: Zap,
    title: "Exclusive Deals",
    description: "Access to special promotions and discounts.",
  },
];

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("products").select("*");

        if (error) {
          setError(error.message);
          console.error("Supabase error:", error);
          return;
        }

        const formattedProducts: Product[] = (data || []).map(
          (product: any) => ({
            ...product,
            price: Number(product.price) || 0,
            id: product.id.toString(),
          })
        );

        setProducts(formattedProducts);
      } catch (err) {
        setError("Failed to fetch products");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderProductContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
          <p className="font-semibold">Error loading products:</p>
          <p>{error}</p>
        </div>
      );
    }
    if (products.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">No products available</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x400/D1D5DB/4B5563?text=Image+Not+Found";
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              {product.discount && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{product.discount}%
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.name}
              </h3>
              {/* {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
              )} */}
              <div className="flex items-center mb-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-2 text-sm text-gray-500">(4.5)</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold text-default">
                  {product.price.toFixed(2)} EGP
                </p>
                {(product.quantity == null || product.quantity == 0) && (
                  <span className="text-sm text-gray-500">Out Of Stock</span>
                )}
              </div>
              <button className="mt-4 w-full bg-primary text-white py-2.5 rounded-lg shadow-md hover:bg-primary transition-colors duration-300 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
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
              Where every ingredient
              <br className="hidden md:inline" />
              is a promise.
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              A gentle hug for your skin from nature itself.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-primary text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary transition-colors duration-300">
                Shop Now
              </button>
              <button className="bg-white text-gray-800 font-semibold px-6 py-3 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Product Grid Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">
              Featured Products
            </h2>
            {renderProductContent()}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-100 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-white p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <feature.icon className="w-10 h-10 text-primary" />
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
      <footer className="bg-light font-semibold text-default py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm md:text-base">
            &copy; 2025 Hug Nature. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
