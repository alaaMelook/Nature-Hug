-- ============================================
-- ANNOUNCEMENTS SYSTEM - SQL MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create announcements table in the store schema
CREATE TABLE IF NOT EXISTS store.announcements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target TEXT NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'specific')),
    target_member_id INTEGER REFERENCES store.members(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES store.customers(id) ON DELETE CASCADE,
    read_by JSONB DEFAULT '[]'::jsonb,
    reactions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_announcements_target ON store.announcements(target);
CREATE INDEX IF NOT EXISTS idx_announcements_target_member ON store.announcements(target_member_id) WHERE target_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON store.announcements(created_at DESC);

-- 3. Enable RLS on announcements table
ALTER TABLE store.announcements ENABLE ROW LEVEL SECURITY;

-- 4. Grant access to service role
GRANT ALL ON store.announcements TO service_role;
GRANT USAGE, SELECT ON SEQUENCE store.announcements_id_seq TO service_role;
