-- Add a release channel for controlled UI rollouts.
-- Execute this migration in the Supabase SQL Editor.

alter table public.user_profiles
add column release_channel text not null default 'production'
check (release_channel in ('internal', 'beta', 'production'));

create index user_profiles_release_channel_idx
on public.user_profiles(release_channel);

comment on column public.user_profiles.release_channel is
  'Controls whether the user receives internal, beta, or production UI.';
