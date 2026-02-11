-- Schema for Sleep Sound Analysis
-- Run in Supabase SQL Editor

-- Users profile table (linked to auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  created_at timestamptz not null default now()
);

-- Sleep sessions table
create table if not exists public.sleep_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  audio_path text,
  audio_format text,
  created_at timestamptz not null default now()
);

-- Analysis results table
create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  sleep_session_id uuid not null references public.sleep_sessions(id) on delete cascade,
  sleep_quality_score int,
  disturbances jsonb,
  features jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.users enable row level security;
alter table public.sleep_sessions enable row level security;
alter table public.analysis_results enable row level security;

-- Policies
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create policy "Users manage their sessions"
  on public.sleep_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their analysis results"
  on public.analysis_results for all
  using (
    auth.uid() = (
      select user_id from public.sleep_sessions ss
      where ss.id = sleep_session_id
    )
  )
  with check (
    auth.uid() = (
      select user_id from public.sleep_sessions ss
      where ss.id = sleep_session_id
    )
  );
