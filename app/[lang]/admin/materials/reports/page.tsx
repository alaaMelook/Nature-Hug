"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  totalMaterialsValue: number;
  lowMaterials: number;
  lowProducts: number;
  totalProductsValue: number;
  topConsumed: { id: number; name: string; totalConsumed: number }[];
  topProduced: { id: number; name: string; totalProduced: number }[];
  productStocks: {
    id: number;
    name: string;
    stock: number;
    price: number;
    totalValue: number;
  }[];
  materialStocks?: {
    id: number;
    name: string;
    stock_grams: number;
    price_per_gram: number;
    totalValue: number;
    consumed?: number;
  }[];
  from: string;
  to: string;
}

export default function InventoryReportPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reportType, setReportType] = useState<"normal" | "detailed">("normal");

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
    // eslint-disable-next-line
  }, []);

  // دمج منتجات الانتاج مع ملخص المخزون
  function getMergedProducts() {
    if (!report) return [];
    return (
      report.productStocks?.map((p) => {
        const produced =
          report.topProduced?.find((tp) => tp.id === p.id)?.totalProduced || 0;
        return { ...p, totalProduced: produced };
      }) ?? []
    );
  }

  // تصدير PDF بنفس تحسينات التصميم
  const exportPDF = async () => {
    if (!report) return;

    const doc = new jsPDF({
      orientation: reportType === "detailed" ? "landscape" : "portrait",
      unit: "pt",
      format: "a4",
    });

    const brandBrown = "#7B4B2A";
    const beige = "#F5E9DA";
    const textDark = "#333";

    doc.setFont("helvetica", "bold");

    // Header
    doc.setFillColor(beige);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 85, "F");

    // Logo
    const logoUrl =
      "https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/public/nature-hug/logos/logo.jpg";
    const logo = await fetch(logoUrl)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
      );

    doc.addImage(logo, "JPEG", 40, 20, 60, 60);

    // Title
    doc.setTextColor(brandBrown);
    doc.setFontSize(26);
    doc.text("Nature Hug", 120, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(textDark);
    doc.text("Inventory Report", 120, 70);

    doc.setFontSize(11);
    doc.setTextColor("#555");
    doc.text(`Period: ${from || report.from} → ${to || report.to}`, 120, 90);
    doc.text(
      `Report Type: ${reportType === "detailed" ? "Detailed" : "Normal"}`,
      120,
      105
    );

    // Summary
    autoTable(doc, {
      startY: 120,
      head: [["Metric", "Value"]],
      body: [
        ["Total Materials Value", `${report.totalMaterialsValue.toFixed(2)} EGP`],
        ["Low Materials", report.lowMaterials.toString()],
        ["Low Products", report.lowProducts.toString()],
        ["Total Products Value", `${report.totalProductsValue.toFixed(2)} EGP`],
      ],
      styles: { textColor: "#333", fontSize: 10 },
      headStyles: { fillColor: [122, 91, 56], textColor: "#fff" },
      alternateRowStyles: { fillColor: "#faf7f2" },
    });

    // مواد خام (تفصيلي فقط)
    if (reportType === "detailed" && report.materialStocks?.length) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 25,
        head: [
          [
            "Material",
            "Stock (g)",
            "Price/g",
            "Total Value",
            "Consumed",
            "Level",
          ],
        ],
        body: report.materialStocks.map((m) => [
          m.name,
          m.stock_grams,
          m.price_per_gram.toFixed(2),
          (m.stock_grams * m.price_per_gram).toFixed(2),
          m.consumed || 0,
          m.stock_grams < 200 ? "Low" : m.stock_grams < 500 ? "Medium" : "Good",
        ]),
        styles: { textColor: "#333", fontSize: 9 },
        headStyles: { fillColor: [122, 91, 56], textColor: "#fff" },
        alternateRowStyles: { fillColor: "#f9f5ef" },
      });
    }

    // دمج جدول المنتجات (منتج + المخزون + الانتاج)
    const mergedProducts = getMergedProducts();

    if (mergedProducts.length) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 25,
        head: [
          [
            "Product",
            "Produced Qty",
            "Stock",
            "Unit Price",
            "Total Value",
          ],
        ],
        body: mergedProducts.map((p) => [
          p.name,
          p.totalProduced,
          p.stock,
          p.price.toFixed(2),
          p.totalValue.toFixed(2),
        ]),
        styles: { textColor: "#333", fontSize: 9 },
        headStyles: { fillColor: [122, 91, 56], textColor: "#fff" },
        alternateRowStyles: { fillColor: "#f9f5ef" },
      });
    }

    // Watermark logo (bottom-right)
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    doc.addImage(logo, "JPEG", pageWidth - 120, pageHeight - 120, 60, 60, undefined, "SLOW");
    doc.setTextColor("#aaa");

    // Footer text
    doc.setFontSize(10);
    doc.text(
      `© 2025 Nature Hug — All Rights Reserved 🌿`,
      40,
      pageHeight - 30
    );

    doc.save(
      `NatureHug_Inventory_Report_${from || report.from}_${to || report.to
      }_${reportType === "detailed" ? "Detailed" : "Normal"
      }.pdf`
    );
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600 animate-pulse">
        ⏳ Loading Inventory Report...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-8 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            📊 Inventory Report
          </h1>
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="block text-sm text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            <button
              onClick={loadReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard label="Total Materials Value" value={`${report?.totalMaterialsValue.toFixed(2)} EGP`} color="blue" />
          <SummaryCard label="Low Materials" value={report?.lowMaterials ?? 0} color="red" />
          <SummaryCard label="Low Products" value={report?.lowProducts ?? 0} color="orange" />
          <SummaryCard label="Total Products Value" value={`${report?.totalProductsValue.toFixed(2)} EGP`} color="green" />
        </div>

        {/* جداول الصفحة */}

        {/* جدول المواد الخام */}
        {report?.materialStocks?.length ? (
          <DataGridSection
            title="🧱 Raw Materials & Consumption"
            columns={[
              { field: "name", headerName: "Material", flex: 1 },
              { field: "stock_grams", headerName: "Stock (grams)", width: 150 },
              { field: "price_per_gram", headerName: "Price / gram (EGP)", width: 180 },
              { field: "totalValue", headerName: "Total Value (EGP)", width: 180 },
              { field: "consumed", headerName: "Consumed", width: 150 },
              {
                field: "status",
                headerName: "Stock Level",
                flex: 1,
                renderCell: (params) => {
                  const qty = params.row.stock_grams;
                  let color = "text-green-600";
                  let label = "Good";

                  if (qty < 200) {
                    color = "text-red-600";
                    label = "Low";
                  } else if (qty < 500) {
                    color = "text-yellow-600";
                    label = "Medium";
                  }

                  return <span className={`font-semibold ${color}`}>{label}</span>;
                },
              },
            ]}
            rows={report.materialStocks.map((m) => ({
              ...m,
              price_per_gram: m.price_per_gram.toFixed(2),
              totalValue: (m.stock_grams * m.price_per_gram).toFixed(2),
            }))}
          />
        ) : (
          <p className="text-gray-500 italic">No material data found.</p>
        )}

        {/* جدول المواد الأكثر استهلاكا */}
        {report?.topConsumed?.length ? (
          <DataGridSection
            title="🔥 Most Consumed Materials"
            columns={[
              { field: "name", headerName: "Material", flex: 1 },
              { field: "totalConsumed", headerName: "Consumed", width: 150 },
            ]}
            rows={report.topConsumed}
          />
        ) : null}

        {/* جدول المنتجات المدمج (انتاج + مخزون) */}
        {getMergedProducts().length ? (
          <DataGridSection
            title="🏭📦 Products Production & Stock Summary"
            columns={[
              { field: "name", headerName: "Product", flex: 1 },
              { field: "totalProduced", headerName: "Produced Qty", width: 130 },
              { field: "stock", headerName: "Stock", width: 100 },
              { field: "price", headerName: "Unit Price (EGP)", width: 150 },
              { field: "totalValue", headerName: "Total Value (EGP)", width: 180 },
            ]}
            rows={getMergedProducts().map((p) => ({
              ...p,
              price: p.price.toFixed(2),
              totalValue: p.totalValue.toFixed(2),
            }))}
          />
        ) : (
          <p className="text-gray-500 italic">No product stock data available.</p>
        )}

        <div className="text-right">
          <button
            onClick={exportPDF}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            📤 Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "blue" | "red" | "orange" | "green";
}) {
  const colors: any = {
    blue: "text-blue-600",
    red: "text-red-600",
    orange: "text-orange-500",
    green: "text-green-600",
  };
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4 hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className={`text-2xl font-semibold ${colors[color]}`}>{value}</p>
    </div>
  );
}

// جدول متعدد الاستخدام
function DataGridSection({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: GridColDef[];
  rows: any[];
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          disableRowSelectionOnClick
          sx={{
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f3f4f6",
              fontWeight: "bold",
            },
          }}
        />
      </div>
    </div>
  );
}