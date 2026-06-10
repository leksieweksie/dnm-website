create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  type            text not null check (type in ('product','donation')),
  status          text not null check (status in ('pending','paid','failed')) default 'pending',
  opn_charge_id   text unique not null,
  customer_name   text not null,
  customer_email  text not null,
  amount_thb      integer not null,
  items           jsonb,
  notes           text
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- Index for fast webhook lookups
create index if not exists orders_charge_id_idx on orders(opn_charge_id);
create index if not exists orders_email_idx     on orders(customer_email);
