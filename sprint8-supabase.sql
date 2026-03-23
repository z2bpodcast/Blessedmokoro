-- ============================================================
-- Z2B SPRINT 8 — PAYFAST + TRANSACTIONS + PAYMENT TRACKING
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount          numeric NOT NULL,
  tier            text NOT NULL,
  pf_payment_id   text,
  payment_method  text NOT NULL DEFAULT 'payfast',
  status          text NOT NULL DEFAULT 'pending',
  referred_by     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. Comp earnings table (if not exists)
CREATE TABLE IF NOT EXISTS comp_earnings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  builder_name    text,
  earning_type    text NOT NULL,
  amount          numeric NOT NULL,
  source_user_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'pending',
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 3. Add payment columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS upgraded_at    timestamptz;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user   ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_comp_user           ON comp_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_comp_type           ON comp_earnings(earning_type);

-- 5. RLS
ALTER TABLE transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_earnings  ENABLE ROW LEVEL SECURITY;

-- Transactions — user sees own, admin sees all
DROP POLICY IF EXISTS "own_transactions" ON transactions;
CREATE POLICY "own_transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_transactions" ON transactions;
CREATE POLICY "admin_transactions" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()
            AND user_role IN ('ceo','admin','superadmin'))
  );

DROP POLICY IF EXISTS "service_insert_transactions" ON transactions;
CREATE POLICY "service_insert_transactions" ON transactions
  FOR INSERT WITH CHECK (true);

-- Comp earnings
DROP POLICY IF EXISTS "own_comp" ON comp_earnings;
CREATE POLICY "own_comp" ON comp_earnings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "service_comp" ON comp_earnings;
CREATE POLICY "service_comp" ON comp_earnings
  FOR ALL USING (true);

-- 6. Function: get sponsor for commission calculation
CREATE OR REPLACE FUNCTION get_isp_rate(p_tier text)
RETURNS numeric AS $$
BEGIN
  RETURN CASE p_tier
    WHEN 'bronze'   THEN 0.18
    WHEN 'copper'   THEN 0.22
    WHEN 'silver'   THEN 0.25
    WHEN 'gold'     THEN 0.28
    WHEN 'platinum' THEN 0.30
    ELSE 0.10
  END;
END;
$$ LANGUAGE plpgsql;

-- 7. Environment variable reminder (set these in Vercel)
-- PAYFAST_MERCHANT_ID=your_merchant_id
-- PAYFAST_MERCHANT_KEY=your_merchant_key
-- PAYFAST_PASSPHRASE=your_passphrase
-- NEXT_PUBLIC_PAYFAST_MERCHANT_ID=your_merchant_id
-- NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=your_merchant_key
-- NEXT_PUBLIC_PAYFAST_SANDBOX=true (for testing)
-- NEXT_PUBLIC_APP_URL=https://app.z2blegacybuilders.co.za

-- Verify
SELECT 'transactions' as tbl, count(*) FROM transactions
UNION ALL SELECT 'comp_earnings', count(*) FROM comp_earnings;
