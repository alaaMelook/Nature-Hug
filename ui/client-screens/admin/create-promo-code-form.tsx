"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPromoCodeAction } from "@/ui/hooks/admin/promo-codes";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";
import { Save, ArrowLeft, Check, Search } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { PromoCode } from "@/domain/entities/database/promoCode";
import { motion } from "framer-motion";

interface CreatePromoCodeFormProps {
    products: ProductAdminView[];
}

export default function CreatePromoCodeForm({ products }: CreatePromoCodeFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t, i18n } = useTranslation();
    // Form State
    const [code, setCode] = useState("");
    const [isBogo, setIsBogo] = useState(false);
    const [percentageOff, setPercentageOff] = useState(0);
    const [bogoBuy, setBogoBuy] = useState(1);
    const [bogoGet, setBogoGet] = useState(1);
    const [allCart, setAllCart] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createPromoCodeAction({
                code,
                is_bogo: isBogo,
                percentage_off: isBogo ? 0 : percentageOff,
                bogo_buy_count: isBogo ? bogoBuy : 0,
                bogo_get_count: isBogo ? bogoGet : 0,
                all_cart: allCart,
                eligible_product_slugs: allCart ? [] : selectedProducts,
            } as PromoCode);

            if (result.success) {
                router.push("/admin/promo-codes");
                router.refresh();
            } else {
                alert(result.error || t("failedToCreatePromo"));
            }
        } catch (error) {
            console.error("Failed to create promo code:", error);
            alert(t("failedToCreatePromo"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleProduct = (slug: string) => {
        setSelectedProducts(prev =>
            prev.includes(slug)
                ? prev.filter(id => id !== slug)
                : [...prev, slug]
        );
    };

    const filteredProducts = products.filter(p =>
        p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category_name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category_name_ar?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto space-y-6 pb-12"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/promo-codes"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t("createPromoCode")}</h1>
                        <p className="text-sm text-gray-500">{t("addPromoCodeDesc")}</p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 font-medium"
                >
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            {t("saving")}
                        </span>
                    ) : (
                        <span className="flex items-center">
                            <Save className="h-4 w-4 mr-2" />
                            {t("createCode")}
                        </span>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("basicInformation")}</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("promoCodes")}</label>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder={t("promoCodePlaceholder")}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase font-mono tracking-wider"
                            />
                            <p className="text-xs text-gray-500 mt-1">{t("promoCodeHelp")}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <span className="block text-sm font-medium text-gray-900">{t("bogoOffer")}</span>
                                    <span className="block text-xs text-gray-500">{t("bogoDesc")}</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isBogo}
                                        onChange={(e) => setIsBogo(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </div>
                            </label>
                        </div>

                        {isBogo ? (
                            <div className="grid grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg border border-purple-100">
                                <div>
                                    <label className="block text-sm font-medium text-purple-900 mb-1">{t("buyQuantity")}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={bogoBuy}
                                        onChange={(e) => setBogoBuy(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-900 mb-1">{t("getQuantity")}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={bogoGet}
                                        onChange={(e) => setBogoGet(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("discountPercentage")}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        value={percentageOff}
                                        onChange={(e) => setPercentageOff(parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Scope Selection */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("applicability")}</h2>

                        <div className="space-y-3">
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${allCart ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={allCart}
                                    onChange={() => setAllCart(true)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-medium text-gray-900">{t("entireCart")}</span>
                                    <span className="block text-xs text-gray-500">{t("entireCartDesc")}</span>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${!allCart ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={!allCart}
                                    onChange={() => setAllCart(false)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-medium text-gray-900">{t("specificItems")}</span>
                                    <span className="block text-xs text-gray-500">{t("specificItemsDesc")}</span>
                                </div>
                            </label>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Product Selection (Conditional) */}
                {!allCart && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]"
                    >
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-2">{t("selectProducts")}</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t("searchProducts")}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredProducts.map(product => (
                                <div key={product.variant_id ?? product.product_id} className="space-y-1">
                                    <div
                                        onClick={() => toggleProduct(product.slug)}
                                        className={`flex items-center p-2 rounded-lg cursor-pointer text-sm ${selectedProducts.includes(product.slug) ? 'bg-primary-50 text-primary-900' : 'hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${selectedProducts.includes(product.slug) ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'}`}>
                                            {selectedProducts.includes(product.slug) && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-medium">{i18n.language === 'ar' ? product.name_ar : product.name_en}</span>

                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                            {t("productsSelected", { count: selectedProducts.length })}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.form>
    );
}
