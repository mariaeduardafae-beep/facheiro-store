create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type product_status as enum ('active', 'draft', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pendente', 'pago', 'enviado', 'entregue', 'cancelado');
  end if;
end
$$;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order integer not null default 99,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  slug text not null unique,
  category_id uuid not null references categories(id) on delete restrict,
  description text not null,
  price_cents integer not null check (price_cents > 0),
  stock integer not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  featured boolean not null default false,
  best_seller boolean not null default false,
  status product_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  status order_status not null default 'pendente',
  customer_email text,
  customer_name text,
  shipping_address jsonb,
  shipping_quote jsonb,
  tracking_code text,
  label_url text,
  payment_provider text not null default 'mercado_pago',
  payment_reference text,
  total_cents integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  sku text not null,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents > 0)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products for each row execute function set_updated_at();

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at before update on orders for each row execute function set_updated_at();

alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "Public active categories" on categories;
drop policy if exists "Public active products" on products;
create policy "Public active categories" on categories for select using (true);
create policy "Public active products" on products for select using (status = 'active');

create or replace function mark_order_paid_and_decrement_stock(target_order_id uuid)
returns void as $$
declare
  item record;
begin
  if exists (select 1 from orders where id = target_order_id and status = 'pago') then
    return;
  end if;

  for item in select * from order_items where order_id = target_order_id loop
    update products
    set stock = stock - item.quantity
    where id = item.product_id and stock >= item.quantity;

    if not found then
      raise exception 'Insufficient stock for product %', item.product_id;
    end if;
  end loop;

  update orders
  set status = 'pago'
  where id = target_order_id;
end;
$$ language plpgsql security definer;

insert into categories (name, slug, sort_order)
values
  ('Colares', 'colares', 1),
  ('Pulseiras', 'pulseiras', 2),
  ('Brincos', 'brincos', 3),
  ('Acessórios', 'acessorios', 4)
on conflict (slug) do nothing;
