"use client";

import { useProfileManager } from "@/ui/hooks/store/useProfileManager";
import { EditableAddressField, EditableAddressItem, EditablePhoneField } from "@/ui/components/editableFields";
import { ConfirmDialog } from "@/ui/components/confirmDialog";
import { Plus } from "lucide-react";
import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { Governorate } from "@/domain/entities/database/governorate";
import { useState } from "react";
import { deleteAddress, updateAddress } from "@/ui/hooks/store/useProfileActions";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function ProfileScreen({ profile, governorates }: { profile: ProfileView, governorates: Governorate[] }) {
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

    return (
        <div className=" mx-30 my-10 p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-amber-800">{t("profileScreen.title")}</h1>

            {/* --- Basic Info --- */}
            <section className="space-y-4 mb-8">
                <label className="block text-sm font-medium text-gray-700">
                    {t("profileScreen.name")}
                    <input
                        type="text"
                        value={profile?.name ?? ""}
                        disabled
                        className="mt-1 block w-full rounded border-gray-300 bg-gray-100"
                    />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                    {t("profileScreen.email")}
                    <input
                        type="text"
                        value={profile?.email ?? ""}
                        disabled
                        className="mt-1 block w-full rounded border-gray-300 bg-gray-100"
                    />
                </label>

                {/* --- Phone Fields --- */}
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
                        className="px-4 py-2 rounded bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-60"
                        onClick={() => setNewPhone({})}
                    >
                        {t("profileScreen.addPhone")}
                    </button>
                )}
            </section>

            {/* --- Addresses --- */}
            <section className="mb-10">
                <h2 className="font-semibold mb-2">{t("profileScreen.addresses")}</h2>

                <ul className="mt-4 space-y-2">
                    {/* No addresses */}
                    {(profile?.address?.length ?? 0) === 0 && newAddress == null ? (
                        <li className="text-gray-500 text-sm">{t("profileScreen.noAddresses")}</li>
                    ) : (
                        profile?.address?.map((a) => (
                            <EditableAddressItem
                                key={a.id}
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
                        ))
                    )}

                    {newAddress != null && (
                        <EditableAddressField
                            label={t("profileScreen.newAddress")}
                            key="new"
                            address={newAddress}
                            newItem={true}
                            onChange={(value) => setNewAddress(value)}
                            governorates={governorates}
                            onSave={() => handleAddressSave(newAddress)}
                        />
                    )}
                </ul>

                <div className="flex gap-2 mt-10 justify-end">
                    <button
                        onClick={() => setNewAddress({ address: "" })}
                        className="flex px-4 py-2 bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-60 justify-between gap-2 rounded-2xl "
                    >
                        <Plus className="w-4 h-4 text-white self-center" />
                        {t("profileScreen.addNewAddress")}
                    </button>
                </div>
            </section>


            {/* --- Confirm Delete Dialog --- */}
            <ConfirmDialog
                open={!!confirmDelete}
                title={t("profileScreen.confirmDelete", { type: confirmDelete?.type })}
                description=""
                onCancel={() => setConfirmDelete(null)}
                onConfirm={() => {
                    if (confirmDelete?.type === "phone") handlePhoneDelete(confirmDelete.data);
                    // else if (confirmDelete?.type === "address") handleAddressDelete(confirmDelete.data);
                    setConfirmDelete(null);
                }}
            />
        </div>
    );
}
