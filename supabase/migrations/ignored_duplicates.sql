-- Create a table to track dismissed duplicate pairs
CREATE TABLE IF NOT EXISTS store.ignored_duplicates (
    phone TEXT NOT NULL,
    PRIMARY KEY (phone),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and grant service role
ALTER TABLE store.ignored_duplicates ENABLE ROW LEVEL SECURITY;
GRANT ALL ON store.ignored_duplicates TO service_role;
