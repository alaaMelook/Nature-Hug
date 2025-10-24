export interface Customer {
    id: number;
    created_at: string;
    name?: string;
    phone?: string;
    phone2?: string;
    email?: string;
    auth_user_id?: string;
}

export interface CustomerAddress {
    id: number;
    customer_id: number;
    address: string;
    governorate?: string;
    created_at: string;
}
