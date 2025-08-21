'use client'

import Link from "next/link";

export default function Home() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">🏠 Home Page</h1>
      <Link href="/Cart">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          🛒 Go to Cart
        </button>
      </Link>
    </div>
  );
}
