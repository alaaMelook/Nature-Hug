"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  totalMaterialsValue: number;
  lowMaterials: number;
  lowProducts: number;
  totalProductsValue: number;
  topConsumed: { id: number; name: string; totalConsumed: number }[];
  topProduced: { id: number; name: string; totalProduced: number }[];
  productStocks: { id: number; name: string; stock: number; price: number; totalValue: number }[];
  from: string;
  to: string;
}

export default function InventoryReportPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadReport = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (from) query.append("from", from);
      if (to) query.append("to", to);

      const res = await fetch(`/api/admin/inventory-report?${query.toString()}`);
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) return <p>Loading...</p>;

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.text("Inventory Report", 14, 16);
    doc.text(`Period: ${report.from} → ${report.to}`, 14, 24);

    autoTable(doc, {
      startY: 30,
      head: [["Metric", "Value"]],
      body: [
        ["Total Materials Value", `${report.totalMaterialsValue.toFixed(2)} EGP`],
        ["Low Materials", report.lowMaterials.toString()],
        ["Low Products", report.lowProducts.toString()],
        ["Total Products Value", `${report.totalProductsValue.toFixed(2)} EGP`],
      ],
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Material", "Consumed"]],
      body: report.topConsumed.map((m) => [m.name, m.totalConsumed]),
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Product", "Produced"]],
      body: report.topProduced.map((p) => [p.name, p.totalProduced]),
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Product", "Stock", "Price", "Total Value"]],
      body: report.productStocks.map((p) => [
        p.name,
        p.stock,
        p.price,
        p.totalValue,
      ]),
    });

    doc.save("inventory_report.pdf");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Inventory Report</h1>

      {/* 🟢 Filters */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border p-2 rounded" />
        </div>
        <button
          onClick={loadReport}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Apply
        </button>
      </div>

      {/* 🟢 Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Total Materials Value</p>
          <p className="text-xl font-bold">{report?.totalMaterialsValue.toFixed(2)} EGP</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Low Materials</p>
          <p className="text-xl font-bold text-red-600">{report?.lowMaterials}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Low Products</p>
          <p className="text-xl font-bold text-orange-600">{report?.lowProducts}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Total Products Value</p>
          <p className="text-xl font-bold">{report?.totalProductsValue.toFixed(2)} EGP</p>
        </div>
      </div>

      {/* 🟢 Product Stocks */}
      <div>
        <h2 className="font-bold mb-2">Product Stocks</h2>
        <ul className="list-disc pl-6">
          {report?.productStocks.map((p) => (
            <li key={p.id}>
              {p.name} — {p.stock} pcs × {p.price} EGP ={" "}
              <span className="font-bold">{p.totalValue} EGP</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🟢 Export Button */}
      <button
        onClick={exportPDF}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Export as PDF
      </button>
    </div>
  );
}
