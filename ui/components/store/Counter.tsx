"use client";

import { useTranslation } from "react-i18next";
import { Minus, Plus } from "lucide-react";
export default function Counter({
  quantity,
  onIncrease,
  onDecrease,
}: Readonly<{
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}>) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center sm:space-x-4 space-x-2 bg-gray-100 rounded-full px-3 py-1.5 sm:w-30 w-20">
      <button
        onClick={quantity < 1 ? undefined : onDecrease}
        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1"
        aria-label={t("decreaseQuantity")}
      >
        <Minus className="sm:w-4 sm:h-4 w-3 h-3" />
      </button>
      <span className="text-gray-800 font-medium md:text-lg text-sm ">{quantity}</span>
      <button
        onClick={onIncrease}
        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1"
        aria-label={t("increaseQuantity")}
      >
        <Plus className="sm:w-4 sm:h-4 w-3 h-3" />
      </button>
    </div>
  );
}
