// hooks/useProfileManager.ts
"use client";

import {useState} from "react";
import {toast} from "sonner";
import {addAddress, deleteAddress, updateAddress, updateOrAddPhone,} from "@/ui/hooks/store/useProfileActions";
import {CustomerAddress} from "@/domain/entities/auth/customer";

export function useProfileManager(profile: any) {
    const [loading, setLoading] = useState(false);
    const [newPhone, setNewPhone] = useState<Partial<{ index: number, phone: string }> | null>(null);
    const [editingPhone, setEditingPhone] = useState<Partial<{ index: number, phone: string }> | null>(null);
    const [newAddress, setNewAddress] = useState<Partial<CustomerAddress> | null>(null);
    const [editingAddress, setEditingAddress] = useState<Partial<CustomerAddress> | null>(null);

    // ---- PHONE ----
    async function handlePhoneSave(phoneData: any) {
        if (!phoneData?.phone) return toast.error("Please enter a phone number.");

        setLoading(true);
        const result = await updateOrAddPhone(phoneData);
        setLoading(false);

        if (result?.error) toast.error(result.error);
        else {
            toast.success("Phone updated successfully");
            setEditingPhone(null);
            setNewPhone(null);
        }
    }

    async function handlePhoneDelete(phoneData: any) {
        setLoading(true);
        const result = await updateOrAddPhone({index: phoneData.index, phone: null});
        setLoading(false);

        if (result?.error) toast.error(result.error);
        else {
            toast.success("Phone deleted successfully");
            setEditingPhone(null);
            setNewPhone(null);
        }
    }

    // ---- ADDRESS ----
    async function handleAddressSave(addr: any) {
        if (!addr.address || !addr.governorate_slug)
            return toast.error("Please enter address and choose governorate.");

        setLoading(true);
        const result = addr.id ? await updateAddress(addr) : await addAddress(addr);
        setLoading(false);

        if (result?.error) toast.error(result.error);
        else {
            toast.success("Address updated successfully");
            setNewAddress(null);
            setEditingAddress(null);
        }
    }

    async function handleAddressDelete(id: number) {
        setLoading(true);
        await deleteAddress(id);
        setLoading(false);
        toast.success("Address deleted successfully");
    }

    return {
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
    };
}
