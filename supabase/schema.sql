-- What a Founder — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Question type enum ──────────────────────────────────────────────────────
create type question_type as enum ('likert', 'forced_choice', 'reflection');

-- ─── Users ──────────────────────────────────────────────────────────────────
create table public.users (
  id                        uuid primary key references auth.users(id) on delete cascade,
  email                     text not null unique,
  current_day               smallint not null default 0,
  last_session_date         date,
  streak                    smallint not null default 0,
  onboarding_completed      boolean not null default false,
  has_purchased             boolean not null default false,
  push_subscription         jsonb,
  referral_code             text unique,
  discount_token            text unique,
  discount_token_expires_at timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ─── User consents ───────────────────────────────────────────────────────────
create table public.user_consents (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.users(id) on delete cascade,
  data_storage   boolean not null,
  ai_processing  boolean not null default false,
  ip_address     inet,
  created_at     timestamptz not null default now()
);

-- ─── Questions ───────────────────────────────────────────────────────────────
create table public.questions (
  id             text primary key, -- e.g. 'q1_clarity_likert'
  day            smallint not null check (day between 1 and 3),
  order_index    smallint not null,
  type           question_type not null,
  dimension      text not null,
  text           text not null,
  context_text   text,
  option_a       text,
  option_b       text,
  scale_min      smallint,
  scale_max      smallint,
  reverse_scored boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (day, order_index)
);

-- ─── Answers ─────────────────────────────────────────────────────────────────
create table public.answers (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  question_id   text not null references public.questions(id),
  day           smallint not null,
  raw_value     text not null,    -- exactly what the user submitted
  scored_value  real,             -- 0.0 – 1.0 normalised
  created_at    timestamptz not null default now(),
  unique (user_id, question_id)   -- one answer per question per user
);

-- ─── Dimension scores ─────────────────────────────────────────────────────────
create table public.dimension_scores (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  dimension  text not null,
  score      real not null,       -- 0 – 100
  updated_at timestamptz not null default now(),
  unique (user_id, dimension)
);

-- ─── Founder profiles ─────────────────────────────────────────────────────────
create table public.founder_profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade unique,
  archetype_key     text not null,
  dimension_scores  jsonb not null,
  reflection_quotes jsonb not null default '[]'::jsonb,
  extended_report   jsonb,
  share_code        text not null unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── Referrals ───────────────────────────────────────────────────────────────
create table public.referrals (
  id                uuid primary key default uuid_generate_v4(),
  referrer_user_id  uuid not null references public.users(id) on delete cascade,
  referred_user_id  uuid references public.users(id) on delete set null,
  referral_code     text not null,
  clicked_at        timestamptz not null default now(),
  converted_at      timestamptz,
  created_at        timestamptz not null default now()
);

-- ─── updated_at trigger ──────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger founder_profiles_updated_at
  before update on public.founder_profiles
  for each row execute function public.handle_updated_at();
