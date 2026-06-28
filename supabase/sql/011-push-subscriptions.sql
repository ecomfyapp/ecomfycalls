-- Store one Web Push subscription per authenticated user device.
-- Run this migration in the Supabase SQL Editor.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  expiration_time bigint,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx
on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can read their own push subscriptions"
on public.push_subscriptions;
drop policy if exists "Users can insert their own push subscriptions"
on public.push_subscriptions;
drop policy if exists "Users can update their own push subscriptions"
on public.push_subscriptions;
drop policy if exists "Users can delete their own push subscriptions"
on public.push_subscriptions;

create policy "Users can read their own push subscriptions"
on public.push_subscriptions
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own push subscriptions"
on public.push_subscriptions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own push subscriptions"
on public.push_subscriptions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own push subscriptions"
on public.push_subscriptions
for delete
to authenticated
using (user_id = auth.uid());

create or replace function public.set_push_subscription_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_push_subscriptions_updated_at
on public.push_subscriptions;

create trigger set_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row
execute function public.set_push_subscription_updated_at();
