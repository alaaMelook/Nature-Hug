"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getAccountsReportAction, getProductSalesReportAction, getInventoryValuationAction, type InventoryItem } from "@/ui/hooks/admin/useReports";
import type { AccountReportView, ProductSalesReport } from "@/domain/entities/views/admin/reportViews";
import { BarChart3, Calendar, FileText, Package, Users, TrendingUp, Warehouse, Filter } from "lucide-react";

type TabType = 'products' | 'accounts' | 'bestSellers';

export default function AdminReportsScreen() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('products');
    const reportRef = useRef<HTMLDivElement>(null);

    // Date Range - Start from beginning of year for more data
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(0); // January
        date.setDate(1);  // 1st
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Filters for accounts
    const [accountFilter, setAccountFilter] = useState<string>('all');

    // Data
    const [accountsData, setAccountsData] = useState<AccountReportView[]>([]);
    const [productsData, setProductsData] = useState<ProductSalesReport[]>([]);
    const [inventoryData, setInventoryData] = useState<{ items: InventoryItem[], totalValue: number }>({ items: [], totalValue: 0 });

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [accounts, products, inventory] = await Promise.all([
                getAccountsReportAction(startDate, endDate),
                getProductSalesReportAction(startDate, endDate),
                getInventoryValuationAction()
            ]);

            setAccountsData(accounts);
            setProductsData(products);
            setInventoryData(inventory);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const formatCurrency = (amount: number) => {
        return t("{{price, currency}}", { price: amount });
    };

    // Get top selling product
    const topProduct = productsData.length > 0 ? productsData[0] : null;
    const totalUnitsSold = productsData.reduce((sum, p) => sum + p.total_quantity_sold, 0);
    const totalRevenue = productsData.reduce((sum, p) => sum + p.total_revenue, 0);

    // Filtered accounts
    const filteredAccounts = accountsData.filter(acc =>
        accountFilter === 'all' || acc.customer_id.toString() === accountFilter
    );

    // Account totals
    const accountTotals = {
        totalOrders: filteredAccounts.reduce((sum, a) => sum + a.total_orders, 0),
        totalRevenue: filteredAccounts.reduce((sum, a) => sum + a.total_revenue, 0),
    };

    // Get unique roles for filter (not used now but keep for reference)
    const uniqueRoles = [...new Set(accountsData.map(a => a.user_role))];

    // Export to PDF
    const handleExportPDF = async () => {
        if (!reportRef.current) return;

        try {
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default;

            const opt = {
                margin: 10,
                filename: `report_${activeTab}_${startDate}_${endDate}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            //   await html2pdf().set(opt).from(reportRef.current).save();
        } catch (error) {
            console.error("Error exporting PDF:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="w-8 h-8 text-primary-600" />
                            {t("reports")}
                        </h1>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        {t("exportPDF") || "Export PDF"}
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'products'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Package className="w-4 h-4" />
                                {t("products") || "Products"}
                            </button>
                            <button
                                onClick={() => setActiveTab('accounts')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'accounts'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Users className="w-4 h-4" />
                                {t("accounts") || "Accounts"}
                            </button>
                            <button
                                onClick={() => setActiveTab('bestSellers')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'bestSellers'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <TrendingUp className="w-4 h-4" />
                                {t("bestSellers") || "Best Sellers"}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {t("fromDate")}
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {t("toDate")}
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        {/* Account Filter - only show on accounts tab */}
                        {activeTab === 'accounts' && (
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Filter className="w-4 h-4 inline mr-1" />
                                    {t("selectAccount") || "Select Account"}
                                </label>
                                <select
                                    value={accountFilter}
                                    onChange={(e) => setAccountFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="all">{t("allAccounts") || "All Accounts"}</option>
                                    {accountsData.map(account => (
                                        <option key={account.customer_id} value={account.customer_id.toString()}>
                                            {account.user_name} ({account.user_role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={fetchReports}
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? t("loading") : t("generateReport")}
                        </button>
                    </div>
                </div>

                {/* PDF Report Content */}
                <div ref={reportRef} className="space-y-6">

                    {/* ==================== PRODUCTS TAB ==================== */}
                    {activeTab === 'products' && (
                        <>
                            {/* Top Product Highlight */}
                            {topProduct && (
                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-6 h-6" />
                                        <h2 className="text-xl font-bold">{t("topSellingProduct") || "Top Selling Product"}</h2>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <p className="text-3xl font-bold">{topProduct.product_name}</p>
                                            {topProduct.variant_name && (
                                                <p className="text-green-100">{topProduct.variant_name}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-4xl font-bold">{topProduct.total_quantity_sold}</p>
                                            <p className="text-green-100">{t("unitsSold") || "units sold"}</p>
                                            <p className="text-xl font-semibold mt-1">{formatCurrency(topProduct.total_revenue)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Sales Table */}
                            {productsData.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-blue-600" />
                                            <h2 className="text-xl font-bold text-gray-900">{t("productSales") || "Product Sales"}</h2>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {t("total") || "Total"}: <span className="font-bold text-gray-900">{totalUnitsSold}</span> |
                                            <span className="font-bold text-green-600 ml-1">{formatCurrency(totalRevenue)}</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        {t("productName")}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        {t("unitsSold") || "Units"}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        {t("orders")}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        {t("revenue")}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {productsData.map((product, index) => (
                                                    <tr key={`${product.product_id}-${product.variant_id || 'main'}`} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-medium">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                                                            {product.variant_name && (
                                                                <div className="text-xs text-gray-500">{product.variant_name}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                            {product.total_quantity_sold}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {product.order_count}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                            {formatCurrency(product.total_revenue)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-600 h-2 rounded-full"
                                                                        style={{ width: `${Math.min(product.sales_percentage, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-gray-500">{product.sales_percentage.toFixed(1)}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Inventory Valuation */}
                            {inventoryData.items.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Warehouse className="w-5 h-5 text-orange-600" />
                                            <h2 className="text-xl font-bold text-gray-900">{t("inventoryValuation") || "Inventory Valuation"}</h2>
                                        </div>
                                        <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-bold">
                                            {t("totalValue") || "Total"}: {formatCurrency(inventoryData.totalValue)}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        {t("productName")}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        {t("stock")}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        {t("unitPrice") || "Price"}
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        {t("totalValue") || "Value"}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {inventoryData.items.map((item, index) => (
                                                    <tr key={`${item.product_id}-${item.variant_id || 'main'}-${index}`} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {item.variant_name || item.name}
                                                            </div>
                                                            {item.variant_name && (
                                                                <div className="text-xs text-gray-500">{item.name}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {item.stock}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {formatCurrency(item.price)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                                                            {formatCurrency(item.total_value)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-orange-50">
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                                        {t("grandTotal") || "Grand Total"}:
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-orange-700">
                                                        {formatCurrency(inventoryData.totalValue)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ==================== ACCOUNTS TAB ==================== */}
                    {activeTab === 'accounts' && (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users className="w-10 h-10 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {t("comingSoon") || "Coming Soon"}
                                </h2>
                                <p className="text-gray-500 mb-6">
                                    {t("accountsReportComingSoon") || "Accounts performance reports will be available soon. Stay tuned!"}
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                                    </span>
                                    {t("underDevelopment") || "Under Development"}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== BEST SELLERS TAB ==================== */}
                    {activeTab === 'bestSellers' && (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <TrendingUp className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {t("comingSoon") || "Coming Soon"}
                                </h2>
                                <p className="text-gray-500 mb-6">
                                    {t("bestSellersReportComingSoon") || "Best sellers analytics will be available soon. Stay tuned!"}
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    {t("underDevelopment") || "Under Development"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* No Data Message */}
                {!loading && activeTab === 'products' && productsData.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t("noDataForPeriod")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
