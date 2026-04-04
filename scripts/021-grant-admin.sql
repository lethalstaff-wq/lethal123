-- Grant admin to a specific email
-- Replace 'your-email@example.com' with your actual email

UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';

-- Or grant admin to the first user in the system:
-- UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM profiles LIMIT 1);
