"use client";
import {Loader2, Plug} from "lucide-react";
import {useEffect, useState} from "react";
import {Login} from "@/domain/use-case/shipments/login";
import {GetDashboardLink} from "@/domain/use-case/shipments/getDashboardLink";


export default function ShipmentDashboard() {
    const [link, setLink] = useState<string | null>()
    const [reLogin, setReLogin] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        async function getLink() {
            setLoading(true)
            await new Login().execute();
            setLink(new GetDashboardLink().execute());
            setLoading(false);
            if (reLogin) setReLogin(false);
        }

        getLink();
    }, [reLogin]);
    if (!link) return (
        <div className="flex items-center justify-center h-96">
            <button
                className="px-4 py-2 bg-green-600 text-white rounded-md"
                onClick={() => {
                    setReLogin(true);
                }}
                disabled={loading}
            >
                {loading ? (
                    <Loader2 className="inline-block animate-spin mr-2" size={16}/>
                ) : (
                    <Plug className="inline-block mr-2" size={16}/>
                )}
                {loading ? "Logging in..." : "Login to Shipment Service"}
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
