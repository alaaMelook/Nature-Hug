"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

// ✅ Lazy load للرسومات
const OwnershipPie = dynamic(() => import("../../../components/charts/OwnershipPie"), { ssr: false });
const ContribVsProfitBar = dynamic(() => import("../../../components/charts/ContribVsProfitBar"), { ssr: false });

// ✅ دالة للتصدير Excel
function exportToExcel(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export default function PartnerSummaryPage() {
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await fetch("/api/admin/finance/partners/summary");
      const data = await res.json();
      setPartners(data);
    };
    fetchSummary();
  }, []);

  const totalContributions = partners.reduce(
    (sum, p) => sum + Number(p.totalContributions ?? 0),
    0
  );
  const totalProfits = partners.reduce(
    (sum, p) => sum + Number(p.totalProfitShare ?? 0),
    0
  );
  const netPosition = partners.reduce(
    (sum, p) => sum + Number(p.netPosition ?? 0),
    0
  );

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Partners Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Total Contributions</h2>
          <p className="text-xl font-bold">{totalContributions}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Total Profits</h2>
          <p className="text-xl font-bold">{totalProfits}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Net Position</h2>
          <p
            className={`text-xl font-bold ${
              netPosition >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {netPosition}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold mb-4">Ownership Distribution</h3>
          <OwnershipPie data={partners} />
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold mb-4">Contributions vs Profits</h3>
          <ContribVsProfitBar data={partners} />
        </div>
      </div>

      {/* Table + Export Button */}
      <div className="bg-white p-4 shadow rounded space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Partners Table</h3>
          <button
            onClick={() => exportToExcel(partners, "partners_summary")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download Excel
          </button>
        </div>

        <table className="w-full border-collapse border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Ownership %</th>
              <th className="border px-4 py-2">Total Contributions</th>
              <th className="border px-4 py-2">Total Profits</th>
              <th className="border px-4 py-2">Net Position</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{p.name}</td>
                <td className="border px-4 py-2">{p.ownership_percentage}%</td>
                <td className="border px-4 py-2">{p.totalContributions}</td>
                <td className="border px-4 py-2">{p.totalProfitShare}</td>
                <td
                  className={`border px-4 py-2 ${
                    p.netPosition >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {p.netPosition}
                </td>
                <td className="border px-4 py-2">
                  <Link
                    href={`/admin/partners/report/${p.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Report
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
