"use client";
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Wallet, ArrowDownCircle, ArrowUpCircle, Calendar, Loader2, X } from "lucide-react";

interface OrderDetail {
    id: number;
    grand_total: number;
    created_at: string;
}

interface TransactionDetail {
    id: number;
    date: string;
    reference: string | null;
    description: string | null;
    amount: number;
    category: string;
}

interface COGSDetail {
    product_id: number;
    variant_id: number | null;
    product_name: string;
    quantity: number;
    materials_cost: number;
}

interface AnalysisData {
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    cashInflow: number;
    cashOutflow: number;
    cashFlow: number;
    ordersCount: number;
    period: { startDate: string; endDate: string };
    details?: {
        orders: OrderDetail[];
        cogs: COGSDetail[];
        expenses: TransactionDetail[];
        income: TransactionDetail[];
    };
}

type PeriodType = 'custom' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'thisYear' | 'lastYear';
type ModalType = 'revenue' | 'cogs' | 'expenses' | 'cashInflow' | 'cashOutflow' | null;

export default function BusinessAnalysisPage() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [periodType, setPeriodType] = useState<PeriodType>('thisMonth');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const getDateRange = (type: PeriodType): { startDate: string; endDate: string } => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        switch (type) {
            case 'thisMonth':
                return {
                    startDate: new Date(year, month, 1).toISOString().split('T')[0],
                    endDate: new Date(year, month + 1, 0).toISOString().split('T')[0]
                };
            case 'lastMonth':
                return {
                    startDate: new Date(year, month - 1, 1).toISOString().split('T')[0],
                    endDate: new Date(year, month, 0).toISOString().split('T')[0]
                };
            case 'thisQuarter': {
                const quarterStart = Math.floor(month / 3) * 3;
                return {
                    startDate: new Date(year, quarterStart, 1).toISOString().split('T')[0],
                    endDate: new Date(year, quarterStart + 3, 0).toISOString().split('T')[0]
                };
            }
            case 'lastQuarter': {
                const lastQuarterStart = Math.floor(month / 3) * 3 - 3;
                const qYear = lastQuarterStart < 0 ? year - 1 : year;
                const qMonth = lastQuarterStart < 0 ? lastQuarterStart + 12 : lastQuarterStart;
                return {
                    startDate: new Date(qYear, qMonth, 1).toISOString().split('T')[0],
                    endDate: new Date(qYear, qMonth + 3, 0).toISOString().split('T')[0]
                };
            }
            case 'thisYear':
                return {
                    startDate: new Date(year, 0, 1).toISOString().split('T')[0],
                    endDate: new Date(year, 11, 31).toISOString().split('T')[0]
                };
            case 'lastYear':
                return {
                    startDate: new Date(year - 1, 0, 1).toISOString().split('T')[0],
                    endDate: new Date(year - 1, 11, 31).toISOString().split('T')[0]
                };
            case 'custom':
                return { startDate: customStartDate, endDate: customEndDate };
            default:
                return {
                    startDate: new Date(year, month, 1).toISOString().split('T')[0],
                    endDate: new Date(year, month + 1, 0).toISOString().split('T')[0]
                };
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange(periodType);
            if (!startDate || !endDate) return;

            const res = await fetch(`/api/admin/finance/business-analysis?startDate=${startDate}&endDate=${endDate}`);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error("Error fetching analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (periodType !== 'custom' || (customStartDate && customEndDate)) {
            fetchData();
        }
    }, [periodType, customStartDate, customEndDate]);

    const formatCurrency = (amount: number | null | undefined) => {
        const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(safeAmount);
    };

    const MetricCard = ({
        title,
        value,
        icon: Icon,
        color,
        subtitle,
        onClick
    }: {
        title: string;
        value: number | null | undefined;
        icon: any;
        color: string;
        subtitle?: string;
        onClick?: () => void;
    }) => {
        const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        return (
            <div
                className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer hover:border-primary-300' : ''}`}
                onClick={onClick}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <p className={`text-2xl font-bold mt-1 ${safeValue >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                            {formatCurrency(safeValue)}
                        </p>
                        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                    </div>
                    <div className={`p-3 rounded-xl ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
                {onClick && <p className="text-xs text-primary-500 mt-2">Click for details →</p>}
            </div>
        );
    };

    const DetailModal = () => {
        if (!activeModal || !data?.details) return null;

        let title = '';
        let items: any[] = [];
        let columns: { key: string; label: string }[] = [];

        switch (activeModal) {
            case 'revenue':
                title = '💰 Revenue Breakdown (Orders)';
                items = data.details.orders;
                columns = [
                    { key: 'id', label: 'Order #' },
                    { key: 'created_at', label: 'Date' },
                    { key: 'grand_total', label: 'Amount' }
                ];
                break;
            case 'expenses':
            case 'cashOutflow':
                title = '📉 Expenses Breakdown';
                items = data.details.expenses;
                columns = [
                    { key: 'date', label: 'Date' },
                    { key: 'reference', label: 'Reference' },
                    { key: 'category', label: 'Category' },
                    { key: 'description', label: 'Description' },
                    { key: 'amount', label: 'Amount' }
                ];
                break;
            case 'cashInflow':
                title = '📈 Income Breakdown';
                items = data.details.income;
                columns = [
                    { key: 'date', label: 'Date' },
                    { key: 'reference', label: 'Reference' },
                    { key: 'category', label: 'Category' },
                    { key: 'description', label: 'Description' },
                    { key: 'amount', label: 'Amount' }
                ];
                break;
            case 'cogs':
                title = '📦 COGS Breakdown (Cost of Goods Sold)';
                items = data.details.cogs || [];
                columns = [
                    { key: 'product_name', label: 'Product' },
                    { key: 'quantity', label: 'Qty Sold' },
                    { key: 'materials_cost', label: 'Materials Cost' }
                ];
                break;
        }

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                        <button
                            onClick={() => setActiveModal(null)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto max-h-[60vh]">
                        {items.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No data available for this period</p>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {columns.map(col => (
                                            <th key={col.key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            {columns.map(col => (
                                                <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                                                    {col.key === 'amount' || col.key === 'grand_total' || col.key === 'materials_cost'
                                                        ? formatCurrency(item[col.key])
                                                        : col.key === 'date' || col.key === 'created_at'
                                                            ? new Date(item[col.key]).toLocaleDateString('en-GB')
                                                            : item[col.key] || '-'
                                                    }
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-100 font-semibold">
                                    <tr>
                                        <td colSpan={columns.length - 1} className="px-4 py-3 text-right">Total:</td>
                                        <td className="px-4 py-3">
                                            {formatCurrency(items.reduce((sum, item) => sum + (item.amount || item.grand_total || item.materials_cost || 0), 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary-600" />
                        <h1 className="text-2xl font-bold text-gray-900">📊 Business Analysis</h1>
                    </div>
                </div>

                {/* Period Selector */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Time Period
                            </label>
                            <select
                                value={periodType}
                                onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="thisQuarter">This Quarter</option>
                                <option value="lastQuarter">Last Quarter</option>
                                <option value="thisYear">This Year</option>
                                <option value="lastYear">Last Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        {periodType === 'custom' && (
                            <>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {data?.period && (
                        <p className="mt-3 text-sm text-gray-500">
                            Period: {new Date(data.period.startDate).toLocaleDateString('en-GB')} - {new Date(data.period.endDate).toLocaleDateString('en-GB')}
                            {data.ordersCount > 0 && ` | ${data.ordersCount} orders`}
                        </p>
                    )}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                        <span className="ml-3 text-gray-600">Calculating metrics...</span>
                    </div>
                ) : data ? (
                    <>
                        {/* Revenue & Profit Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">💰 Revenue & Profit</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard
                                    title="Revenue"
                                    value={data.revenue}
                                    icon={TrendingUp}
                                    color="bg-green-500"
                                    subtitle="Total sales from orders"
                                    onClick={() => setActiveModal('revenue')}
                                />
                                <MetricCard
                                    title="COGS"
                                    value={data.cogs}
                                    icon={Package}
                                    color="bg-orange-500"
                                    subtitle="Cost of goods sold"
                                    onClick={() => setActiveModal('cogs')}
                                />
                                <MetricCard
                                    title="Gross Profit"
                                    value={data.grossProfit}
                                    icon={TrendingUp}
                                    color="bg-emerald-500"
                                    subtitle="Revenue - COGS"
                                />
                                <MetricCard
                                    title="Net Profit"
                                    value={data.netProfit}
                                    icon={DollarSign}
                                    color={data.netProfit >= 0 ? "bg-blue-500" : "bg-red-500"}
                                    subtitle="Gross Profit - Operating Expenses"
                                />
                            </div>
                        </div>

                        {/* Expenses Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">📉 Expenses</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <MetricCard
                                    title="Operating Expenses"
                                    value={data.operatingExpenses}
                                    icon={TrendingDown}
                                    color="bg-red-500"
                                    subtitle="From cashflow transactions"
                                    onClick={() => setActiveModal('expenses')}
                                />
                                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Gross Margin</p>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {data.revenue > 0 ? Math.round((data.grossProfit / data.revenue) * 100) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cash Flow Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">💵 Cash Flow</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <MetricCard
                                    title="Cash Inflow"
                                    value={data.cashInflow}
                                    icon={ArrowDownCircle}
                                    color="bg-green-600"
                                    subtitle="Income from cashflow"
                                    onClick={() => setActiveModal('cashInflow')}
                                />
                                <MetricCard
                                    title="Cash Outflow"
                                    value={data.cashOutflow}
                                    icon={ArrowUpCircle}
                                    color="bg-red-600"
                                    subtitle="Expenses from cashflow"
                                    onClick={() => setActiveModal('cashOutflow')}
                                />
                                <MetricCard
                                    title="Net Cash Flow"
                                    value={data.cashFlow}
                                    icon={Wallet}
                                    color={data.cashFlow >= 0 ? "bg-indigo-500" : "bg-rose-500"}
                                    subtitle="Inflow - Outflow"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                        No data available for the selected period.
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <DetailModal />
        </div>
    );
}
