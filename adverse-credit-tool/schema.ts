{/*-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  adviser_id uuid,
  name text NOT NULL,
  email text,
  phone text,
  adverse_credit jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_adviser_id_fkey FOREIGN KEY (adviser_id) REFERENCES auth.users(id),
  CONSTRAINT clients_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.lenders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  name text NOT NULL,
  criteria jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT lenders_pkey PRIMARY KEY (id),
  CONSTRAINT lenders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT lenders_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.organization_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  user_id uuid,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'adviser'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.pending_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  email text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role = 'adviser'::text),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
  CONSTRAINT pending_invites_pkey PRIMARY KEY (id),
  CONSTRAINT pending_invites_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);*/}