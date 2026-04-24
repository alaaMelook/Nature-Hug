'use client';

import { useEffect, useState } from 'react';
import { getShipmentDetailsAction } from '@/ui/hooks/admin/shippingActions';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

export function ShipmentTracking({ awb }: { awb: string }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchDetails = async () => {
            try {
                const result = await getShipmentDetailsAction(awb);
                if (mounted) {
                    if (result.success) {
                        setDetails(result.data);
                    } else {
                        setError(result.error || 'Failed to fetch tracking details');
                    }
                }
            } catch (err) {
                if (mounted) setError('An error occurred');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchDetails();
        return () => { mounted = false; };
    }, [awb]);

    if (loading) return <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={16} /> {t("loadingTracking")}</div>;
    if (error) return <div className="text-red-500 text-sm">{error}</div>;
    if (!details) return null;

    // Adjust based on actual API response structure
    // Assuming details contains status history or current status
    return (
        <div className="space-y-2">
            {details.shipmentInfo && details.shipmentInfo.length > 0 && (
                <>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t("status")}:</span>
                        <span className="font-medium">{details.shipmentInfo[0].StatusName || "N/A"}</span>
                    </div>
                    {details.shipmentInfo[0].RunnerName && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t("courier") || "Courier"}:</span>
                            <span className="font-medium">{details.shipmentInfo[0].RunnerName}</span>
                        </div>
                    )}
                    {details.shipmentInfo[0].RunnerMobile && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t("courierPhone") || "Phone"}:</span>
                            <span className="font-medium direction-ltr">{details.shipmentInfo[0].RunnerMobile}</span>
                        </div>
                    )}
                </>
            )}
            {details.tracking && Array.isArray(details.tracking) && details.tracking.length > 0 && (
                <div className="mt-2 border-t pt-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">{t("history")}</p>
                    <ul className="space-y-1">
                        {details.tracking.map((event: any, index: number) => (
                            <li key={index} className="text-xs text-gray-600 flex justify-between">
                                <span>{event.StatusName || event.StatusDescription}</span>
                                <span>{new Date(event.AuditDate).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
