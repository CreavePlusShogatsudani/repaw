-- Add is_admin column to profiles
alter table profiles add column if not exists is_admin boolean default false;

-- RLS Policies for Admin

-- Products: Admins can insert, update, delete
create policy "Admins can insert products" on products for insert with check (
  exists ( select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true )
);

create policy "Admins can update products" on products for update using (
  exists ( select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true )
);

create policy "Admins can delete products" on products for delete using (
  exists ( select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true )
);

-- Orders: Admins can view all orders
create policy "Admins can view all orders" on orders for select using (
  exists ( select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true )
);

create policy "Admins can update all orders" on orders for update using (
  exists ( select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true )
);

-- Order Items: Admins can view all order items
create policy "Admins can view all order items" on order_items for select using (
  exists ( select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true )
);

-- Profiles: Admins can view all profiles (optional, for user management)
create policy "Admins can view all profiles" on profiles for select using (
  exists ( select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true )
);
