"use client";
import { useDashboardLink } from "@/ui/hooks/shipment/useDashboardLink";
import { useLoginAction } from "@/ui/hooks/shipment/useLoginAction";
import { Plug, Loader2 } from "lucide-react";


export default function ShipmentDashboard() {
    const powerBiLink = useDashboardLink();
    const { refetch, isFetching } = useLoginAction();

    if (!powerBiLink) return (
        <div className="flex items-center justify-center h-96">
            <button
                className="px-4 py-2 bg-green-600 text-white rounded-md"
                onClick={() => {
                    refetch().then(() => {
                        window.location.reload();
                    });
                }}
                disabled={isFetching}
            >
                {isFetching ? (
                    <Loader2 className="inline-block animate-spin mr-2" size={16} />
                ) : (
                    <Plug className="inline-block mr-2" size={16} />
                )}
                {isFetching ? "Logging in..." : "Login to Shipment Service"}
            </button>
        </div>
    );
    return (
        <iframe
            src={powerBiLink}
            width="100%"
            height="800"
            allowFullScreen
            className="border-none rounded-xl shadow-md"
        />
    );
}
