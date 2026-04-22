-- Fix any reviews with NULL verified/helpful so they pass the RLS public_read policy
UPDATE reviews SET verified = true WHERE verified IS NULL;
UPDATE reviews SET helpful = 0 WHERE helpful IS NULL;
UPDATE reviews SET is_auto = false WHERE is_auto IS NULL;
UPDATE reviews SET refunded = false WHERE refunded IS NULL;
