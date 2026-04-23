-- Set random helpful counts between 50-120 on all reviews
UPDATE reviews SET helpful = floor(random() * 71 + 50)::int;

-- A small portion (about 5%) get higher counts 120-250 to look natural
UPDATE reviews SET helpful = floor(random() * 131 + 120)::int
WHERE id IN (SELECT id FROM reviews ORDER BY random() LIMIT (SELECT count(*) / 20 FROM reviews));

-- A tiny portion (about 2%) get lower counts 15-49 so it's not all uniform
UPDATE reviews SET helpful = floor(random() * 35 + 15)::int
WHERE id IN (SELECT id FROM reviews ORDER BY random() LIMIT (SELECT count(*) / 50 FROM reviews));
