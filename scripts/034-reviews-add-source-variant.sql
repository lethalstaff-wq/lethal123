-- Adds source/variant columns so legacy reviews imported from SellAuth
-- can be separated from native ones in the UI.
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'native'
    CHECK (source IN ('native', 'sellauth_legacy')),
  ADD COLUMN IF NOT EXISTS variant_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS external_id BIGINT;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_external_id_unique
  ON reviews(external_id) WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS reviews_source_idx ON reviews(source);
