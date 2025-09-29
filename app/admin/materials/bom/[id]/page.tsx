"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VariantPage() {
  const params = useParams();
  const id = params.id as string;

  const [variant, setVariant] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/variants?id=${id}`)
      .then((res) => res.json())
      .then((data) => setVariant(data[0] || null));
  }, [id]);

  if (!variant) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Variant Details</h1>

      <div className="space-y-2">
        <p>
          <strong>ID:</strong> {variant.id}
        </p>
        <p>
          <strong>Name:</strong> {variant.name}
        </p>
        <p>
          <strong>Product:</strong> {variant.products?.name_english}
        </p>
      </div>
    </div>
  );
}
