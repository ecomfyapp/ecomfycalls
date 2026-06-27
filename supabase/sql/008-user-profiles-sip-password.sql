-- Add an individual SIP password to every authenticated user profile.
-- Already executed in Supabase on 2026-06-26.

create extension if not exists pgcrypto;

alter table public.user_profiles
add column if not exists sip_password text not null
default encode(gen_random_bytes(16), 'hex');

update public.user_profiles
set sip_password = encode(gen_random_bytes(16), 'hex')
where sip_password is null or sip_password = '';

comment on column public.user_profiles.sip_password is
  'Agent-specific PJSIP password. Returned only through the authenticated softphone config API.';
