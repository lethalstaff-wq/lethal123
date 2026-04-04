-- Product statuses (admin controlled)
CREATE TABLE IF NOT EXISTS product_statuses (
  product_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'undetected',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO product_statuses (product_id, status) VALUES
  ('perm-spoofer','undetected'),('temp-spoofer','undetected'),
  ('fortnite-external','undetected'),('custom-dma-firmware','undetected'),
  ('streck','undetected'),('blurred','undetected'),
  ('dma-basic','in_stock'),('dma-advanced','in_stock'),('dma-elite','in_stock')
ON CONFLICT DO NOTHING;

-- Site settings
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);
INSERT INTO settings (key, value) VALUES
  ('review_total','3473'),('review_daily_growth','40'),
  ('orders_today_base','309'),('orders_today_growth','3'),
  ('fortune_wheel_enabled','true'),('live_purchases_enabled','true'),
  ('site_announcement','')
ON CONFLICT DO NOTHING;

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  content text,
  category text DEFAULT 'Guide',
  author text DEFAULT 'Lethal Team',
  published_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true,
  read_time_minutes int DEFAULT 5
);

-- Add RLS policies
ALTER TABLE product_statuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON product_statuses;
CREATE POLICY "Public read" ON product_statuses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write" ON product_statuses;
CREATE POLICY "Admin write" ON product_statuses FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON settings;
CREATE POLICY "Public read" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write" ON settings;
CREATE POLICY "Admin write" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published" ON blog_posts;
CREATE POLICY "Public read published" ON blog_posts FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admin all" ON blog_posts;
CREATE POLICY "Admin all" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
);
