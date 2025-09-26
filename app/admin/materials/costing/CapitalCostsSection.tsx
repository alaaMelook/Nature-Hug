"use client";
import { useState } from "react";

export default function CapitalCostsSection() {
  const [land, setLand] = useState(0);
  const [buildings, setBuildings] = useState(0);
  const [equipment, setEquipment] = useState(0);
  const [other, setOther] = useState(0);

  const totalCapital = land + buildings + equipment + other;

  return (
    <div className="p-4 border rounded mb-6">
      <h2 className="text-lg font-bold mb-4">Capital Costs (أصول ثابتة)</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Land</label>
          <input
            type="number"
            value={land}
            onChange={(e) => setLand(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Buildings</label>
          <input
            type="number"
            value={buildings}
            onChange={(e) => setBuildings(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Equipment & Machinery</label>
          <input
            type="number"
            value={equipment}
            onChange={(e) => setEquipment(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Other</label>
          <input
            type="number"
            value={other}
            onChange={(e) => setOther(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
      </div>
      <div className="mt-4 font-bold">
        Total Capital Investment: {totalCapital} EGP
      </div>
    </div>
  );
}
