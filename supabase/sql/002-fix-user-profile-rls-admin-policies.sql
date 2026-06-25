-- Fix recursive RLS policies on public.user_profiles.
-- Run this in Supabase SQL Editor.
--
-- Why:
-- Policies that query public.user_profiles from inside policies on the same
-- table can trigger: "infinite recursion detected in policy".
-- This file replaces those policies with a SECURITY DEFINER helper.

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

grant execute on function public.is_active_admin() to authenticated;

drop policy if exists "Users can read their own profile" on public.user_profiles;
drop policy if exists "Users can insert their own pending profile" on public.user_profiles;
drop policy if exists "Admins can read all profiles" on public.user_profiles;
drop policy if exists "Admins can update profiles" on public.user_profiles;
drop policy if exists "Admins can insert profiles" on public.user_profiles;
drop policy if exists "Admins can delete profiles" on public.user_profiles;

create policy "Users can read their own profile"
on public.user_profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.is_active_admin()
);

create policy "Users can insert their own pending profile"
on public.user_profiles
for insert
to authenticated
with check (
  (
    auth.uid() = id
    and role = 'agent'
    and status = 'pending'
  )
  or public.is_active_admin()
);

create policy "Admins can update profiles"
on public.user_profiles
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create policy "Admins can delete profiles"
on public.user_profiles
for delete
to authenticated
using (public.is_active_admin());

