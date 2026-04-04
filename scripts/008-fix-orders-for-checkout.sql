-- Make user_id nullable for guest checkout
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Allow anyone (including anonymous/guest) to insert orders
DROP POLICY IF EXISTS orders_insert ON orders;
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (true);

-- Allow anyone to insert order items (linked to an order they just created)
DROP POLICY IF EXISTS order_items_insert ON order_items;
CREATE POLICY order_items_insert ON order_items FOR INSERT WITH CHECK (true);

-- Keep existing admin + own-select policies
