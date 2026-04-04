-- Seed products
INSERT INTO products (name, slug, description, category) VALUES
  ('Custom DMA Firmware', 'custom-dma-firmware', 'Built for precision. Designed to endure.', 'firmware'),
  ('Perm Spoofer', 'perm-spoofer', 'Built for precision. Trusted for performance.', 'spoofer'),
  ('Temp Spoofer', 'temp-spoofer', 'Built for consistency. Trusted for control.', 'spoofer'),
  ('Fortnite DMA Cheat', 'fortnite-dma', 'Built for precision. Designed for control.', 'cheat'),
  ('Blurred DMA Cheat', 'blurred-dma', 'Premium DMA cheat with advanced features.', 'cheat'),
  ('Streck DMA Cheat', 'streck-dma', 'Reliable DMA cheat solution.', 'cheat'),
  ('Fortnite External', 'fortnite-external', 'Clean UI. Fast setup. Tournament-ready.', 'cheat'),
  ('DMA Basic Bundle', 'dma-basic-bundle', 'Reliable foundation for everyday use. Includes: Captain DMA 100T-7th, EAC/BE Emulated, Mini DP Fuser V2, Blurred (30 Days), Macku (Free)', 'bundle'),
  ('DMA Advanced Bundle', 'dma-advanced-bundle', 'Balanced configuration for creators and semi-pro users. Includes: Captain DMA 100T-7th, Dichen D60 Fuser, Teensy (Firmware Included), EAC/BE Emulated Slotted, Blurred DMA (Quarterly)', 'bundle'),
  ('DMA Elite Bundle', 'dma-elite-bundle', 'Maximum performance — full emulation & lifetime access. Includes: Captain DMA 100T-7th, Dichen DC500 Fuser, Teensy (Firmware Included), Blurred Lifetime DMA Cheat, EAC/BE, FaceIt, VGK Emulated', 'bundle')
ON CONFLICT (slug) DO NOTHING;

-- Seed product variants
INSERT INTO product_variants (product_id, name, price, duration_days, is_lifetime)
SELECT id, 'EAC/BE Emulated', 200, NULL, FALSE FROM products WHERE slug = 'custom-dma-firmware'
UNION ALL
SELECT id, 'Slotted Edition', 450, NULL, FALSE FROM products WHERE slug = 'custom-dma-firmware'
UNION ALL
SELECT id, 'FaceIt/VGK', 975, NULL, FALSE FROM products WHERE slug = 'custom-dma-firmware'
UNION ALL
SELECT id, 'One-Time License', 35, NULL, FALSE FROM products WHERE slug = 'perm-spoofer'
UNION ALL
SELECT id, 'Lifetime License', 120, NULL, TRUE FROM products WHERE slug = 'perm-spoofer'
UNION ALL
SELECT id, '15-Day License', 20, 15, FALSE FROM products WHERE slug = 'temp-spoofer'
UNION ALL
SELECT id, '30-Day License', 40, 30, FALSE FROM products WHERE slug = 'temp-spoofer'
UNION ALL
SELECT id, '180-Day License', 150, 180, FALSE FROM products WHERE slug = 'temp-spoofer'
UNION ALL
SELECT id, 'Lifetime License', 500, NULL, TRUE FROM products WHERE slug = 'temp-spoofer'
UNION ALL
SELECT id, 'Weekly', 22, 7, FALSE FROM products WHERE slug = 'blurred-dma'
UNION ALL
SELECT id, 'Monthly', 35, 30, FALSE FROM products WHERE slug = 'blurred-dma'
UNION ALL
SELECT id, 'Quarterly', 85, 90, FALSE FROM products WHERE slug = 'blurred-dma'
UNION ALL
SELECT id, 'Lifetime', 385, NULL, TRUE FROM products WHERE slug = 'blurred-dma'
UNION ALL
SELECT id, '7 Days', 8, 7, FALSE FROM products WHERE slug = 'streck-dma'
UNION ALL
SELECT id, '30 Days', 15, 30, FALSE FROM products WHERE slug = 'streck-dma'
UNION ALL
SELECT id, '90 Days', 40, 90, FALSE FROM products WHERE slug = 'streck-dma'
UNION ALL
SELECT id, 'Lifetime', 150, NULL, TRUE FROM products WHERE slug = 'streck-dma'
UNION ALL
SELECT id, '1 Day', 6, 1, FALSE FROM products WHERE slug = 'fortnite-external'
UNION ALL
SELECT id, '3 Days', 13, 3, FALSE FROM products WHERE slug = 'fortnite-external'
UNION ALL
SELECT id, '7 Days', 25, 7, FALSE FROM products WHERE slug = 'fortnite-external'
UNION ALL
SELECT id, '30 Days', 60, 30, FALSE FROM products WHERE slug = 'fortnite-external'
UNION ALL
SELECT id, 'Lifetime', 130, NULL, TRUE FROM products WHERE slug = 'fortnite-external'
UNION ALL
SELECT id, 'Full Bundle', 425, NULL, FALSE FROM products WHERE slug = 'dma-basic-bundle'
UNION ALL
SELECT id, 'Full Bundle', 675, NULL, FALSE FROM products WHERE slug = 'dma-advanced-bundle'
UNION ALL
SELECT id, 'Full Bundle', 1500, NULL, FALSE FROM products WHERE slug = 'dma-elite-bundle';

-- Seed some featured reviews
INSERT INTO reviews (author_name, author_title, content, rating, is_featured) VALUES
  ('Jordan', 'Apex Legends Streamer', 'Clean ESP with great customization options. Doesn''t tank my FPS at all and looks natural on stream. Been dominating ranked with this for weeks now. Highly recommend!', 5, TRUE),
  ('Alex', 'Valorant Player', 'Best aimbot I''ve ever used! Been running it for 3 months straight with zero detections. The support team is super responsive and helped me configure everything perfectly.', 5, TRUE),
  ('Marcus', 'Warzone Enthusiast', 'The HWID spoofer saved my main account after a hardware ban. Works flawlessly and setup was incredibly easy. Definitely worth every penny for peace of mind.', 5, TRUE),
  ('Tyler', 'CS2 Competitive', 'DMA setup was smooth with their guide. Undetected for 6 months now. Great value for the price.', 5, TRUE),
  ('Sarah', 'Fortnite Pro', 'The external cheat is insane. Clean UI and zero issues with tournaments. Support answered my questions within minutes.', 5, TRUE),
  ('Mike', 'R6 Siege Player', 'Bought the Elite bundle - absolutely worth it. Everything works perfectly together. Premium quality.', 5, TRUE)
ON CONFLICT DO NOTHING;
