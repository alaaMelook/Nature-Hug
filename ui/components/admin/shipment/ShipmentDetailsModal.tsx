'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Package, MapPin, Calendar, User, Phone, FileText, Truck, DollarSign, Loader2 } from 'lucide-react';
import { getShipmentDetailsAction } from '@/ui/hooks/admin/shippingActions';

interface ShipmentDetailsModalProps {
    awb: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ShipmentDetailsModal({ awb, isOpen, onClose }: ShipmentDetailsModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && awb) {
            fetchDetails(awb);
        } else {
            setDetails(null);
            setError(null);
        }
    }, [isOpen, awb]);

    const fetchDetails = async (awb: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getShipmentDetailsAction(awb);
            if (result.success) {
                setDetails(result.data);
            } else {
                setError(result.error || t("failedToFetchDetails"));
            }
        } catch (err) {
            setError(t("errorOccurred"));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Truck className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{t("shipmentDetails")}</h2>
                            <p className="text-xs text-gray-500 font-mono">{awb}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p className="text-sm">{t("loadingDetails")}</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
                            <FileText className="h-8 w-8 mb-2 opacity-50" />
                            <p className="font-medium">{error}</p>
                            <button onClick={() => awb && fetchDetails(awb)} className="mt-4 text-sm underline hover:text-red-700">
                                {t("tryAgain")}
                            </button>
                        </div>
                    ) : details ? (
                        <div className="space-y-6">
                            {/* Status Banner */}
                            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider mb-1">{t("currentStatus")}</p>
                                    <p className="text-lg font-bold text-primary-900">{details.StatusNameE || details.status}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-primary-600 mb-1">{t("lastUpdate")}</p>
                                    <p className="text-sm font-medium text-primary-900">
                                        {new Date(details.DeliveryDate || details.PickupDate || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sender Info */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {t("senderDetails")}
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                                        <p className="text-gray-700"><span className="text-gray-400 block text-xs">{t("name")}</span> {details.FromContactPerson || "N/A"}</p>
                                        <p className="text-gray-700"><span className="text-gray-400 block text-xs">{t("phone")}</span> {details.FromPhone || "N/A"}</p>
                                        <p className="text-gray-700"><span className="text-gray-400 block text-xs">{t("address")}</span> {details.FromAddress || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Receiver Info */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        {t("receiverDetails")}
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                                        <p className="text-gray-700"><span className="text-gray-400 block text-xs">{t("name")}</span> {details.ToConsigneeName || "N/A"}</p>
                                        <p className="text-gray-700"><span className="text-gray-400 block text-xs">{t("phone")}</span> {details.ToPhone || details.ToMobile || "N/A"}</p>
                                        <p className="text-gray-700"><span className="text-gray-400 block text-xs">{t("address")}</span> {details.ToAddress || "N/A"}</p>
                                        <p className="text-gray-700"><span className="text-gray-400 block text-xs">{t("city")}</span> {details.ToCityName || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Package Info */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-400" />
                                    {t("packageInfo")}
                                </h3>
                                <div className="bg-white border border-gray-100 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">{t("pieces")}</p>
                                        <p className="font-medium text-gray-900">{details.Pieces || 1}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">{t("weight")}</p>
                                        <p className="font-medium text-gray-900">{details.Weight || 0} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">{t("cod")}</p>
                                        <p className="font-bold text-green-600">{t('{{price, currency}}', { price: details.COD })}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">{t("contents")}</p>
                                        <p className="font-medium text-gray-900 truncate" title={details.Contents}>{details.Contents || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Data */}
                            {details.SpecialInstuctions && (
                                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
                                    <p className="font-semibold mb-1 flex items-center gap-2">
                                        <FileText className="h-3 w-3" /> {t("specialInstructions")}
                                    </p>
                                    <p>{details.SpecialInstuctions}</p>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Package className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-sm">{t("noDetailsAvailable")}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                    >
                        {t("close")}
                    </button>
                </div>
            </div>
        </div>
    );
}
