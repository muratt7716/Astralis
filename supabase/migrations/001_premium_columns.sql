-- Lemon Squeezy premium subscription columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_type TEXT,
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_order_id TEXT;

-- is_premium zaten var, emin olmak için:
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN profiles.subscription_type IS 'monthly | lifetime | NULL';
COMMENT ON COLUMN profiles.subscription_end_date IS 'monthly abonelik bitiş tarihi; lifetime için NULL';
