-- Update review settings to exactly 3164 total reviews with no daily growth

-- Update in site_settings table only
UPDATE site_settings SET value = '3164' WHERE key = 'review_total';
UPDATE site_settings SET value = '2689' WHERE key = 'review_stars_5';
UPDATE site_settings SET value = '316' WHERE key = 'review_stars_4';
UPDATE site_settings SET value = '95' WHERE key = 'review_stars_3';
UPDATE site_settings SET value = '44' WHERE key = 'review_stars_2';
UPDATE site_settings SET value = '20' WHERE key = 'review_stars_1';
UPDATE site_settings SET value = '0' WHERE key = 'review_daily_growth';

-- Insert if not exists
INSERT INTO site_settings (key, value) VALUES ('review_total', '3164') ON CONFLICT (key) DO UPDATE SET value = '3164';
INSERT INTO site_settings (key, value) VALUES ('review_stars_5', '2689') ON CONFLICT (key) DO UPDATE SET value = '2689';
INSERT INTO site_settings (key, value) VALUES ('review_stars_4', '316') ON CONFLICT (key) DO UPDATE SET value = '316';
INSERT INTO site_settings (key, value) VALUES ('review_stars_3', '95') ON CONFLICT (key) DO UPDATE SET value = '95';
INSERT INTO site_settings (key, value) VALUES ('review_stars_2', '44') ON CONFLICT (key) DO UPDATE SET value = '44';
INSERT INTO site_settings (key, value) VALUES ('review_stars_1', '20') ON CONFLICT (key) DO UPDATE SET value = '20';
INSERT INTO site_settings (key, value) VALUES ('review_daily_growth', '0') ON CONFLICT (key) DO UPDATE SET value = '0';
