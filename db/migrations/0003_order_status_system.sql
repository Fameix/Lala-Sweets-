alter table public.orders
  add column if not exists customer_name text,
  add column if not exists customer_mobile text,
  add column if not exists customer_email text,
  add column if not exists customer_address text,
  add column if not exists customer_pincode text,
  add column if not exists delivery_type text not null default 'LOCAL',
  add column if not exists payment_status text not null default 'PENDING',
  add column if not exists order_status text not null default 'ORDER_CONFIRMED',
  add column if not exists payment_method text not null default 'COD',
  add column if not exists payment_provider text not null default 'COD',
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_signature text;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();
