-- ============================================
-- BAZAAR EXPENSES TABLE - SQL MIGRATION
-- Tracks all expenses associated with a bazaar
-- for net profit calculation
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create bazaar_expenses table in the store schema
CREATE TABLE IF NOT EXISTS store.bazaar_expenses (
    id SERIAL PRIMARY KEY,
    bazaar_id INTEGER NOT NULL REFERENCES store.bazaars(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'other'
        CHECK (category IN ('booth_rental', 'transportation', 'packaging', 'employee', 'marketing', 'other')),
    label TEXT NOT NULL DEFAULT '',
    amount NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create index for faster lookups by bazaar
CREATE INDEX IF NOT EXISTS idx_bazaar_expenses_bazaar_id ON store.bazaar_expenses(bazaar_id);

-- 3. Enable RLS (same pattern as other store tables)
ALTER TABLE store.bazaar_expenses ENABLE ROW LEVEL SECURITY;

-- 4. Grant access to service role (admin operations use supabaseAdmin)
GRANT ALL ON store.bazaar_expenses TO service_role;
GRANT USAGE, SELECT ON SEQUENCE store.bazaar_expenses_id_seq TO service_role;
