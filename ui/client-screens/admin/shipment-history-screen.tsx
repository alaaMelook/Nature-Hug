"use client";

import { useState, useEffect } from 'react';
import { getShipmentHistoryAction } from '@/ui/hooks/admin/shippingActions';
import { useTranslation } from 'react-i18next';
import { Loader2, Calendar, Search, MapPin, Package, DollarSign, Truck, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useSupabase } from '@/ui/hooks/useSupabase';
import { ShipmentHistoryItem } from '@/domain/entities/shipment/shipmentHistoryItem';
import { ShipmentDetailsModal } from '@/ui/components/admin/shipment/ShipmentDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';

export function ShipmentHistoryScreen() {
    const { t } = useTranslation();
    const { member } = useSupabase();
    const [loading, setLoading] = useState(false);
    const [shipments, setShipments] = useState<ShipmentHistoryItem[]>([]);
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [mounted, setMounted] = useState(false);
    const [selectedAwb, setSelectedAwb] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fix hydration mismatch by setting dates only on client mount
    useEffect(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        setToDate(end.toISOString().split('T')[0]);
        setFromDate(start.toISOString().split('T')[0]);
        setMounted(true);
        // Optionally fetch initial data
        // handleSearch(start, end);
    }, []);

    const handleSearch = async () => {
        if (!fromDate || !toDate) return;

        setLoading(true);
        try {

            if (!member) return;
            const result = await getShipmentHistoryAction(new Date(fromDate), new Date(toDate));
            if (result.success) {
                let sortedShipments = result.data?.sort((a, b) => new Date(b.PickupDate).getTime() - new Date(a.PickupDate).getTime());
                if (member?.role !== "admin") {
                    sortedShipments = sortedShipments?.filter((shipment) => shipment.StatusNameE !== "Delivered");
                }
                if (sortedShipments?.length === 0) {
                    toast.info(t("noShipmentsFound"));
                }

                setShipments(sortedShipments || []);
                if (!result.data || result.data.length === 0) {
                    toast.info(t("noShipmentsFound"));
                }
            } else {
                toast.error(result.error || t("failedToFetchHistory"));
            }
        } catch (error) {
            console.error(error);
            toast.error(t("errorOccurred"));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (awb: string) => {
        setSelectedAwb(awb);
        setIsModalOpen(true);
    };

    // Trigger search when dates are set initially
    useEffect(() => {

        if (mounted && fromDate && toDate && shipments.length === 0) {
            handleSearch();
        }
    }, [mounted, member]);

    if (!mounted) return null; // Prevent hydration mismatch

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || "";
        if (s.includes('delivered')) return 'bg-green-100 text-green-800 border-green-200';
        if (s.includes('returned') || s.includes('cancelled')) return 'bg-red-100 text-red-800 border-red-200';
        if (s.includes('shipped') || s.includes('processing')) return 'bg-blue-100 text-blue-800 border-blue-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-6 max-w-7xl mx-auto space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Truck className="h-8 w-8 text-primary-600" />
                    {t("shipmentHistory")}
                </h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("fromDate")}</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("toDate")}</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-sm shadow-primary-600/20"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                        {t("search")}
                    </button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("awb")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("pickupDate")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("deliveryDate")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("consignee")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("status")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("cod")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("audit")}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("details")}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                                {shipments.map((shipment, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => handleViewDetails(shipment.AWB)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{shipment.AWB}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {t("{{date, datetime}}", { date: new Date(shipment.PickupDate) }).split(",").map((date) => <p key={date}>{date}</p>)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {shipment.DeliveryDate && shipment.DeliveryTime ?
                                                t("{{date, datetime}}", {
                                                    // Combine the date and time strings with a 'T' separator to create a valid ISO string
                                                    date: new Date(`${shipment.DeliveryDate}T${shipment.DeliveryTime}`),
                                                }).split(",").map((date) => <p key={date}>{date}</p>)
                                                : <p className="text-gray-500 text-center text-xl">
                                                    -
                                                </p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{shipment.ToConsigneeName}</span>
                                                <span className="text-xs text-gray-500">{shipment.ToCityName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(shipment.StatusNameE)}`}>
                                                {shipment.StatusNameE}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {t('{{price, currency}}', { price: shipment.COD })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {shipment.AuditDate ?
                                                t("{{date, datetime}}", {
                                                    // Combine the date and time strings with a 'T' separator to create a valid ISO string
                                                    date: new Date(shipment.AuditDate),
                                                }).split(",").map((date) => <p key={date}>{date}</p>)
                                                : <p className="text-gray-500 text-center text-xl">
                                                    -
                                                </p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleViewDetails(shipment.AWB); }}
                                                className="text-primary-600 hover:text-primary-800 font-medium text-xs flex items-center gap-1"
                                            >
                                                <FileText className="h-3 w-3" /> {t("view")}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {shipments.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Package className="h-12 w-12 mb-3 opacity-20" />
                                            <p className="text-base font-medium text-gray-500">{t("noShipmentsFound")}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                <AnimatePresence>
                    {shipments.map((shipment, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 active:scale-[0.99] transition-transform"
                            onClick={() => handleViewDetails(shipment.AWB)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary-50 rounded-lg">
                                        <Package className="h-5 w-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{shipment.AWB}</p>
                                        <p className="text-xs text-gray-500">{shipment.DeliveryDate || shipment.PickupDate}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(shipment.StatusNameE)}`}>
                                    {shipment.StatusNameE}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-50">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {t("consignee")}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 truncate">{shipment.ToConsigneeName}</p>
                                    <p className="text-xs text-gray-500 truncate">{shipment.ToCityName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> {t("cod")}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">{t('{{price, currency}}', { price: shipment.COD })}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-4">
                                    <span>{shipment.Pieces} {t("pieces")}</span>
                                    <span>{shipment.Weight} kg</span>
                                </div>
                                <button className="text-primary-600 font-medium flex items-center gap-1">
                                    {t("viewDetails")}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {shipments.length === 0 && !loading && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <Package className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-base font-medium text-gray-500">{t("noShipmentsFound")}</p>
                        </div>
                    </div>
                )}
            </div>

            <ShipmentDetailsModal
                awb={selectedAwb}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </motion.div>
    );
}
