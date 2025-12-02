import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface VariantOption {
    id: number;
    name: string;
    currentStock: number;
}

interface StockUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number, variantId?: number) => Promise<void>;
    title: string;
    itemName: string;
    currentStock?: number;
    variants?: VariantOption[];
}

export function StockUpdateModal({ isOpen, onClose, onConfirm, title, itemName, currentStock, variants }: StockUpdateModalProps) {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState<number>(0);
    const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(variants && variants.length > 0 ? variants[0].id : undefined);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (quantity <= 0) return;
        setLoading(true);
        await onConfirm(quantity, selectedVariantId);
        setLoading(false);
        onClose();
        setQuantity(0);
    };

    const activeStock = variants
        ? variants.find(v => v.id === selectedVariantId)?.currentStock
        : currentStock;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("item")}</label>
                        <p className="text-gray-900 font-medium">{itemName}</p>
                    </div>

                    {variants && variants.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("variant")}</label>
                            <select
                                value={selectedVariantId}
                                onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            >
                                {variants.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.name} (Stock: {v.currentStock})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("quantityToAdd")}
                            <span className="text-xs text-gray-500 ml-2">
                                ({t("current")}: {activeStock})
                            </span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-5"
                            placeholder="0"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            {t("cancel")}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || quantity <= 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? t("processing") : t("addStock")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
