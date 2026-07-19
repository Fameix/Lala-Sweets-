create extension if not exists "pgcrypto";

create type public.app_role as enum ('owner', 'admin', 'manager', 'order_staff', 'catalogue_staff');
create type public.fulfilment_type as enum ('delivery', 'pickup');
create type public.order_status as enum ('draft', 'payment_pending', 'payment_failed', 'placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'refund_pending', 'refunded');
create type public.payment_status as enum ('pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded', 'cod_pending', 'cod_collected');
create type public.custom_cake_status as enum ('submitted', 'under_review', 'more_information_required', 'quote_sent', 'quote_accepted', 'quote_rejected', 'payment_pending', 'confirmed', 'in_production', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  mobile text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  mobile text not null,
  address_line text not null,
  landmark text,
  area text not null,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text,
  phone text,
  verification_status text not null default 'needs-review',
  pickup_enabled boolean not null default false,
  delivery_enabled boolean not null default false,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.branch_hours (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  unique (branch_id, weekday)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_public boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  source_name text,
  display_name text not null,
  slug text not null unique,
  short_description text,
  long_description text,
  food_type text not null default 'unknown',
  egg_status text not null default 'unknown',
  allergen_information text[] not null default '{}',
  price_paise integer check (price_paise is null or price_paise > 0),
  compare_at_price_paise integer check (compare_at_price_paise is null or compare_at_price_paise > 0),
  price_status text not null default 'awaiting-client-price',
  availability_status text not null default 'unconfirmed',
  verification_status text not null default 'needs-review',
  image_status text not null default 'missing',
  preparation_minutes integer check (preparation_minutes is null or preparation_minutes >= 0),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  is_orderable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  image_status text not null default 'missing',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_delta_paise integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.option_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_required boolean not null default false,
  min_select integer not null default 0,
  max_select integer not null default 1
);

create table public.option_values (
  id uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references public.option_groups(id) on delete cascade,
  name text not null,
  price_delta_paise integer not null default 0,
  is_active boolean not null default true
);

create table public.product_option_groups (
  product_id uuid not null references public.products(id) on delete cascade,
  option_group_id uuid not null references public.option_groups(id) on delete cascade,
  primary key (product_id, option_group_id)
);

create table public.product_addons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_paise integer not null check (price_paise > 0),
  is_active boolean not null default true
);

create table public.branch_product_availability (
  branch_id uuid not null references public.branches(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  is_available boolean not null default false,
  stock_tracking_enabled boolean not null default false,
  primary key (branch_id, product_id)
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 0,
  low_stock_threshold integer not null default 0,
  unique (branch_id, product_id)
);

create table public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  delta integer not null,
  reason text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  guest_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  quantity integer not null check (quantity > 0),
  options jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.favourites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  pincode text not null,
  area text not null,
  delivery_fee_paise integer not null default 0 check (delivery_fee_paise >= 0),
  minimum_order_paise integer not null default 0 check (minimum_order_paise >= 0),
  cod_enabled boolean not null default false,
  is_active boolean not null default false
);

create table public.delivery_slots (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  fulfilment public.fulfilment_type not null,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  capacity integer not null check (capacity > 0),
  cutoff_minutes integer not null default 0
);

create table public.delivery_blackout_dates (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete cascade,
  blackout_date date not null,
  reason text,
  unique (branch_id, blackout_date)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null,
  discount_value integer not null check (discount_value > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer,
  is_active boolean not null default false
);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id),
  user_id uuid references public.profiles(id),
  order_id uuid,
  redeemed_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles(id),
  guest_email text,
  guest_mobile text,
  fulfilment public.fulfilment_type not null,
  status public.order_status not null default 'draft',
  subtotal_paise integer not null check (subtotal_paise >= 0),
  discount_paise integer not null default 0 check (discount_paise >= 0),
  tax_paise integer not null default 0 check (tax_paise >= 0),
  delivery_fee_paise integer not null default 0 check (delivery_fee_paise >= 0),
  total_paise integer not null check (total_paise >= 0),
  tracking_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupon_redemptions add constraint coupon_redemptions_order_id_fkey foreign key (order_id) references public.orders(id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_snapshot jsonb not null,
  quantity integer not null check (quantity > 0),
  unit_price_paise integer not null check (unit_price_paise >= 0),
  total_paise integer not null check (total_paise >= 0)
);

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_order_id text,
  provider_payment_id text,
  status public.payment_status not null default 'pending',
  amount_paise integer not null check (amount_paise >= 0),
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  amount_paise integer not null check (amount_paise > 0),
  reason text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.custom_cake_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  name text not null,
  mobile text not null,
  email text,
  occasion text,
  required_date date not null,
  preferred_time time,
  details jsonb not null default '{}',
  status public.custom_cake_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.custom_cake_images (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_cake_requests(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table public.custom_cake_quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_cake_requests(id) on delete cascade,
  price_paise integer not null check (price_paise > 0),
  advance_paise integer not null default 0 check (advance_paise >= 0),
  description text not null,
  valid_until timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.custom_cake_quote_revisions (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.custom_cake_quotes(id) on delete cascade,
  revision jsonb not null,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  user_id uuid references public.profiles(id),
  rating integer check (rating between 1 and 5),
  body text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false
);

create table public.occasions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default false
);

create table public.product_occasions (
  product_id uuid not null references public.products(id) on delete cascade,
  occasion_id uuid not null references public.occasions(id) on delete cascade,
  primary key (product_id, occasion_id)
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  recipient text not null,
  payload jsonb not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index products_category_id_idx on public.products(category_id);
create index products_slug_idx on public.products(slug);
create index orders_user_id_idx on public.orders(user_id);
create index orders_order_number_idx on public.orders(order_number);
create index payments_order_id_idx on public.payments(order_id);
create index custom_cake_requests_user_id_idx on public.custom_cake_requests(user_id);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.favourites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.custom_cake_requests enable row level security;
alter table public.custom_cake_images enable row level security;
alter table public.custom_cake_quotes enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "addresses_own" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "favourites_own" on public.favourites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "orders_own" on public.orders for select using (auth.uid() = user_id);
create policy "custom_cake_requests_own" on public.custom_cake_requests for select using (auth.uid() = user_id);
