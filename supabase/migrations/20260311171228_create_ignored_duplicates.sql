-- Create a table to track dismissed duplicate pairs
CREATE TABLE IF NOT EXISTS store.ignored_duplicates (
    group_id TEXT NOT NULL,
    PRIMARY KEY (group_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and grant service role
ALTER TABLE store.ignored_duplicates ENABLE ROW LEVEL SECURITY;
GRANT ALL ON store.ignored_duplicates TO service_role;
