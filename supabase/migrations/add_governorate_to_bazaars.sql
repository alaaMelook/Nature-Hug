-- Add governorate_slug column to bazaars table
-- Default to 'cairo' so existing bazaars keep working
ALTER TABLE store.bazaars
ADD COLUMN IF NOT EXISTS governorate_slug TEXT DEFAULT 'cairo';
