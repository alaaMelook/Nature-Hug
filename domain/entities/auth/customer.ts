export interface Customer {
    id: number;
    created_at: string;
    name?: string;
    phone: string | null;
    phone2: string | null;
    email?: string;
    auth_user_id?: string;
}

export interface CustomerAddress {
    id: number;
    customer_id: number;
    address: string;
    governorate_slug: string;
    created_at: string;
}
