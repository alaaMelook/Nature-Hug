export type BazaarExpenseCategory =
    'booth_rental' | 'transportation' | 'packaging' | 'employee' | 'marketing' | 'other';

export interface BazaarExpense {
    id: number;
    bazaar_id: number;
    category: BazaarExpenseCategory;
    label: string;
    amount: number;
    notes: string | null;
    created_at: string;
}
