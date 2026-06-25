-- Admin RLS and email matching automation for public.pending_profiles.
-- Run this in Supabase SQL Editor after 002.
--
-- Rule:
-- pending_profiles stores external profiles, for example detected in Phonexa
-- before the person creates a Supabase Auth user.
-- When a Supabase Auth user exists with the same email, the pending profile
-- should be removed from pending_profiles.

alter table public.pending_profiles enable row level security;

drop policy if exists "Admins can read pending profiles" on public.pending_profiles;
drop policy if exists "Admins can insert pending profiles" on public.pending_profiles;
drop policy if exists "Admins can update pending profiles" on public.pending_profiles;
drop policy if exists "Admins can delete pending profiles" on public.pending_profiles;

create policy "Admins can read pending profiles"
on public.pending_profiles
for select
to authenticated
using (public.is_active_admin());

create policy "Admins can insert pending profiles"
on public.pending_profiles
for insert
to authenticated
with check (public.is_active_admin());

create policy "Admins can update pending profiles"
on public.pending_profiles
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create policy "Admins can delete pending profiles"
on public.pending_profiles
for delete
to authenticated
using (public.is_active_admin());

create index if not exists pending_profiles_lower_email_idx
on public.pending_profiles (lower(email));

create or replace function public.delete_pending_profile_by_email(user_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if user_email is null then
    return;
  end if;

  delete from public.pending_profiles
  where lower(email) = lower(user_email);
end;
$$;

create or replace function public.delete_pending_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.delete_pending_profile_by_email(new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_delete_pending_profile on auth.users;

create trigger on_auth_user_created_delete_pending_profile
after insert on auth.users
for each row
execute function public.delete_pending_profile_for_new_auth_user();

create or replace function public.skip_pending_profile_if_auth_user_exists()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from auth.users
    where lower(email) = lower(new.email)
  ) then
    return null;
  end if;

  return new;
end;
$$;

drop trigger if exists before_pending_profile_insert_skip_existing_auth_user
on public.pending_profiles;

create trigger before_pending_profile_insert_skip_existing_auth_user
before insert on public.pending_profiles
for each row
execute function public.skip_pending_profile_if_auth_user_exists();

drop trigger if exists before_pending_profile_update_skip_existing_auth_user
on public.pending_profiles;

create trigger before_pending_profile_update_skip_existing_auth_user
before update of email on public.pending_profiles
for each row
execute function public.skip_pending_profile_if_auth_user_exists();

