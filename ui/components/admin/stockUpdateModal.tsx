import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, AlertTriangle, Package, Loader2 } from "lucide-react";
import { getProductMaterialsPreview, MaterialPreviewData, MaterialPreviewItem } from "@/ui/hooks/admin/inventory";

interface StockUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number) => Promise<void>;
    title: string;
    itemName: string;
    currentStock?: number;
    productId?: number;
    variantId?: number | null;
}

export function StockUpdateModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    itemName,
    currentStock,
    productId,
    variantId
}: StockUpdateModalProps) {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState<MaterialPreviewData | null>(null);

    // Fetch material preview when modal opens
    useEffect(() => {
        if (isOpen && productId) {
            setPreviewLoading(true);
            getProductMaterialsPreview(productId, variantId || null)
                .then(data => {
                    setPreviewData(data);
                    setPreviewLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch material preview:", err);
                    setPreviewLoading(false);
                });
        }
    }, [isOpen, productId, variantId]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setQuantity(0);
            setPreviewData(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (quantity <= 0) return;
        setLoading(true);
        await onConfirm(quantity);
        setLoading(false);
        onClose();
        setQuantity(0);
    };

    const hasMaterials = previewData && previewData.materials.length > 0;
    const maxUnits = previewData?.maxProducibleUnits ?? Infinity;
    const isOverLimit = hasMaterials && quantity > maxUnits;

    // Check which materials would run out
    const insufficientMaterials = hasMaterials
        ? previewData.materials.filter(m => m.grams_per_unit * quantity > m.available_stock)
        : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 m-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
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

                    {/* Material Preview Section */}
                    {previewLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                            <span className="ml-2 text-gray-500">{t("loadingMaterials") || "Loading materials..."}</span>
                        </div>
                    ) : hasMaterials ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-700">{t("materialsRequired") || "Materials Required"}</h4>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    {t("maxUnits") || "Max"}: {maxUnits === Infinity ? "∞" : maxUnits} {t("units") || "units"}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {previewData.materials.map((material) => {
                                    const totalNeeded = material.grams_per_unit * quantity;
                                    const remaining = material.available_stock - totalNeeded;
                                    const isInsufficient = remaining < 0;

                                    return (
                                        <div
                                            key={material.material_id}
                                            className={`flex items-center justify-between p-2 rounded-lg ${isInsufficient ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'}`}
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-800">{material.material_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {material.grams_per_unit}{material.measurement_unit}/{t("unit") || "unit"} × {quantity || 0} =
                                                    <span className={`font-medium ml-1 ${isInsufficient ? 'text-red-600' : 'text-gray-700'}`}>
                                                        {totalNeeded}{material.measurement_unit}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    {t("available") || "Available"}: <span className="font-medium">{material.available_stock}{material.measurement_unit}</span>
                                                </p>
                                                <p className={`text-xs ${isInsufficient ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                    {t("remaining") || "Remaining"}: {remaining}{material.measurement_unit}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm text-yellow-700">{t("noMaterialsLinked") || "No materials linked to this product"}</span>
                        </div>
                    )}

                    {/* Quantity Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("quantityToAdd")}
                            <span className="text-xs text-gray-500 ml-2">
                                ({t("current")}: {currentStock})
                            </span>
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min="1"
                            max={hasMaterials ? maxUnits : undefined}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className={`w-full border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-4 py-2 ${isOverLimit ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="0"
                        />
                        {isOverLimit && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {t("exceedsMaxUnits") || `Cannot exceed ${maxUnits} units due to material availability`}
                            </p>
                        )}
                    </div>

                    {/* Warning for insufficient materials */}
                    {insufficientMaterials.length > 0 && quantity > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-red-700 mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">{t("insufficientMaterials") || "Insufficient Materials"}</span>
                            </div>
                            <ul className="text-xs text-red-600 space-y-1">
                                {insufficientMaterials.map(m => (
                                    <li key={m.material_id}>
                                        • {m.material_name}: {t("need") || "Need"} {m.grams_per_unit * quantity}{m.measurement_unit}, {t("have") || "have"} {m.available_stock}{m.measurement_unit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

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
                            disabled={loading || quantity <= 0 || isOverLimit}
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
