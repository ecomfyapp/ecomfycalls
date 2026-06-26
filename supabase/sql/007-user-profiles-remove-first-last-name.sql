-- Remove split name columns from user profiles.
-- The app uses public.user_profiles.full_name as the only profile name field.

alter table public.user_profiles
drop column if exists first_name,
drop column if exists last_name;
