-- What a Founder — Row Level Security policies
-- Run AFTER schema.sql

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.user_consents enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.dimension_scores enable row level security;
alter table public.founder_profiles enable row level security;
alter table public.referrals enable row level security;

-- ─── users ────────────────────────────────────────────────────────────────
create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

-- Insert handled by auth trigger (service role)

-- ─── user_consents ────────────────────────────────────────────────────────
create policy "Users can read own consents"
  on public.user_consents for select
  using (auth.uid() = user_id);

create policy "Users can insert own consents"
  on public.user_consents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own consents"
  on public.user_consents for update
  using (auth.uid() = user_id);

-- ─── questions ────────────────────────────────────────────────────────────
-- Questions are public (anyone authenticated can read)
create policy "Authenticated users can read questions"
  on public.questions for select
  using (auth.role() = 'authenticated');

-- ─── answers ──────────────────────────────────────────────────────────────
create policy "Users can read own answers"
  on public.answers for select
  using (auth.uid() = user_id);

create policy "Users can insert own answers"
  on public.answers for insert
  with check (auth.uid() = user_id);

-- ─── dimension_scores ─────────────────────────────────────────────────────
create policy "Users can read own dimension scores"
  on public.dimension_scores for select
  using (auth.uid() = user_id);

create policy "Users can upsert own dimension scores"
  on public.dimension_scores for insert
  with check (auth.uid() = user_id);

create policy "Users can update own dimension scores"
  on public.dimension_scores for update
  using (auth.uid() = user_id);

-- ─── founder_profiles ─────────────────────────────────────────────────────
-- Own profile: full access
create policy "Users can read own profile"
  on public.founder_profiles for select
  using (auth.uid() = user_id);

-- Public share: anyone can read by share_code (no auth required)
-- Note: Supabase anon key is used for the share page
create policy "Anyone can view profile by share_code"
  on public.founder_profiles for select
  using (true); -- filtered by share_code in query, protected by column selection

-- ─── referrals ────────────────────────────────────────────────────────────
create policy "Users can read own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_user_id);

create policy "Users can insert referrals"
  on public.referrals for insert
  with check (auth.uid() = referrer_user_id);
