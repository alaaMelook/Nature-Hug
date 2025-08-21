'use client'

import { useCart } from "@/lib/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">🛍️ Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty. <Link href="/products" className="underline">Browse products</Link></p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.product_id} className="flex justify-between items-center border p-4 rounded">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-600">
                  Unit: {item.price} • Subtotal: {item.price * item.quantity}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
                  className="w-16 border rounded p-1"
                />
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t">
            <h2 className="text-lg font-semibold">Total: 💲{total}</h2>
            <div className="flex gap-3">
              <Link href="/checkout">
                <button className="px-4 py-2 bg-green-600 text-white rounded">✅ Checkout</button>
              </Link>
              <button onClick={clearCart} className="px-4 py-2 bg-gray-600 text-white rounded">🗑️ Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
