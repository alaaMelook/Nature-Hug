export interface AccountReportView {
    customer_id: number;
    user_name: string;
    user_role: string; // 'admin', 'moderator', etc.
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
}

export interface ProductSalesReport {
    product_id: number;
    product_name: string;
    variant_id?: number;
    variant_name?: string;
    total_quantity_sold: number;
    total_revenue: number;
    order_count: number;
    sales_percentage: number;
}

export interface ReportSummary {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    period_start: Date;
    period_end: Date;
}
