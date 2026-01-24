"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Eye, Timer, TrendingDown, Globe, Monitor,
    Smartphone, Tablet, ArrowUpRight, BarChart2, RefreshCw, X, Info
} from "lucide-react";

interface AnalyticsData {
    visitors: number;
    sessions: number;
    pageViews: number;
    bounceRate: string;
    avgSessionDuration: number;
    newUsers: number;
    returningUsers: number;
    topPages: { path: string; views: number }[];
    trafficSources: { source: string; sessions: number }[];
    devices: { device: string; sessions: number }[];
    countries: { country: string; sessions: number }[];
    error?: string;
}

interface StatCardInfo {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    desc: string;
    explanation: string;
    formula: string;
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
}

export function AnalyticsScreen() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateMode, setDateMode] = useState<"preset" | "custom">("preset");
    const [presetRange, setPresetRange] = useState("30daysAgo");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [selectedCard, setSelectedCard] = useState<StatCardInfo | null>(null);

    // Set default custom dates
    useEffect(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        setCustomEndDate(today.toISOString().split('T')[0]);
        setCustomStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            let startDate = presetRange;
            let endDate = "today";

            if (dateMode === "custom" && customStartDate && customEndDate) {
                startDate = customStartDate;
                endDate = customEndDate;
            }

            const res = await fetch(`/api/admin/analytics/full?startDate=${startDate}&endDate=${endDate}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [presetRange, dateMode]);

    const statCards: StatCardInfo[] = [
        {
            title: "Visitors",
            value: data?.visitors ?? 0,
            icon: Users,
            color: "bg-blue-500",
            desc: "Unique users",
            explanation: "The number of unique users who visited your website during the selected period. Each person is counted only once, even if they visit multiple times.",
            formula: "COUNT(DISTINCT user_id)"
        },
        {
            title: "Sessions",
            value: data?.sessions ?? 0,
            icon: BarChart2,
            color: "bg-green-500",
            desc: "Total visits",
            explanation: "A session starts when a user opens your site and ends after 30 minutes of inactivity or at midnight. One visitor can have multiple sessions.",
            formula: "COUNT(all_sessions)"
        },
        {
            title: "Page Views",
            value: data?.pageViews ?? 0,
            icon: Eye,
            color: "bg-purple-500",
            desc: "Pages viewed",
            explanation: "The total number of pages viewed on your website. Each page load counts as a view, including reloads and returning to the same page.",
            formula: "COUNT(all_page_loads)"
        },
        {
            title: "Bounce Rate",
            value: `${data?.bounceRate ?? 0}%`,
            icon: TrendingDown,
            color: "bg-red-500",
            desc: "Left immediately",
            explanation: "The percentage of visitors who left your site after viewing only one page without any interaction. Lower is better!",
            formula: "(Single-page sessions ÷ Total sessions) × 100"
        },
        {
            title: "Avg Duration",
            value: formatDuration(data?.avgSessionDuration ?? 0),
            icon: Timer,
            color: "bg-amber-500",
            desc: "Time on site",
            explanation: "The average amount of time visitors spend on your website per session. Longer duration usually means more engagement.",
            formula: "Total session duration ÷ Number of sessions"
        },
        {
            title: "New Users",
            value: data?.newUsers ?? 0,
            icon: Users,
            color: "bg-teal-500",
            desc: "First time visitors",
            explanation: "Users who visited your website for the first time during this period. This helps track how many new potential customers you're reaching.",
            formula: "COUNT(users with first_visit in period)"
        },
    ];

    const getDeviceIcon = (device: string) => {
        switch (device.toLowerCase()) {
            case 'mobile': return Smartphone;
            case 'tablet': return Tablet;
            default: return Monitor;
        }
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h2>
                    <p className="text-gray-500 mt-1">Website traffic insights from Google Analytics</p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    {/* Date Mode Toggle */}
                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                        <button
                            onClick={() => setDateMode("preset")}
                            className={`px-3 py-2 text-sm ${dateMode === "preset" ? "bg-blue-500 text-white" : "bg-white text-gray-600"}`}
                        >
                            Preset
                        </button>
                        <button
                            onClick={() => setDateMode("custom")}
                            className={`px-3 py-2 text-sm ${dateMode === "custom" ? "bg-blue-500 text-white" : "bg-white text-gray-600"}`}
                        >
                            Custom
                        </button>
                    </div>

                    {dateMode === "preset" ? (
                        <select
                            value={presetRange}
                            onChange={(e) => setPresetRange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="7daysAgo">Last 7 days</option>
                            <option value="14daysAgo">Last 14 days</option>
                            <option value="30daysAgo">Last 30 days</option>
                            <option value="60daysAgo">Last 60 days</option>
                            <option value="90daysAgo">Last 90 days</option>
                            <option value="365daysAgo">Last 365 days</option>
                        </select>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-400">→</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        {dateMode === "custom" && <span className="text-sm">Apply</span>}
                    </button>
                </div>
            </div>

            {data?.error && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
                    ⚠️ {data.error === "Google Analytics not configured yet"
                        ? "Waiting for GA4 data to be collected (usually 24-48 hours after setup)"
                        : data.error}
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedCard(stat)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group relative"
                    >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Info className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                            <stat.icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {loading ? "..." : stat.value}
                        </p>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <p className="text-xs text-gray-400">{stat.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Info Modal */}
            <AnimatePresence>
                {selectedCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedCard(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 ${selectedCard.color} rounded-lg flex items-center justify-center`}>
                                        <selectedCard.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedCard.title}</h3>
                                        <p className="text-gray-500">{selectedCard.desc}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCard(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="text-center py-4 bg-gray-50 rounded-xl">
                                    <p className="text-4xl font-bold text-gray-900">{selectedCard.value}</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">📖 What is this?</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{selectedCard.explanation}</p>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <h4 className="font-semibold text-blue-700 mb-1">📊 Formula</h4>
                                    <code className="text-blue-600 text-sm">{selectedCard.formula}</code>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-purple-500" />
                        Top Pages
                        <span className="text-xs font-normal text-gray-400 ml-auto">Most viewed pages</span>
                    </h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 bg-gray-100 rounded"></div>)}
                            </div>
                        ) : data?.topPages?.length ? (
                            data.topPages.map((page, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-sm text-gray-700 truncate max-w-[70%]">{page.path}</span>
                                    <span className="text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">No data yet</p>
                        )}
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                        Traffic Sources
                        <span className="text-xs font-normal text-gray-400 ml-auto">Where visitors come from</span>
                    </h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 bg-gray-100 rounded"></div>)}
                            </div>
                        ) : data?.trafficSources?.length ? (
                            data.trafficSources.map((source, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-sm text-gray-700">{source.source}</span>
                                    <span className="text-sm font-semibold text-gray-900">{source.sessions.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">No data yet</p>
                        )}
                    </div>
                </div>

                {/* Devices */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-blue-500" />
                        Devices
                        <span className="text-xs font-normal text-gray-400 ml-auto">Desktop vs Mobile</span>
                    </h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded"></div>)}
                            </div>
                        ) : data?.devices?.length ? (
                            data.devices.map((device, i) => {
                                const Icon = getDeviceIcon(device.device);
                                const total = data.devices.reduce((acc, d) => acc + d.sessions, 0);
                                const percentage = total > 0 ? ((device.sessions / total) * 100).toFixed(1) : 0;
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Icon className="h-6 w-6 text-gray-500" />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-700 capitalize">{device.device}</span>
                                                <span className="text-sm text-gray-500">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-400 text-sm">No data yet</p>
                        )}
                    </div>
                </div>

                {/* Countries */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-teal-500" />
                        Top Countries
                        <span className="text-xs font-normal text-gray-400 ml-auto">Visitor locations</span>
                    </h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 bg-gray-100 rounded"></div>)}
                            </div>
                        ) : data?.countries?.length ? (
                            data.countries.map((country, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-sm text-gray-700">{country.country}</span>
                                    <span className="text-sm font-semibold text-gray-900">{country.sessions.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">No data yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
