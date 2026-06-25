-- Pending profiles schema update.
-- Run this only if your database has not already been changed manually.
--
-- Change:
-- - pending_profiles.first_name becomes pending_profiles.full_name
-- - pending_profiles.last_name is removed

alter table public.pending_profiles
rename column first_name to full_name;

alter table public.pending_profiles
drop column if exists last_name;

