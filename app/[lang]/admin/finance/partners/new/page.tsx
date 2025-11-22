"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPartnerPage() {
  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");
  const [ownership, setOwnership] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/finance/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        contribution_amount: parseFloat(contribution),
        ownership_percentage: parseFloat(ownership),
      }),
    });
    router.push("/admin/finance/partners");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Partner</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Name</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block">Contribution Amount</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block">Ownership %</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={ownership}
            onChange={(e) => setOwnership(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}
