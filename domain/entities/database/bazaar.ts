export type BazaarStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Bazaar {
    id: number;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    status: BazaarStatus;
    notes: string | null;
    governorate_slug: string | null;
    created_at: string;
}
