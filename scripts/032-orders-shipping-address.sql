-- Capture shipping address for physical bundles (DMA cards).
-- Stored as JSONB so we don't need per-field columns; admin UI can unpack it.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_address jsonb;
