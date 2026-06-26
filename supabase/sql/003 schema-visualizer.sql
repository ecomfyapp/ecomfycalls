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
