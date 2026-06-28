-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'agent'::text,
  status text NOT NULL DEFAULT 'pending'::text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  buyer_id numeric,
  balance numeric NOT NULL DEFAULT 0.00,
  ppc_status boolean NOT NULL DEFAULT false,
  lead_status boolean NOT NULL DEFAULT false,
  sip_password text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'::text),
  release_channel text NOT NULL DEFAULT 'production'::text CHECK (release_channel = ANY (ARRAY['internal'::text, 'beta'::text, 'production'::text])),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.pending_profiles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  full_name text,
  email text NOT NULL,
  buyer_id numeric NOT NULL,
  account_status text,
  CONSTRAINT pending_profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  expiration_time bigint,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_seen_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
