-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  address text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price integer not null,
  original_price integer,
  category text,
  size text,
  color text,
  condition text,
  images text[], -- Array of image URLs
  stock integer default 1,
  status text default 'published', -- published, hidden, sold_out
  seller_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  status text default 'pending', -- pending, paid, shipped, completed, cancelled
  total_amount integer not null,
  shipping_address jsonb, -- Store address snapshot
  stripe_payment_intent_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  quantity integer not null default 1,
  price_at_purchase integer not null, -- Store price at time of purchase
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Profiles: Users can view and edit their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Products: Everyone can view products, only admins (or specific roles) can insert/update
create policy "Public can view products" on products for select using (true);

-- Orders: Users can view their own orders
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);

-- Order Items: Users can view their own order items
create policy "Users can view own order items" on order_items for select using (
  exists ( select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);
