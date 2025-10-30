"use client"

import {ProfileView} from "@/domain/entities/views/shop/profileView";
import {use, useState} from "react";

export function ProfileScreen({initialProfile}: { initialProfile: Promise<ProfileView | null> }) {
    const profile = use(initialProfile)
    const [newAddress, setNewAddress] = useState("");

    // const {updatePhone, addAddress, deleteAddress} = useProfileActions(user?.id);

    // if (!user) {
    //   return (
    //     <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
    //       <p className="text-red-600">No profile found. Please login.</p>
    //     </div>
    //   );
    // }

    /*
      if (isLoading) {
        return (
          <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
            <p className="text-gray-600">Loading profile…</p>
          </div>
        );
      }

      if (error) {
        return (
          <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
            <p className="text-red-600">Error loading profile.</p>
          </div>
        );
      }
    */

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-amber-800">My Profile</h1>

            {/* --- Basic Info --- */}
            <section className="space-y-4 mb-8">
                <InfoField label="Name" value={profile?.name ?? ""} disabled/>
                <InfoField label="Email" value={profile?.email ?? ""} disabled/>
                {profile?.phone.map((p: any, index: number) => (

                    <EditableField
                        label={`Phone ${profile?.phone.length > 1 ? index + 1 : ""}`}
                        key={index}
                        value={p ?? ""}
                        onSave={() => {
                        }}
                        // onSave={(v) => updatePhone.mutate(v)}
                        // loading={updatePhone.isPending}
                    />
                ))}
                {(profile?.phone.length ?? 0) < 2 && (
                    <button>
                        Add Phone
                    </button>
                )}
            </section>

            {/* --- Addresses --- */}
            <section className="mb-10">
                <h2 className="font-semibold mb-2">Addresses</h2>
                <div className="flex gap-2 mt-2">
                    <input
                        type="text"
                        placeholder="Add a new address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="flex-1 rounded border-gray-300"
                    />
                    <button
                        onClick={() => {
                            // addAddress.mutate(newAddress);
                            setNewAddress("");
                        }}
                        // disabled={addAddress.isPending}
                        className="px-4 py-2 rounded bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-60"
                    >
                        {/*{addAddress.isPending ? "Adding…" : "➕ Add"}*/}
                    </button>
                </div>

                <ul className="mt-4 space-y-2">
                    {(profile?.address?.length ?? 0) === 0 ? (
                        <li className="text-gray-500 text-sm">No addresses yet.</li>
                    ) : (
                        profile?.address?.map((a: any) => (
                            <li key={a.id} className="flex justify-between border rounded p-2">
                                <span>{a.address}</span>
                                <button
                                    // onClick={() => deleteAddress.mutate(a.id)}
                                    // disabled={deleteAddress.isPending}
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </section>

            {/* --- Orders --- */}
            {/*  <section>
        <h2 className="text-xl font-semibold mb-4 text-amber-700">
          Order History
        </h2>
        {profile?.orderslength === 0 ? (
          <p className="text-gray-500">You have no orders yet.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((o: any) => (
              <li key={o.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="font-medium">Order #{o.id}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(o.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Status: {o.status}</p>
                <p className="text-sm text-gray-600">Total: ${o.total}</p>
              </li>
            ))}
          </ul>
        )}
      </section> */}
        </div>
    );
}

/* --- Reusable UI components --- */
function InfoField({label, value, disabled}: { label: string; value: string; disabled?: boolean }) {
    return (
        <label className="block text-sm font-medium text-gray-700">
            {label}
            <input
                type="text"
                value={value}
                disabled={disabled}
                className="mt-1 block w-full rounded border-gray-300 bg-gray-100"
            />
        </label>
    );
}

function EditableField({
                           label,
                           value,
                           onSave,
                           loading,
                       }: {
    label: string;
    value: string;
    onSave: (value: string) => void;
    loading?: boolean;
}) {
    const [input, setInput] = useState(value);
    return (
        <label className="block text-sm font-medium text-gray-700">
            {label}
            <div className="flex gap-2 mt-1">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 rounded border-gray-300"
                />
                <button
                    onClick={() => onSave(input)}
                    disabled={loading}
                    className="px-4 py-2 rounded bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-60"
                >
                    {loading ? "Saving…" : "Save"}
                </button>
            </div>
        </label>
    );
}