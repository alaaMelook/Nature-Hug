export interface Review {
    id: number;
    product_id?: number;
    customer_id?: number;
    rating?: number;
    comment?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}
