"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Customer = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
};

type Address = {
  id: number;
  customer_id: number;
  address: string;
  created_at: string | null;
};

type Order = {
  id: number;
  created_at: string;
  status: string;
  total: number;
  items: {
    id: number;
    quantity: number;
    price: number;
    product: {
      name_english: string | null;
      name_arabic: string | null;
    } | null;
  }[];
};

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient();

  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPhone, setSavingPhone] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getOrCreateCustomer = async (authUser: any) => {
    // Try get customer by auth_user_id
    const { data: exists, error: selErr } = await supabase
      .from("customers")
      .select("id, name, email, phone")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (selErr) {
      setErrorMsg(selErr.message);
      return null;
    }

    if (exists) {
      return exists as Customer;
    } else {
      // If not exists → create
      const { data: created, error: upsertErr } = await supabase
        .from("customers")
        .insert({
          auth_user_id: authUser.id,
          name: authUser.user_metadata?.full_name || "",
          email: authUser.email,
          phone: null,
        })
        .select("id, name, email, phone")
        .single();

      if (upsertErr) {
        if (upsertErr.message?.toLowerCase().includes("duplicate")) {
          const { data: byEmail } = await supabase
            .from("customers")
            .select("id, name, email, phone")
            .eq("email", authUser.email)
            .maybeSingle();
          if (byEmail) {
            await supabase
              .from("customers")
              .update({ auth_user_id: authUser.id })
              .eq("id", byEmail.id);
            return byEmail as Customer;
          }
        }
        setErrorMsg(
          upsertErr.message || "Could not create or retrieve your profile."
        );
        return null;
      } else {
        return created as Customer;
      }
    }
  };

  // Load user + ensure customer + load addresses + load orders
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErrorMsg(null);

      // 1) Get auth user
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const authUser = authData?.user;
      if (authErr || !authUser) {
        setErrorMsg("Please login first.");
        setLoading(false);
        return;
      }
      setUser(authUser);

      // 2) Get or create customer profile
      const cust = await getOrCreateCustomer(authUser);
      setCustomer(cust);

      if (cust?.id) {
        // 3) Load addresses
        const { data: addrData, error: addrErr } = await supabase
          .from("customer_addresses")
          .select("id, customer_id, address, created_at")
          .eq("customer_id", cust.id)
          .order("created_at", { ascending: false });

        if (addrErr) setErrorMsg(addrErr.message);
        setAddresses(addrData || []);

        // 4) Load orders + items + products
        const { data: orderData, error: orderErr } = await supabase
          .from("orders")
          .select(
            `
            id,
            created_at,
            status,
            total,
            order_items (
              id,
              quantity,
              price,
              products (
                name_english,
                name_arabic
              )
            )
          `
          )
          .eq("customer_id", cust.id)
          .order("created_at", { ascending: false });

        if (orderErr) setErrorMsg(orderErr.message);

        setOrders(
          (orderData || []).map((o: any) => ({
            id: o.id,
            created_at: o.created_at,
            status: o.status,
            total: o.total,
            items: (o.order_items || []).map((it: any) => ({
              id: it.id,
              quantity: it.quantity,
              price: it.price,
              product: it.products,
            })),
          }))
        );
      }

      setLoading(false);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavePhone = async () => {
    if (!customer) return;
    setSavingPhone(true);
    setErrorMsg(null);

    const { error } = await supabase
      .from("customers")
      .update({ phone: customer.phone })
      .eq("id", customer.id);

    if (error) setErrorMsg(error.message);
    setSavingPhone(false);
  };

  const handleAddAddress = async () => {
    if (!customer || !newAddress.trim()) return;
    setAddingAddress(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("customer_addresses")
      .insert({ customer_id: customer.id, address: newAddress.trim() })
      .select("id, customer_id, address, created_at")
      .single();

    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setAddresses((prev) => [data as Address, ...prev]);
      setNewAddress("");
    }

    setAddingAddress(false);
  };

  const handleDeleteAddress = async (id: number) => {
    setErrorMsg(null);
    const { error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <p className="text-gray-600">Loading profile…</p>
      </div>
    );
  }

  if (!user || !customer) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <p className="text-red-600">No profile found. Please login.</p>
        {errorMsg && <p className="mt-2 text-sm text-red-500">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-amber-800">My Profile</h1>

      {errorMsg && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Name (read-only) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          <input
            type="text"
            value={customer.name ?? user.user_metadata?.full_name ?? ""}
            disabled
            className="mt-1 block w-full rounded border-gray-300 bg-gray-100"
          />
          {""}
          Name
        </label>
      </div>

      {/* Email (read-only) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          <input
            type="email"
            value={customer.email ?? user.email ?? ""}
            disabled
            className="mt-1 block w-full rounded border-gray-300 bg-gray-100"
          />
          {""}
          Email
        </label>
      </div>

      {/* Phone (editable) */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex gap-2 mt-1">
            <input
              type="tel"
              value={customer.phone ?? ""}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
              className="flex-1 rounded border-gray-300"
              placeholder="Enter your phone"
            />
            <button
              onClick={handleSavePhone}
              disabled={savingPhone}
              className="px-4 py-2 rounded bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {savingPhone ? "Saving…" : "Save"}
            </button>
          </div>
          Phone
        </label>
      </div>

      {/* Addresses */}
      <div className="mb-10">
        <label className="block text-sm font-medium text-gray-700">
          {/* Add new address */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Add a new address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="flex-1 rounded border-gray-300"
            />
            <button
              onClick={handleAddAddress}
              disabled={addingAddress}
              className="px-4 py-2 rounded bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {addingAddress ? "Adding…" : "➕ Add"}
            </button>
          </div>
          Addresses
        </label>

        {/* Addresses list */}
        <ul className="mt-4 space-y-2">
          {addresses.length === 0 && (
            <li className="text-gray-500 text-sm">No addresses yet.</li>
          )}
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className="flex items-center justify-between rounded border p-2"
            >
              <span className="text-gray-800">{addr.address}</span>
              <button
                onClick={() => handleDeleteAddress(addr.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* --- Order History Section --- */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-amber-700">
          Order History
        </h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">You have no orders yet.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="font-medium">Order #{order.id}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Status: {order.status}</p>
                <p className="text-sm text-gray-600">Total: ${order.total}</p>
                <ul className="mt-2 space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="text-sm">
                      {item.product?.name_english || item.product?.name_arabic}{" "}
                      × {item.quantity} — ${item.price}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
