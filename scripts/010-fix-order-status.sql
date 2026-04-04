-- Drop the old check constraint and add one that includes 'confirmed'
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled'));
