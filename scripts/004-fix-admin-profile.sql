INSERT INTO profiles (id, email, is_admin)
VALUES ('f08cccea-76fb-4079-b576-e6c1dba56ef3', 'lethalstaff@gmail.com', true)
ON CONFLICT (id) DO UPDATE SET is_admin = true, email = 'lethalstaff@gmail.com';
