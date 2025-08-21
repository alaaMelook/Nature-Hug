'use client'

import { useCart } from "@/lib/CartContext";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    // هنا تحطي لوجيك الدفع الحقيقي/حفظ الأوردر لاحقًا
    alert(`Checkout successful! Total: ${total}`);
    clearCart();
  };

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">💳 Checkout</h1>
      <p className="mb-4">Items: {cart.length} • Total: 💲{total}</p>
      <button onClick={handleCheckout} className="px-4 py-2 bg-green-600 text-white rounded">Pay Now</button>
    </div>
  );
}
