"use client";

import { PromoCode } from "@/domain/entities/database/promoCode";
import { Tag, Clock, Gift, Sparkles, Percent, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

interface PromoCodesSectionProps {
    promoCodes: PromoCode[];
}

export function PromoCodesSection({ promoCodes }: PromoCodesSectionProps) {
    const { t, i18n } = useTranslation();

    if (!promoCodes || promoCodes.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 px-6 py-4 border-b border-amber-200">
                <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    {t("yourExclusivePromoCodes") || "Your Exclusive Promo Codes"}
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                </h2>
                <p className="text-sm text-amber-700 mt-1">
                    {t("exclusivePromoCodesDesc") || "These codes are exclusively available for you!"}
                </p>
            </div>

            <div className="p-6 space-y-4">
                {promoCodes.map((promo) => (
                    <PromoCodeCard key={promo.id} promoCode={promo} />
                ))}
            </div>
        </div>
    );
}

function PromoCodeCard({ promoCode }: { promoCode: PromoCode }) {
    const { t, i18n } = useTranslation();
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        if (!promoCode.valid_until) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiry = new Date(promoCode.valid_until!).getTime();
            const diff = expiry - now;

            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${minutes}m`);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [promoCode.valid_until]);

    const getDiscountText = () => {
        if (promoCode.is_bogo) {
            return `${t("buy")} ${promoCode.bogo_buy_count} ${t("get")} ${promoCode.bogo_get_count} ${t("free")}`;
        }
        if (promoCode.free_shipping && promoCode.percentage_off === 0) {
            return t("freeShipping") || "Free Shipping";
        }
        if (promoCode.free_shipping) {
            return `${promoCode.percentage_off}% ${t("off")} + ${t("freeShipping")}`;
        }
        return `${promoCode.percentage_off}% ${t("off") || "OFF"}`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(promoCode.code);
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-50 via-white to-primary-50 rounded-xl border-2 border-dashed border-primary-300 p-4 hover:border-primary-500 transition-all group">
            {/* Exclusive Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                {t("exclusiveForYou") || "Exclusive for You"}
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Code Section */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-5 h-5 text-primary-600" />
                        <button
                            onClick={copyToClipboard}
                            className="text-xl font-bold font-mono text-primary-800 bg-primary-100 px-3 py-1 rounded-lg hover:bg-primary-200 transition-colors cursor-pointer"
                            title={t("clickToCopy") || "Click to copy"}
                        >
                            {promoCode.code}
                        </button>
                    </div>

                    {/* Discount Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {promoCode.is_bogo ? (
                                <Gift className="w-4 h-4" />
                            ) : promoCode.free_shipping ? (
                                <Truck className="w-4 h-4" />
                            ) : (
                                <Percent className="w-4 h-4" />
                            )}
                            {getDiscountText()}
                        </span>

                        {promoCode.all_cart && (
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                {t("appliesToEntireCart") || "Applies to entire cart"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Countdown Timer */}
                {timeLeft && (
                    <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                        <Clock className="w-5 h-5 text-red-600 animate-pulse" />
                        <div className="text-center">
                            <div className="text-xs text-red-600 font-medium">
                                {t("expiresIn") || "Expires in"}
                            </div>
                            <div className="text-lg font-bold text-red-700">
                                {timeLeft}
                            </div>
                        </div>
                    </div>
                )}

                {!promoCode.valid_until && (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                        <span className="text-sm text-green-700 font-medium">
                            {t("noExpiry") || "No Expiry"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
