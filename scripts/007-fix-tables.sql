-- Rename settings → site_settings if exists
ALTER TABLE IF EXISTS settings RENAME TO site_settings;

-- Create if it doesn't exist yet
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON site_settings;
CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write" ON site_settings;
CREATE POLICY "Admin write" ON site_settings FOR ALL USING (true);

INSERT INTO site_settings (key, value) VALUES
  ('site_name',         '"Lethal Solutions"'),
  ('site_description',  '"Premium Gaming Cheats & Spoofers"'),
  ('discord_link',      '"https://discord.gg/lethaldma"'),
  ('youtube_link',      '""'),
  ('telegram_link',     '""'),
  ('announcement_text', '""'),
  ('coupon_code',       '""'),
  ('coupon_percent',    '"10"'),
  ('review_total',      '"3473"'),
  ('review_stars_5',    '"2947"'),
  ('review_stars_4',    '"347"'),
  ('review_stars_3',    '"108"'),
  ('review_stars_2',    '"48"'),
  ('review_stars_1',    '"23"'),
  ('review_daily_growth','"40"'),
  ('helpful_min',       '"50"'),
  ('helpful_max',       '"120"'),
  ('fortune_wheel_enabled','"true"'),
  ('live_purchases_enabled','"true"')
ON CONFLICT (key) DO NOTHING;

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  percent numeric NOT NULL DEFAULT 10,
  active boolean DEFAULT true,
  uses integer DEFAULT 0,
  max_uses integer,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin all" ON coupons;
CREATE POLICY "Admin all" ON coupons FOR ALL USING (true);
DROP POLICY IF EXISTS "Public read active" ON coupons;
CREATE POLICY "Public read active" ON coupons 
  FOR SELECT USING (active = true);

-- Insert fortune wheel codes
INSERT INTO coupons (code, percent, active) VALUES
  ('EASTER5',  5,  true),
  ('BUNNY10',  10, true),
  ('EGG15',    15, true),
  ('SPRING7',  7,  true),
  ('EASTER20', 20, true),
  ('HUNT12',   12, true),
  ('RABBIT8',  8,  true),
  ('GOLDEN25', 25, true)
ON CONFLICT (code) DO UPDATE SET active = true, percent = EXCLUDED.percent;

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_code text UNIQUE NOT NULL,
  referred_email text,
  referred_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',
  reward_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own" ON referrals;
CREATE POLICY "Users see own" ON referrals
  FOR SELECT USING (referrer_id = auth.uid());
DROP POLICY IF EXISTS "Users insert own" ON referrals;
CREATE POLICY "Users insert own" ON referrals
  FOR INSERT WITH CHECK (referrer_id = auth.uid());
DROP POLICY IF EXISTS "Admin all referrals" ON referrals;
CREATE POLICY "Admin all referrals" ON referrals FOR ALL USING (true);
