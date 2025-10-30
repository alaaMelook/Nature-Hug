"use client";

import { useCart } from "@/ui/providers/CartProvider";
import React, { useState } from "react";
import { useTranslation } from "@/ui/providers/TranslationProvider";
import {useCreateOrder} from "@/ui/hooks/store/useCreateOrder";
import {useSupabaseAuth} from "@/ui/providers/SupabaseAuthProvider";
import {toast} from "sonner";

const governorates = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Dakahlia",
  "Sharqia",
  "Qalyubia",
  "Monufia",
  "Gharbia",
  "Beheira",
  "Kafr El Sheikh",
];

export default function CheckoutPage() {
  const { t, language } = useTranslation();
  const {user} = useSupabaseAuth();
  const cart = useCart();
  const { cart: items, removeFromCart, getCartNetTotal } = cart;
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    governorate: "",
  });
    console.log(user);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const {createOrder, PrepareOrderData} = useCreateOrder();
const handleOrder = createOrder();
    if(handleOrder.isSuccess){
        toast.success('Order Placed!');
    }
    if (handleOrder.isError){
        toast.error('Order Failed!');
    }
    const onSubmit = ()=>{
        if(user) {
            const order = PrepareOrderData(user)
            if(order)
                handleOrder.mutate(order);
        }
    }
  return (
    <div className="flex py-10 px-4 bg-gray-50">
      <div className="w-2xl mx-auto mt-10 p-10 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6"> Order Summary</h1>
        <table className="w-full mb-6">
          <tbody>
            {items.map((item) => (
              <tr className="border-t">
                <td className="py-2">
                  <span className="flex items-center gap-4">
                    <div className="flex-shrink-0 relative w-10 h-10 rounded-sm overflow-hidden shadow-inner">
                      <img
                        src={
                          item.image ||
                          "https://placehold.co/100x100/E2E8F0/FFF?text=No+Image"
                        }
                        alt={item.slug|| ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {item.name} x {item.quantity}
                  </span>
                </td>


                <td className="py-2 text-right">
                  EGP {(item.quantity * (item.price - (item.discount || 0) || 0)).toFixed(2)}
                </td>
              </tr>

            ))}
            <tr className="border-t font-semibold m-0 p-0">
              <td className="py-2">Subtotal</td>
              <td className="py-2 text-right">
                EGP {getCartNetTotal().toFixed(2)}
              </td>
            </tr>
            <tr className="font-semibold m-0 p-0">
              <td className="py-2">Shipping Fees</td>
              <td className="py-2 text-right">
                EGP 50
              </td>
            </tr>
            <tr className="font-bold m-0 p-0">
              <td className="py-2">Total</td>
              <td className="py-2 text-right">
                EGP {(getCartNetTotal() + 50).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <form onSubmit={()=> onSubmit()} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email (optional)"
            className="w-full border p-2 rounded"
          />
          <select
            name="governorate"
            value={form.governorate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Governorate</option>
            {governorates.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-primary-800 text-white py-2 rounded cursor-pointer "
          >
            Confirm Checkout
          </button>
        </form>
      </div>
    </div>
  );
}
