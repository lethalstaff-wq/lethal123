-- Adds fields for two-stage team responses + photo flag + team member attribution.
-- Needed so refund reviews render as "initial message → UPDATE (1-2 days later)"
-- which is how it actually happens on Discord support.
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS team_response_update TEXT,
  ADD COLUMN IF NOT EXISTS team_response_by TEXT CHECK (team_response_by IN ('ujuk','vsx','team')),
  ADD COLUMN IF NOT EXISTS team_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS team_response_update_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS needs_photo BOOLEAN DEFAULT false;
