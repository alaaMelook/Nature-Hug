"use client";

import { useTranslation } from "./TranslationProvider";
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
    <div className="flex items-center justify-center space-x-4 bg-gray-100 rounded-full px-3 py-1.5 w-30">
      <button
        onClick={quantity < 1 ? undefined : onDecrease}
        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1"
        aria-label={t("decreaseQuantity")}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="text-gray-800 font-medium text-lg">{quantity}</span>
      <button
        onClick={onIncrease}
        className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1"
        aria-label={t("increaseQuantity")}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
