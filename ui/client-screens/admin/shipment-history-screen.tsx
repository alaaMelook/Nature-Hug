'use client';

import { useState } from 'react';
import { getShipmentHistoryAction } from '@/ui/hooks/admin/orders';
import { useTranslation } from 'react-i18next';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export function ShipmentHistoryScreen() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [shipments, setShipments] = useState<any[]>([]);
    const [fromDate, setFromDate] = useState<string>(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const result = await getShipmentHistoryAction(new Date(fromDate), new Date(toDate));
            if (result.success) {
                setShipments(result.data || []);
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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">{t("shipmentHistory")}</h1>

            <div className="flex items-end gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("fromDate")}</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("toDate")}</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Calendar size={16} />}
                    {t("search")}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("awb")}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("date")}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("status")}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("customer")}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("amount")}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {shipments.map((shipment, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.AWB || shipment.awb}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(shipment.Date || shipment.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shipment.Status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            shipment.Status === 'Returned' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {shipment.Status || shipment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.ClientName || shipment.customer_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.CODAmount || shipment.amount}</td>
                            </tr>
                        ))}
                        {shipments.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    {t("noShipmentsFound")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
