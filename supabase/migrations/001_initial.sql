-- PixelDrop — Initial Schema Migration
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ─── Products table ───────────────────────────────────────────────────────────
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null,
  category text not null check (category in ('iphone', 'desktop', 'bundle', 'other')),
  preview_image_url text,
  additional_images text[] default '{}',
  file_path text not null,
  is_active boolean default true,
  tags text[] default '{}',
  stripe_price_id text,
  stripe_product_id text,
  created_at timestamptz default now()
);

-- ─── Orders table ─────────────────────────────────────────────────────────────
create table orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_payment_intent_id text,
  customer_email text not null,
  amount_total integer not null,
  currency text default 'usd',
  status text default 'pending' check (status in ('pending','paid','delivered','refunded','failed')),
  products jsonb not null default '[]',
  email_sent_at timestamptz,
  created_at timestamptz default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index orders_email_idx on orders(customer_email);
create index orders_status_idx on orders(status);
create index orders_created_idx on orders(created_at desc);
create index products_active_idx on products(is_active, category);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table products enable row level security;
alter table orders enable row level security;

-- Public can read active products (for the storefront)
create policy "Public can read active products"
  on products for select
  using (is_active = true);

-- Service role has full access to products (admin operations)
create policy "Service role full access products"
  on products
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Service role has full access to orders (webhook + admin operations)
create policy "Service role full access orders"
  on orders
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
