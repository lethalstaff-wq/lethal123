INSERT INTO site_settings (key, value) VALUES
  ('review_total', '"3473"'),
  ('review_stars_5', '"2947"'),
  ('review_stars_4', '"347"'),
  ('review_stars_3', '"108"'),
  ('review_stars_2', '"48"'),
  ('review_stars_1', '"23"'),
  ('review_daily_growth', '"40"'),
  ('review_base_date', '"2026-02-18"')
ON CONFLICT (key) DO NOTHING;
