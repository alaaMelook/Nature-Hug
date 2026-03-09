-- ============================================
-- BAZAAR MANAGEMENT SYSTEM - SQL MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create bazaars table in the store schema
CREATE TABLE IF NOT EXISTS store.bazaars (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add bazaar_id column to orders table (nullable - null means online order)
ALTER TABLE store.orders
ADD COLUMN IF NOT EXISTS bazaar_id INTEGER REFERENCES store.bazaars(id) ON DELETE SET NULL;

-- 3. Add bazaar_only and bazaar_id columns to promo_codes table
ALTER TABLE store.promo_codes
ADD COLUMN IF NOT EXISTS bazaar_only BOOLEAN DEFAULT FALSE;

ALTER TABLE store.promo_codes
ADD COLUMN IF NOT EXISTS bazaar_id INTEGER REFERENCES store.bazaars(id) ON DELETE SET NULL;

-- 4. Create index for faster bazaar order lookups
CREATE INDEX IF NOT EXISTS idx_orders_bazaar_id ON store.orders(bazaar_id) WHERE bazaar_id IS NOT NULL;

-- 5. Create index for bazaar promo codes
CREATE INDEX IF NOT EXISTS idx_promo_codes_bazaar_id ON store.promo_codes(bazaar_id) WHERE bazaar_id IS NOT NULL;

-- 6. Enable RLS on bazaars table (same pattern as other store tables)
ALTER TABLE store.bazaars ENABLE ROW LEVEL SECURITY;

-- 7. Grant access to service role (admin operations use supabaseAdmin)
GRANT ALL ON store.bazaars TO service_role;
GRANT USAGE, SELECT ON SEQUENCE store.bazaars_id_seq TO service_role;
