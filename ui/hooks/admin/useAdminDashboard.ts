import { useState, useEffect } from 'react';
import { IAdminClientRepository } from '@/data/repositories/client/iAdminRepository';
import { DashboardStats } from '@/domain/entities/views/admin/dashboardMetricsView';

export function useAdminDashboard() {
    // Default to current month
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const repo = new IAdminClientRepository();
                const result = await repo.getDashboardMetrics(startDate, endDate);

                if (mounted) {
                    setData(result);
                }
            } catch (err) {
                if (mounted) {
                    console.error("Failed to fetch dashboard stats:", err);
                    setError("Failed to load dashboard statistics");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            mounted = false;
        };
    }, [startDate, endDate]);

    return {
        data,
        loading,
        error,
        startDate,
        setStartDate,
        endDate,
        setEndDate
    };
}
