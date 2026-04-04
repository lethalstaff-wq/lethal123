CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_all" ON site_settings FOR ALL USING (true);

-- Seed default review stats
INSERT INTO site_settings (key, value) VALUES
  ('review_total', '3473'),
  ('review_5star', '2947'),
  ('review_4star', '347'),
  ('review_3star', '108'),
  ('review_2star', '48'),
  ('review_1star', '23'),
  ('review_daily_growth', '40'),
  ('review_growth_start', '2026-02-18')
ON CONFLICT (key) DO NOTHING;
