-- Add lead availability toggle for agent profiles.
-- Run this in Supabase SQL Editor if the column does not exist yet.

alter table public.user_profiles
add column if not exists lead_status boolean not null default false;

comment on column public.user_profiles.lead_status is
  'Agent-controlled lead availability toggle. Calls availability is stored in ppc_status.';
