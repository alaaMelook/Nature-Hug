export interface DashboardStats {
    // Overall Totals (BIGINT and NUMERIC)
    total_customers: number;
    total_products: number;
    total_orders: number;
    total_revenue: string; // Use string for high-precision currency

    // Current Period Metrics (BIGINT and NUMERIC)
    current_period_customers: number;
    current_period_products: number;
    current_period_orders: number;
    current_period_revenue: string; // Use string for high-precision currency
    current_period_avg_order_value: string; // AOV (NUMERIC)
    current_period_conversion_rate: string; // CR (NUMERIC, percentage)

    // Change/Delta Metrics (NUMERIC, percentage)
    customers_change: string;
    products_change: string;
    orders_change: string;
    revenue_change: string;
    avg_order_value_change: string;
}