"use client";

import { useProfileManager } from "@/ui/hooks/store/useProfileManager";
import { EditableAddressField, EditableAddressItem, EditablePhoneField } from "@/ui/components/editableFields";
import { ConfirmDialog } from "@/ui/components/confirmDialog";
import { Plus, User, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { Governorate } from "@/domain/entities/database/governorate";
import { PromoCode } from "@/domain/entities/database/promoCode";
import { useState } from "react";
import { deleteAddress, updateAddress } from "@/ui/hooks/store/useProfileActions";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { PromoCodesSection } from "@/ui/components/store/PromoCodesSection";

export function ProfileScreen({ profile, governorates, promoCodes = [] }: { profile: ProfileView, governorates: Governorate[], promoCodes?: PromoCode[] }) {
    const { t } = useTranslation();
    const {
        loading,
        newPhone,
        setNewPhone,
        editingPhone,
        setEditingPhone,
        newAddress,
        setNewAddress,
        editingAddress,
        setEditingAddress,
        handlePhoneSave,
        handlePhoneDelete,
        handleAddressSave,
        handleAddressDelete,
    } = useProfileManager(profile);

    const [confirmDelete, setConfirmDelete] = useState<{
        type: "phone" | "address";
        data: number | Partial<{ index: number, phone: string }>
    } | null>(null);

    // Get initials for avatar
    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 py-8 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Card with Avatar */}
                <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 p-8 shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <Sparkles className="absolute top-6 right-6 w-8 h-8 text-primary-300/50 animate-pulse" />

                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-primary-300/40 flex items-center justify-center shadow-xl">
                            <span className="text-4xl font-bold text-white">
                                {getInitials(profile?.name)}
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                                {profile?.name || t("profileScreen.title")}
                            </h1>
                            <p className="text-primary-100/90 text-lg flex items-center justify-center md:justify-start gap-2">
                                <Mail className="w-5 h-5" />
                                {profile?.email || "No email"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Promo Codes Section - Displayed prominently after header */}
                {promoCodes && promoCodes.length > 0 && (
                    <PromoCodesSection promoCodes={promoCodes} />
                )}

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Information Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-100 to-primary-200 px-6 py-4 border-b border-primary-200">
                            <h2 className="text-lg font-semibold text-primary-900 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                {t("profileScreen.name")}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    {t("profileScreen.name")}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
                                    <input
                                        type="text"
                                        value={profile?.name ?? ""}
                                        disabled
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-primary-200 bg-primary-50/50 text-gray-700 font-medium focus:outline-none focus:border-primary-400 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    {t("profileScreen.email")}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
                                    <input
                                        type="text"
                                        value={profile?.email ?? ""}
                                        disabled
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-primary-200 bg-primary-50/50 text-gray-700 font-medium focus:outline-none focus:border-primary-400 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Phone Numbers Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-100 to-primary-200 px-6 py-4 border-b border-primary-200">
                            <h2 className="text-lg font-semibold text-primary-900 flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                {t("profileScreen.phone", { index: "" })}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {profile?.phone?.map((p, index) => (
                                <EditablePhoneField
                                    key={index}
                                    label={t("profileScreen.phone", { index: profile?.phone.length > 1 ? index + 1 : "" })}
                                    value={p ?? ""}
                                    loading={loading}
                                    onChange={(val) => setEditingPhone({ index: index + 1, phone: val })}
                                    onSave={() => handlePhoneSave(editingPhone)}
                                    onDelete={() => setConfirmDelete({ type: "phone", data: { index: index + 1, phone: p } })}
                                />
                            ))}

                            {newPhone && (
                                <EditablePhoneField
                                    label={t("profileScreen.newPhone")}
                                    value={newPhone?.phone ?? ""}
                                    newItem
                                    loading={loading}
                                    onChange={(val) => setNewPhone({ index: (profile?.phone.length ?? 0) + 1, phone: val })}
                                    onSave={() => handlePhoneSave(newPhone)}
                                />
                            )}

                            {(profile?.phone?.length ?? 0) < 2 && !newPhone && (
                                <button
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white font-semibold hover:from-primary-800 hover:to-primary-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={() => setNewPhone({})}
                                >
                                    <Plus className="w-5 h-5" />
                                    {t("profileScreen.addPhone")}
                                </button>
                            )}

                            {(profile?.phone?.length ?? 0) === 0 && !newPhone && (
                                <p className="text-gray-400 text-center py-4 italic">
                                    لا توجد أرقام هاتف مسجلة
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Addresses Section */}
                <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-100 to-primary-200 px-6 py-4 border-b border-primary-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-primary-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            {t("profileScreen.addresses")}
                        </h2>
                        <button
                            onClick={() => setNewAddress({ address: "" })}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white text-sm font-semibold hover:from-primary-800 hover:to-primary-900 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="w-4 h-4" />
                            {t("profileScreen.addNewAddress")}
                        </button>
                    </div>

                    <div className="p-6">
                        {(profile?.address?.length ?? 0) === 0 && newAddress == null ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                                    <MapPin className="w-10 h-10 text-primary-400" />
                                </div>
                                <p className="text-gray-500 text-lg">{t("profileScreen.noAddresses")}</p>
                                <p className="text-gray-400 text-sm mt-1">أضف عنوانك الأول للتوصيل السريع</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {profile?.address?.map((a) => (
                                    <div key={a.id} className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 hover:shadow-md transition-shadow">
                                        <EditableAddressItem
                                            address={a}
                                            governorates={governorates}
                                            onDeleteAction={async (id) => {
                                                const res = await deleteAddress(id);
                                                if (res?.error) toast.error(res.error);
                                                else toast.success(t("profileScreen.addressDeleted"));
                                            }}
                                            onSaveAction={async (updated) => {
                                                const res = await updateAddress(updated);
                                                if (res?.error) toast.error(res.error);
                                                else toast.success(t("profileScreen.addressUpdated"));
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {newAddress != null && (
                            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-dashed border-primary-400">
                                <EditableAddressField
                                    label={t("profileScreen.newAddress")}
                                    key="new"
                                    address={newAddress}
                                    newItem={true}
                                    onChange={(value) => setNewAddress(value)}
                                    governorates={governorates}
                                    onSave={() => handleAddressSave(newAddress)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Confirm Delete Dialog --- */}
            <ConfirmDialog
                open={!!confirmDelete}
                title={t("profileScreen.confirmDelete", { type: confirmDelete?.type })}
                description=""
                onCancel={() => setConfirmDelete(null)}
                onConfirm={() => {
                    if (confirmDelete?.type === "phone") handlePhoneDelete(confirmDelete.data);
                    setConfirmDelete(null);
                }}
            />
        </div>
    );
}
