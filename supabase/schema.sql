create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  original_price numeric(10,2),
  deal_price numeric(10,2) not null,
  affiliate_url text not null,
  is_featured boolean default false,
  spec_note text,
  rating text,
  created_at timestamptz default now()
);

create table if not exists clicks (
  id bigint generated always as identity primary key,
  product_id uuid references products(id) on delete cascade,
  referer text,
  created_at timestamptz default now()
);

create index if not exists idx_clicks_product on clicks(product_id);

-- Enable Row Level Security (RLS)
alter table products enable row level security;
alter table clicks enable row level security;

-- Safely recreate policies (idempotent)
drop policy if exists "Allow public read products" on products;
create policy "Allow public read products"
  on products for select
  to anon
  using (true);

drop policy if exists "Allow public insert clicks" on clicks;
create policy "Allow public insert clicks"
  on clicks for insert
  to anon
  with check (true);
