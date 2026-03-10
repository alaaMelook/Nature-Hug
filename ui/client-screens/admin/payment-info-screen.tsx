"use client";

import { useState, useEffect } from "react";
import { CreditCard, Wallet, Save, Loader2, CheckCircle2, AlertCircle, Upload, X, QrCode } from "lucide-react";

interface PaymentInfo {
    id?: number;
    method: string;
    account_number: string | null;
    account_name: string | null;
    qr_code_url: string | null;
}

export default function PaymentInfoScreen() {
    const [instapay, setInstapay] = useState<PaymentInfo>({ method: 'instapay', account_number: '', account_name: '', qr_code_url: '' });
    const [wallet, setWallet] = useState<PaymentInfo>({ method: 'wallet', account_number: '', account_name: '', qr_code_url: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPaymentInfo();
    }, []);

    const fetchPaymentInfo = async () => {
        try {
            const res = await fetch("/api/admin/payment-info");
            const data = await res.json();
            if (data.success) {
                data.data.forEach((info: PaymentInfo) => {
                    if (info.method === 'instapay') setInstapay(info);
                    if (info.method === 'wallet') setWallet(info);
                });
            }
        } catch (err) {
            console.error("Failed to fetch payment info:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (info: PaymentInfo) => {
        setSaving(info.method);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/admin/payment-info", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    method: info.method,
                    account_number: info.account_number,
                    account_name: info.account_name,
                    qr_code_url: info.qr_code_url,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(`${info.method === 'instapay' ? 'InstaPay' : 'Wallet'} info saved ✅`);
            } else {
                setError(data.error || "Failed to save");
            }
        } catch (err) {
            setError("Failed to save payment info");
        } finally {
            setSaving(null);
        }
    };

    const handleQrUpload = async (method: string, file: File) => {
        // Upload to Supabase storage or convert to data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            if (method === 'instapay') {
                setInstapay(prev => ({ ...prev, qr_code_url: dataUrl }));
            } else {
                setWallet(prev => ({ ...prev, qr_code_url: dataUrl }));
            }
        };
        reader.readAsDataURL(file);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Info</h1>
                    <p className="text-sm text-gray-500">Set up your InstaPay & Wallet details for POS</p>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" /> {error}
                    <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> {success}
                    <button onClick={() => setSuccess("")} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* InstaPay Card */}
            <PaymentCard
                title="InstaPay"
                icon={<CreditCard className="w-5 h-5 text-blue-600" />}
                color="blue"
                info={instapay}
                onChange={setInstapay}
                onSave={() => handleSave(instapay)}
                saving={saving === 'instapay'}
                onQrUpload={(file) => handleQrUpload('instapay', file)}
            />

            {/* Wallet Card */}
            <PaymentCard
                title="Wallet"
                icon={<Wallet className="w-5 h-5 text-purple-600" />}
                color="purple"
                info={wallet}
                onChange={setWallet}
                onSave={() => handleSave(wallet)}
                saving={saving === 'wallet'}
                onQrUpload={(file) => handleQrUpload('wallet', file)}
            />
        </div>
    );
}

function PaymentCard({
    title, icon, color, info, onChange, onSave, saving, onQrUpload
}: {
    title: string;
    icon: React.ReactNode;
    color: string;
    info: PaymentInfo;
    onChange: (info: PaymentInfo) => void;
    onSave: () => void;
    saving: boolean;
    onQrUpload: (file: File) => void;
}) {
    return (
        <div className={`bg-white rounded-2xl border border-${color}-100 shadow-sm overflow-hidden`}>
            <div className={`px-6 py-4 bg-${color}-50 border-b border-${color}-100 flex items-center gap-3`}>
                {icon}
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                        <input
                            type="text"
                            value={info.account_name || ''}
                            onChange={(e) => onChange({ ...info, account_name: e.target.value })}
                            placeholder={`${title} account name...`}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input
                            type="text"
                            value={info.account_number || ''}
                            onChange={(e) => onChange({ ...info, account_number: e.target.value })}
                            placeholder={`${title} number...`}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* QR Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR Code</label>
                    <div className="flex items-start gap-4">
                        {info.qr_code_url ? (
                            <div className="relative group">
                                <img
                                    src={info.qr_code_url}
                                    alt={`${title} QR`}
                                    className="w-32 h-32 rounded-xl border border-gray-200 object-contain bg-white"
                                />
                                <button
                                    onClick={() => onChange({ ...info, qr_code_url: '' })}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                                <QrCode className="w-8 h-8 text-gray-400" />
                                <span className="text-xs text-gray-500">Upload QR</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && onQrUpload(e.target.files[0])}
                                />
                            </label>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                            <p>Upload your {title} QR code image.</p>
                            <p>This will be shown in the POS when selecting {title}.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium shadow-md hover:bg-primary-700 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
