"use client";
import { Loader2, Plug, Package, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, RotateCcw, Truck, Calendar, DollarSign, AlertTriangle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getDashboardLinkAction } from "@/ui/hooks/admin/shippingActions";
import { useTranslation } from "react-i18next";

interface ShipmentStats {
    totalOrders: number;
    totalShipments: number;
    delivered: number;
    cancelled: number;
    returned: number;
    pending: number;
    inTransit: number;
    successRate: number;
    failureRate: number;
    avgDeliveryTime: number;
    totalCOD: number;
    collectedCOD: number;
    pendingCOD: number;
    statusBreakdown: { name: string; value: number; color: string }[];
}

// Date presets for quick selection
const datePresets = [
    { key: 'today', label: 'Today', days: 0 },
    { key: 'week', label: 'This Week', days: 7 },
    { key: 'month', label: 'This Month', days: 30 },
    { key: '3months', label: 'Last 3 Months', days: 90 },
    { key: 'year', label: 'This Year', days: 365 },
    { key: 'all', label: 'All Time', days: -1 },
];

export default function ShipmentDashboard() {
    const [link, setLink] = useState<string | null>();
    const [loading, setLoading] = useState<boolean>(false);
    const [stats, setStats] = useState<ShipmentStats | null>(null);
    const [statsLoading, setStatsLoading] = useState<boolean>(true);
    const [selectedPreset, setSelectedPreset] = useState<string>('month');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const { t, i18n } = useTranslation();

    const open = useCallback(async () => {
        setLoading(true);
        const result = await getDashboardLinkAction();
        if (result.success) {
            setLink(result.link);
        }
        setLoading(false);
    }, []);

    const fetchStats = useCallback(async (start?: string, end?: string) => {
        setStatsLoading(true);
        try {
            const params = new URLSearchParams();
            if (start) params.set('startDate', start);
            if (end) params.set('endDate', end);

            const res = await fetch(`/api/admin/shipments/stats?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch shipment stats:", error);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const handlePresetChange = (preset: string) => {
        setSelectedPreset(preset);
        const presetDays = datePresets.find(p => p.key === preset)?.days ?? 30;

        if (presetDays === -1) {
            // All time
            setStartDate('');
            setEndDate('');
            fetchStats();
        } else if (presetDays === 0) {
            // Today
            const today = new Date().toISOString().split('T')[0];
            setStartDate(today);
            setEndDate(today);
            fetchStats(today, new Date().toISOString());
        } else {
            const end = new Date();
            const start = new Date(Date.now() - presetDays * 24 * 60 * 60 * 1000);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
            fetchStats(start.toISOString(), end.toISOString());
        }
    };

    const handleCustomDateChange = () => {
        if (startDate && endDate) {
            setSelectedPreset('custom');
            fetchStats(new Date(startDate).toISOString(), new Date(endDate).toISOString());
        }
    };

    useEffect(() => {
        open();
        handlePresetChange('month');
    }, []);

    const StatCard = ({ title, value, subtitle, icon: Icon, color }: {
        title: string;
        value: string | number;
        subtitle?: string;
        icon: any;
        color: string;
    }) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );

    const getPresetLabel = () => {
        const preset = datePresets.find(p => p.key === selectedPreset);
        if (selectedPreset === 'custom' && startDate && endDate) {
            return `${startDate} → ${endDate}`;
        }
        return preset?.label || 'Custom';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header with Date Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('shipping.statistics') || 'Shipment Statistics'}</h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{t('shipping.showingData') || 'Showing data for:'} <strong>{getPresetLabel()}</strong></span>
                    </p>
                </div>

                {/* Date Range Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Preset Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {datePresets.map(preset => (
                            <button
                                key={preset.key}
                                onClick={() => handlePresetChange(preset.key)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedPreset === preset.key
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {t(`shipping.presets.${preset.key}`) || preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Range */}
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        />
                        <span className="text-gray-400">→</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        />
                        <button
                            onClick={handleCustomDateChange}
                            className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            {statsLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
            ) : stats ? (
                <>
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title={i18n.language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                            value={stats.totalOrders}
                            icon={Package}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title={t('shipping.successRate') || 'Success Rate'}
                            value={`${stats.successRate}%`}
                            subtitle={`${stats.delivered} ${t('shipping.deliveredLabel') || 'delivered'}`}
                            icon={CheckCircle2}
                            color="bg-green-500"
                        />
                        <StatCard
                            title={t('shipping.avgDeliveryTime') || 'Avg Delivery Time'}
                            value={stats.avgDeliveryTime}
                            subtitle={t('days') || 'days'}
                            icon={Clock}
                            color="bg-amber-500"
                        />
                        <StatCard
                            title={t('shipping.inTransit') || 'In Transit'}
                            value={stats.inTransit}
                            icon={Truck}
                            color="bg-purple-500"
                        />
                    </div>

                    {/* COD Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            title={t('shipping.totalCOD') || 'Total COD Value'}
                            value={`${stats.totalCOD?.toLocaleString() || 0} EGP`}
                            icon={DollarSign}
                            color="bg-emerald-500"
                        />
                        <StatCard
                            title={t('shipping.collectedCOD') || 'Collected COD'}
                            value={`${stats.collectedCOD?.toLocaleString() || 0} EGP`}
                            subtitle={stats.totalCOD ? `${((stats.collectedCOD / stats.totalCOD) * 100).toFixed(1)}%` : '0%'}
                            icon={CheckCircle2}
                            color="bg-teal-500"
                        />
                        <StatCard
                            title={t('shipping.pendingCOD') || 'Pending COD'}
                            value={`${stats.pendingCOD?.toLocaleString() || 0} EGP`}
                            icon={AlertTriangle}
                            color="bg-orange-500"
                        />
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-green-600" size={24} />
                                <div>
                                    <p className="text-sm text-green-700">{t('shipping.delivered') || 'Delivered'}</p>
                                    <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                            <div className="flex items-center gap-3">
                                <Clock className="text-amber-600" size={24} />
                                <div>
                                    <p className="text-sm text-amber-700">{t('shipping.pending') || 'Pending'}</p>
                                    <p className="text-2xl font-bold text-amber-800">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                            <div className="flex items-center gap-3">
                                <XCircle className="text-red-600" size={24} />
                                <div>
                                    <p className="text-sm text-red-700">{t('shipping.cancelled') || 'Cancelled'}</p>
                                    <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <div className="flex items-center gap-3">
                                <RotateCcw className="text-purple-600" size={24} />
                                <div>
                                    <p className="text-sm text-purple-700">{t('shipping.returned') || 'Returned'}</p>
                                    <p className="text-2xl font-bold text-purple-800">{stats.returned}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown with Progress Bars */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">{t('shipping.statusBreakdown') || 'Status Breakdown'}</h3>
                        <div className="space-y-4">
                            {stats.statusBreakdown.map((item) => {
                                const percentage = stats.totalOrders > 0
                                    ? (item.value / stats.totalOrders) * 100
                                    : 0;
                                return (
                                    <div key={item.name}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-gray-700">{t(`shipping.status.${item.name.toLowerCase()}`) || item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-900">{item.value}</span>
                                                <span className="text-gray-400 text-sm w-16 text-right">
                                                    {percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: item.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Failure Rate Warning */}
                    {stats.failureRate > 20 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                            <AlertTriangle className="text-red-600" size={24} />
                            <div>
                                <p className="font-semibold text-red-800">{t('shipping.highFailureRate') || 'High Failure Rate Alert'}</p>
                                <p className="text-sm text-red-600">
                                    {t('shipping.failureRateWarning', { rate: stats.failureRate }) ||
                                        `Your failure rate (${stats.failureRate}%) is above the target. Consider reviewing cancelled and returned orders.`}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-gray-500">{t('shipping.noData') || 'No shipment data available'}</p>
            )}

            {/* Power BI Dashboard */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('shipping.providerDashboard') || 'Shipping Provider Dashboard'}</h2>
                {!link ? (
                    <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-gray-100">
                        <button
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                            onClick={() => open()}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <Plug size={16} />
                            )}
                            {loading ? t("loggingIn") : t("login")}
                        </button>
                    </div>
                ) : (
                    <iframe
                        src={link}
                        width="100%"
                        height="600"
                        allowFullScreen
                        className="border-none rounded-2xl shadow-md"
                    />
                )}
            </div>
        </div>
    );
}
