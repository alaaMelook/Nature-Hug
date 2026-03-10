-- Payment Info table for storing InstaPay/Wallet numbers and QR codes
CREATE TABLE IF NOT EXISTS store.payment_info (
    id SERIAL PRIMARY KEY,
    method TEXT NOT NULL UNIQUE, -- 'instapay', 'wallet'
    account_number TEXT,
    account_name TEXT,
    qr_code_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed defaults
INSERT INTO store.payment_info (method) VALUES ('instapay'), ('wallet')
ON CONFLICT (method) DO NOTHING;

-- RLS
ALTER TABLE store.payment_info ENABLE ROW LEVEL SECURITY;
