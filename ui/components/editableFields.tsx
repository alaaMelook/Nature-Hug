"use client";

import React, { useEffect, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "@/ui/components/confirmDialog";
import { Governorate } from "@/domain/entities/database/governorate";
import { CustomerAddress } from "@/domain/entities/auth/customer";
import { ViewAddress } from "@/domain/entities/views/shop/profileView";
import { t } from "i18next";

interface EditablePhoneFieldProps {
    label: string;
    value: string;
    loading?: boolean;
    newItem?: boolean;
    onChange: (value: string) => void;
    onSave: () => void;
    onDelete?: () => void;
}

export function EditablePhoneField({
    label,
    value,
    loading,
    newItem = false,
    onChange,
    onSave,
    onDelete,
}: EditablePhoneFieldProps) {
    const [input, setInput] = useState(value);
    const [editing, setEditing] = useState(newItem);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Keep local input in sync with external value (in case parent updates)
    useEffect(() => {
        setInput(value);
    }, [value]);

    const handleSave = () => {
        if (editing) {
            onSave();
            setEditing(false);
        } else {
            setEditing(true);
        }
    };

    return (
        <label className="block text-sm font-medium text-gray-700">
            {label}
            <div className="flex gap-2 mt-1">
                <input
                    type="text"
                    value={input}
                    disabled={!editing}
                    onChange={(e) => {
                        setInput(e.target.value);
                        onChange(e.target.value);
                    }}
                    className={`flex-1 rounded ${editing ? "border-1 pl-2" : ""} border-gray-300 focus-visible:border-gray-300`}
                />

                {/* Delete button only visible when editing existing phone */}
                {editing && !newItem && onDelete && (
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => setConfirmDelete(true)}
                        className="px-4 py-2 rounded border-red-700 border-1"
                    >
                        <Trash2Icon className="w-4 h-4 text-red-700" />
                    </button>
                )}

                <button
                    type="button"
                    disabled={loading}
                    onClick={handleSave}
                    className="px-4 py-2 rounded text-primary-900 border-1 border-primary-900"
                >
                    {editing ? (loading ? t("saving") : t("save")) : t("edit")}
                </button>
            </div>

            <ConfirmDialog
                open={confirmDelete}
                title={`Are you sure you want to delete ${input}?`}
                description="This action cannot be undone."
                onCancel={() => setConfirmDelete(false)}
                onConfirm={() => {
                    setConfirmDelete(false);
                    if (onDelete) onDelete();
                }}
            />
        </label>
    );
}

interface EditableAddressFieldProps {
    label: string;
    address: Partial<CustomerAddress>;
    governorates: Governorate[];
    loading?: boolean;
    newItem?: boolean;
    onChange: (value: Partial<CustomerAddress>) => void;
    onSave: () => void;
    onDelete?: () => void;
}

export function EditableAddressField({
    label,
    address,
    governorates,
    loading,
    newItem = false,
    onChange,
    onSave,
}: EditableAddressFieldProps) {
    const [input, setInput] = useState(address);
    const [editing, setEditing] = useState(newItem);

    // Keep local state synced
    useEffect(() => {
        setInput(address);
    }, [address]);

    const handleSave = () => {
        if (editing) {
            onSave();
            setEditing(false);
        } else {
            setEditing(true);
        }
    };

    return (
        <label className="block text-sm font-medium text-gray-700">
            {label}
            <div className="w-full flex flex-col justify-end gap-4">
                <input
                    type="text"
                    value={input?.address ?? ""}
                    onChange={(e) => {
                        const updated = { ...input, address: e.target.value };
                        setInput(updated);
                        onChange(updated);
                    }}
                    className={`flex-1 p-1 rounded ${editing ? "border-1 pl-2" : ""} border-gray-300 focus-visible:border-gray-300`}
                />

                <select
                    className="flex-1/2 rounded border-1 border-gray-300 focus-visible:border-gray-300 p-1.5"
                    value={input?.governorate_slug ?? "Choose"}
                    onChange={(e) => {
                        const updated = { ...input, governorate_slug: e.target.value };
                        setInput(updated);
                        onChange(updated);
                    }}
                >
                    <option value="Choose" key="init">
                        {t("chooseGovernorate")}
                    </option>
                    {governorates.map((g) => (
                        <option key={g.slug} value={g.slug}>
                            {g.name_en}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 rounded text-primary-900 border-1 border-primary-900 w-1/3 self-end"
                >
                    {editing ? (loading ? t("saving") : t("save")) : t("edit")}
                </button>
            </div>
        </label>
    );
}

export function EditableAddressItem({
    address,
    governorates,
    onSaveAction,
    onDeleteAction,
}: {
    address: Partial<ViewAddress>;
    governorates: Governorate[];
    onSaveAction: (updated: Partial<ViewAddress>) => Promise<void>;
    onDeleteAction: (id: number) => Promise<void>;
}) {
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [form, setForm] = useState<Partial<ViewAddress>>(address);

    const handleSave = async () => {
        await onSaveAction({ ...address, ...form });
        setEditing(false);
    };

    return (
        <li className="flex justify-between border rounded p-2 text-sm text-gray-700 items-center">
            {!editing ? (
                <>
                    <span>
                        {address.address}, {address.governorate?.name_en}
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditing(true)}
                            className="text-amber-700 hover:text-amber-900"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2Icon className="w-4 h-4" />
                        </button>
                    </div>

                    <ConfirmDialog
                        open={confirmDelete}
                        title="Delete Address"
                        description="Are you sure you want to delete this address? This action cannot be undone."
                        onCancel={() => setConfirmDelete(false)}
                        onConfirm={() => {
                            setConfirmDelete(false);
                            if (onDeleteAction && address?.id)
                                onDeleteAction(address?.id);
                        }}
                    />
                </>
            ) : (
                <div className="flex flex-col gap-2 w-full">
                    <input
                        type="text"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="flex-1 rounded border border-gray-300 p-1"
                    />
                    <select
                        value={form.governorate?.slug}
                        onChange={(e) => {
                            if (e.target.value !== "Choose") {
                                setForm({ ...form, governorate: { ...form.governorate!, slug: e.target.value } })
                            }
                        }
                        }
                        className="flex-1 rounded border border-gray-300 p-1"
                    >
                        <option value="Choose">Choose Governorate...</option>
                        {governorates.map((g) => (
                            <option key={g.slug} value={g.slug}>
                                {g.name_en}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setEditing(false)}
                            className="px-3 py-1 border rounded text-gray-700"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-amber-700 text-white rounded hover:bg-amber-800"
                        >
                            {t("save")}
                        </button>
                    </div>
                </div>
            )}
        </li>
    );

}