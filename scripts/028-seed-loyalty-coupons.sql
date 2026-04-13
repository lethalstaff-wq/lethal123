-- Seed loyalty tier coupons. Codes are exposed on /profile only to the matching tier;
-- validator accepts them for any user, so they double as referral-safe "promo" codes.
INSERT INTO coupons (code, discount_percent, is_active, max_uses, uses_count)
VALUES
  ('BRONZE5',     5,  true, null, 0),
  ('SILVER7',     7,  true, null, 0),
  ('GOLD10',      10, true, null, 0),
  ('PLATINUM15',  15, true, null, 0)
ON CONFLICT (code) DO UPDATE
SET discount_percent = EXCLUDED.discount_percent,
    is_active = true;
