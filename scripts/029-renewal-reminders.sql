-- Renewal reminders — opt-in "auto-renew lite". Not real recurring billing;
-- scheduled job nudges the user 3 days before their license expires.
CREATE TABLE IF NOT EXISTS renewal_reminders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_email      text NOT NULL,
  discord_username text,
  product_id      text NOT NULL,
  variant_id      text NOT NULL,
  variant_name    text,
  duration_days   int,
  reminder_at     timestamptz NOT NULL,
  sent_at         timestamptz,
  cancelled_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_renewal_reminders_pending
  ON renewal_reminders (reminder_at)
  WHERE sent_at IS NULL AND cancelled_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_renewal_reminders_email
  ON renewal_reminders (user_email);

ALTER TABLE renewal_reminders ENABLE ROW LEVEL SECURITY;

-- Service role writes; users can read their own reminders only.
DROP POLICY IF EXISTS "read_own_reminders" ON renewal_reminders;
CREATE POLICY "read_own_reminders" ON renewal_reminders
  FOR SELECT
  USING (user_email = auth.jwt() ->> 'email');

-- User may cancel their own reminder
DROP POLICY IF EXISTS "cancel_own_reminder" ON renewal_reminders;
CREATE POLICY "cancel_own_reminder" ON renewal_reminders
  FOR UPDATE
  USING (user_email = auth.jwt() ->> 'email')
  WITH CHECK (user_email = auth.jwt() ->> 'email');
