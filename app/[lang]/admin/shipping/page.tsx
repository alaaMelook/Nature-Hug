"use client";
import { Loader2, Plug } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getDashboardLinkAction } from "@/ui/hooks/admin/shippingActions";
import { useTranslation } from "react-i18next";


export default function ShipmentDashboard() {
    const [link, setLink] = useState<string | null>()
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation();
    const open = useCallback(async () => {
        setLoading(true)
        const result = await getDashboardLinkAction();
        if (result.success) {
            setLink(result.link);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        open();
    }, []);
    if (!link) return (
        <div className="flex items-center justify-center h-96">
            <button
                className="px-4 py-2 bg-green-600 text-white rounded-md"
                onClick={() => {
                    open();
                }}
                disabled={loading}
            >
                {loading ? (
                    <Loader2 className="inline-block animate-spin mr-2" size={16} />
                ) : (
                    <Plug className="inline-block mr-2" size={16} />
                )}
                {loading ? t("loggingIn") : t("login")}
            </button>
        </div>
    );
    return (
        <iframe
            src={link}
            width="100%"
            height="800"
            allowFullScreen
            className="border-none rounded-xl shadow-md"
        />
    );
}
