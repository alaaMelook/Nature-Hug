"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wallet, TrendingUp, TrendingDown, DollarSign, Filter, Calendar } from "lucide-react";

interface Category {
    id: number;
    name: string;
}

interface Transaction {
    id: number;
    date: string;
    type: 'income' | 'expense';
    reference: string | null;
    category_id: number | null;
    description: string | null;
    units: number;
    unit_price: number | null;
    amount: number;
    payment_method: string;
    notes: string | null;
    cashflow_categories: Category | null;
}

interface Summary {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
}

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'instapay', label: 'Instapay' },
];

export default function CashflowPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpenses: 0, netProfit: 0 });
    const [loading, setLoading] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Modal state
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [newTransaction, setNewTransaction] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'expense' as 'income' | 'expense',
        reference: '',
        category_id: '',
        description: '',
        units: 1,
        unit_price: 0,
        amount: 0,
        payment_method: 'cash',
        notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (filterType) params.append('type', filterType);
            if (filterCategory) params.append('categoryId', filterCategory);

            const [transRes, catRes, sumRes] = await Promise.all([
                fetch(`/api/admin/finance/cashflow?${params}`),
                fetch('/api/admin/finance/cashflow-categories'),
                fetch(`/api/admin/finance/cashflow-summary?${params}`)
            ]);

            const [transData, catData, sumData] = await Promise.all([
                transRes.json(),
                catRes.json(),
                sumRes.json()
            ]);

            setTransactions(transData);
            setCategories(catData);
            setSummary(sumData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, filterType, filterCategory]);

    const handleAdd = async () => {
        if (!newTransaction.amount) {
            alert("Amount is required");
            return;
        }

        const res = await fetch("/api/admin/finance/cashflow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...newTransaction,
                category_id: newTransaction.category_id || null
            }),
        });

        if (res.ok) {
            setAdding(false);
            setNewTransaction({
                date: new Date().toISOString().split('T')[0],
                type: 'expense',
                reference: '',
                category_id: '',
                description: '',
                units: 1,
                unit_price: 0,
                amount: 0,
                payment_method: 'cash',
                notes: ''
            });
            fetchData();
        } else {
            const data = await res.json();
            alert("Error: " + (data.error || "Try again"));
        }
    };

    const handleUpdate = async () => {
        if (!editing) return;

        const res = await fetch(`/api/admin/finance/cashflow/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editing),
        });

        if (res.ok) {
            setEditing(null);
            fetchData();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;

        const res = await fetch(`/api/admin/finance/cashflow/${id}`, { method: "DELETE" });
        if (res.ok) {
            fetchData();
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-primary-600" />
                        <h1 className="text-2xl font-bold text-gray-900">💰 Cashflow Dashboard</h1>
                    </div>
                    <button
                        onClick={() => setAdding(true)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Transaction
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Income */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Income</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(summary.totalIncome)}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(summary.totalExpenses)}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <TrendingDown className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Net Profit */}
                    <div className={`rounded-xl p-6 text-white shadow-lg ${summary.netProfit >= 0
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-orange-500 to-amber-600'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Net Profit</p>
                                <p className="text-3xl font-bold mt-1">{formatCurrency(summary.netProfit)}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <DollarSign className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                From Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                To Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Filter className="w-4 h-4 inline mr-1" />
                                Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All</option>
                                <option value="income">📈 Income</option>
                                <option value="expense">📉 Expense</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No transactions found</td>
                                    </tr>
                                ) : (
                                    transactions.map((trans) => (
                                        <tr key={trans.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(trans.date)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${trans.type === 'income'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {trans.type === 'income' ? '📈 Income' : '📉 Expense'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{trans.reference || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{trans.cashflow_categories?.name || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{trans.description || '-'}</td>
                                            <td className={`px-4 py-3 text-sm font-bold ${trans.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {trans.type === 'income' ? '+' : '-'}{formatCurrency(trans.amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                                                    {trans.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setEditing(trans)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(trans.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Transaction Modal */}
                {adding && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">Add New Transaction</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={newTransaction.date}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={newTransaction.type}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            <option value="income">📈 Income</option>
                                            <option value="expense">📉 Expense</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dr. yasmen amer"
                                        value={newTransaction.reference}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, reference: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={newTransaction.category_id}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, category_id: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="">-- Select Category --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        placeholder="Transaction description"
                                        value={newTransaction.description}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={newTransaction.amount || ''}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                        <select
                                            value={newTransaction.payment_method}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, payment_method: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            {PAYMENT_METHODS.map((pm) => (
                                                <option key={pm.value} value={pm.value}>{pm.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        placeholder="Additional notes..."
                                        value={newTransaction.notes}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => setAdding(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdd}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Transaction Modal */}
                {editing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">Edit Transaction</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={editing.date}
                                            onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={editing.type}
                                            onChange={(e) => setEditing({ ...editing, type: e.target.value as 'income' | 'expense' })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            <option value="income">📈 Income</option>
                                            <option value="expense">📉 Expense</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                                    <input
                                        type="text"
                                        value={editing.reference || ''}
                                        onChange={(e) => setEditing({ ...editing, reference: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={editing.category_id || ''}
                                        onChange={(e) => setEditing({ ...editing, category_id: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="">-- Select Category --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={editing.description || ''}
                                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                        <input
                                            type="number"
                                            value={editing.amount}
                                            onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                        <select
                                            value={editing.payment_method}
                                            onChange={(e) => setEditing({ ...editing, payment_method: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            {PAYMENT_METHODS.map((pm) => (
                                                <option key={pm.value} value={pm.value}>{pm.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={editing.notes || ''}
                                        onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => setEditing(null)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
