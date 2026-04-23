-- Two-stage support response model with persona attribution.
-- Replaces the earlier team_response_* shape (from migration 036) with names
-- that match the UI: response_persona + response_first_reply_* + response_update_*.
-- Old team_response/team_response_update columns are kept for back-compat so
-- existing legacy rows keep rendering via a fallback in the API mapper.
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS response_persona TEXT
    CHECK (response_persona IN ('ujuk','vsx')),
  ADD COLUMN IF NOT EXISTS response_first_reply_text TEXT,
  ADD COLUMN IF NOT EXISTS response_first_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS response_update_text TEXT,
  ADD COLUMN IF NOT EXISTS response_update_at TIMESTAMPTZ;

-- Deterministic backfill of response_persona on any existing reply.
-- abs(hashtext(id::text)) % 2 → 0 = ujuk, 1 = vsx.
UPDATE reviews
SET response_persona = CASE WHEN abs(hashtext(id::text)) % 2 = 0 THEN 'ujuk' ELSE 'vsx' END
WHERE response_persona IS NULL
  AND (team_response IS NOT NULL OR response_first_reply_text IS NOT NULL);
