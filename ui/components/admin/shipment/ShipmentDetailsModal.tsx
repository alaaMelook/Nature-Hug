'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Package, MapPin, Calendar, User, Truck, AlertCircle, Loader2, CheckCircle2, Clock, CircleDot, FileText } from 'lucide-react';
import { getShipmentDetailsAction } from '@/ui/hooks/admin/shippingActions';
import { ShipmentDetailsEx } from '@/domain/entities/shipment/shipmentDetailsEx';
import { cn } from '@/lib/utils';


interface ShipmentDetailsModalProps {
    awb: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ShipmentDetailsModal({ awb, isOpen, onClose }: ShipmentDetailsModalProps) {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<ShipmentDetailsEx | null | undefined>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && awb) {
            fetchDetails(awb);
        } else {
            setDetails(null);
            setError(null);
        }
    }, [isOpen, awb]);

    const fetchDetails = async (awbCode: string) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching details for AWB:", awbCode);
            const result = await getShipmentDetailsAction(awbCode);
            if (result.success && result.data?.shipmentInfo?.[0]) {
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

    const info = details?.shipmentInfo?.[0];
    const tracking = details?.tracking.toReversed() || [];


    const getStatusIcon = (statusName: string) => {
        const lower = statusName.toLowerCase();
        if (lower.includes('delivered')) return <CheckCircle2 className="h-6 w-6 text-green-600" />;
        if (lower.includes('process') || lower.includes('courier')) return <Truck className="h-6 w-6 text-blue-600" />;
        if (lower.includes('new') || lower.includes('pending')) return <Clock className="h-6 w-6 text-gray-500" />;
        if (lower.includes('return') || lower.includes('cancel') || lower.includes('fail')) return <AlertCircle className="h-6 w-6 text-red-600" />;
        return <CircleDot className="h-6 w-6 text-primary-600" />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ring-1 ring-gray-900/5">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-50 rounded-xl">
                            <Package className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">{t("shipmentDetails")}</h2>
                            <p className="text-xs text-gray-500 font-mono mt-0.5 tracking-wide text-left dir-ltr">{awb}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary-500" />
                            <p className="text-sm font-medium">{t("loadingDetails")}</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="p-4 bg-red-50 rounded-full mb-4">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-gray-900 font-semibold mb-2">{t("errorFetchingDetails")}</h3>
                            <p className="text-gray-500 text-sm max-w-xs mb-6">{error}</p>
                            <button
                                onClick={() => awb && fetchDetails(awb)}
                                className="px-4 py-2 bg-white border border-gray-300 shadow-sm text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t("tryAgain")}
                            </button>
                        </div>
                    ) : info ? (
                        <div className="p-6 space-y-8">

                            {/* Status Section */}
                            <section>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                    </div>
                                    <div className="flex items-start gap-5 relative z-10">
                                        <div className="p-3 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
                                            {getStatusIcon(info.StatusName)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t("currentStatus")}</p>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{info.StatusName}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {t('{{date, datetime}}', { date: info.PickupDate })}
                                            </p>
                                        </div>
                                    </div>
                                    {info.Reason && (
                                        <div className="relative z-10 bg-red-50 border border-red-100 px-4 py-3 rounded-xl max-w-xs">
                                            <p className="text-xs font-bold text-red-700 uppercase mb-1">{t("statusReason")}</p>
                                            <p className="text-sm text-red-800 font-medium">{info.Reason}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Tracking Timeline */}
                            <section>
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary-600" />
                                    {t("trackingHistory")}
                                </h3>

                                {tracking.length > 0 ? (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                        <div className="relative pl-2 sm:pl-4 space-y-0">
                                            {/* Vertical Line */}

                                            {tracking.map((track, index) => {
                                                const isFirst = index === 0;
                                                return (
                                                    <>
                                                        <div key={index} className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0 group">
                                                            {/* Dot */}
                                                            <div className={cn(
                                                                "relative z-5 flex-shrink-0 w-3 h-3 mt-5 rounded-full border-2 bg-white ml-[14px] sm:ml-[22px] transition-all duration-300",
                                                                isFirst
                                                                    ? "border-primary-600 ring-4 ring-primary-200 scale-110"
                                                                    : "border-gray-300 bg-zinc-200"
                                                            )} />

                                                            {/* Content */}
                                                            <div className={cn(
                                                                "flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-3 rounded-xl transition-colors",
                                                                isFirst ? "bg-primary-50/30 -mt-2 -ml-2" : ""
                                                            )}>
                                                                <div className="space-y-1">
                                                                    <p className={cn("font-bold text-gray-900", isFirst ? "text-base" : "text-sm")}>
                                                                        {track.StatusName}
                                                                    </p>
                                                                    {track.City && track.City !== ", " && (
                                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <MapPin className="w-3 h-3" />
                                                                            {track.City}
                                                                        </p>
                                                                    )}
                                                                    {track.UpdateNotes && (
                                                                        <p className="text-xs text-gray-600 mt-1 max-w-md">{track.UpdateNotes}</p>
                                                                    )}
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <p className={cn("text-sm font-medium", isFirst ? "text-primary-700" : "text-gray-700")}>
                                                                        {t('{{date, date}}', { date: new Date(track.AuditDate) })}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {t('{{date, time}}', { date: new Date(track.AuditDate) })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-8 py-12 text-center text-gray-400">
                                        <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-3">
                                            <FileText className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="text-sm">{t("noTrackingHistory")}</p>
                                    </div>
                                )}
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Route Info */}
                                <section className="space-y-4">
                                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary-600" />
                                        {t("routeDetails")}
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-full">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400 font-medium uppercase mb-1">{t("from")}</p>
                                                <p className="text-sm font-bold text-gray-900">{info.FromCity || t("unknownCity")}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{info.FromBranch || "-"}</p>
                                            </div>
                                            <div className="flex flex-col items-center px-4">

                                                <div className="w-20 h-0.5 bg-gray-200 relative top-2">
                                                    <Truck className="w-4 h-4 text-gray-400 absolute -top-2 left-1/2 -translate-x-1/2 fill-white" />
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 text-right">
                                                <p className="text-xs text-gray-400 font-medium uppercase mb-1">{t("to")}</p>
                                                <p className="text-sm font-bold text-gray-900">{info.ToCity || t("unknownCity")}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{info.ToBranch || "-"}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">{t("sender")}</p>
                                                <p className="text-sm font-medium text-gray-900">Nature Hug</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">{t("receiver")}</p>
                                                <p className="text-sm font-medium text-gray-900">{info.ConsigneeName || info.RecipientName}</p>
                                                {[info.Phone1, info.Phone2, info.Phone3].filter(Boolean).map((phone, index) => (
                                                    <p key={index} className="text-xs text-gray-500 font-mono mt-0.5 dir-ltr text-right">{phone}</p>
                                                ))}
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{info.Address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Package & Logistics */}
                                <section className="space-y-4">
                                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-primary-600" />
                                        {t("packageDetails")}
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-full">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-xl">
                                                <p className="text-xs text-gray-500 mb-1">{t("pieces")}</p>
                                                <p className="font-bold text-gray-900">{info.Pcs || 1}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl">
                                                <p className="text-xs text-gray-500 mb-1">{t("weight")}</p>
                                                <p className="font-bold text-gray-900">{info.Weight} <span className="text-xs font-normal text-gray-500">kg</span></p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl col-span-2">
                                                <p className="text-xs text-gray-500 mb-1">{t("cod")}</p>
                                                <p className="font-bold text-green-600 text-lg">{t('{{price, currency}}', { price: info.COD })}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">{t("courier")}</p>
                                                    <p className="text-sm font-bold text-gray-900">{info.RunnerName?.split('[')[0] || t("unassigned")}</p>
                                                    {info.RunnerMobile && <p className="text-xs text-gray-400">{info.RunnerMobile}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Package className="h-16 w-16 mb-4 opacity-10" />
                            <p className="text-base font-medium">{t("noDetailsAvailable")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
