CREATE TABLE IF NOT EXISTS staff_applications (
  id SERIAL PRIMARY KEY,
  discord TEXT NOT NULL,
  age INT NOT NULL,
  timezone TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  languages TEXT DEFAULT '',
  hours_per_week TEXT DEFAULT '',
  position TEXT NOT NULL,
  why_hire TEXT NOT NULL,
  how_found TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public can insert, only admin can read/update
ALTER TABLE staff_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_apps_insert" ON staff_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "staff_apps_admin_all" ON staff_applications FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);
