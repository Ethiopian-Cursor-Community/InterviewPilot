-- Bootstrap InterviewPilot schema (clean install).
-- Run in Supabase Dashboard → SQL Editor.
-- Drops old/conflicting app tables first (e.g. default profiles with only `id`, no `user_id`).

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists profiles_touch on public.profiles;

drop table if exists public.coach_messages cascade;
drop table if exists public.reports cascade;
drop table if exists public.interview_messages cascade;
drop table if exists public.interviews cascade;
drop table if exists public.resumes cascade;
drop table if exists public.profiles cascade;

-- Profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  experience_level text default 'mid',
  target_role text,
  skills text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);

-- Resumes
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text,
  file_name text,
  raw_text text,
  extracted_skills text[] default '{}',
  weaknesses text[] default '{}',
  summary text,
  created_at timestamptz not null default now()
);
alter table public.resumes enable row level security;

create policy "resumes_all_own" on public.resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Interviews
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,
  role text,
  difficulty text default 'medium',
  interviewer_persona text default 'friendly',
  status text default 'pending',
  questions jsonb default '[]'::jsonb,
  resume_id uuid references public.resumes(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds int,
  created_at timestamptz not null default now()
);
alter table public.interviews enable row level security;

create policy "interviews_all_own" on public.interviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Interview messages
create table public.interview_messages (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.interview_messages enable row level security;

create policy "messages_all_own" on public.interview_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index idx_messages_interview on public.interview_messages(interview_id, created_at);

-- Reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null unique references public.interviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  overall_score int,
  communication_score int,
  technical_score int,
  confidence_score int,
  clarity_score int,
  strengths text[] default '{}',
  weaknesses text[] default '{}',
  missed_opportunities text[] default '{}',
  ideal_answers jsonb default '[]'::jsonb,
  improvement_roadmap text[] default '{}',
  recommendations jsonb default '[]'::jsonb,
  summary text,
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;

create policy "reports_all_own" on public.reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Coach messages (optional; app may use localStorage)
create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.coach_messages enable row level security;

create policy "coach_messages_all_own" on public.coach_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index idx_coach_messages_user_created on public.coach_messages(user_id, created_at);

-- Triggers / functions
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- Backfill profiles for existing auth users
insert into public.profiles (user_id, display_name, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
on conflict (user_id) do nothing;

-- Storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 5242880, array['application/pdf']::text[])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "resumes_storage_select" on storage.objects;
drop policy if exists "resumes_storage_insert" on storage.objects;
drop policy if exists "resumes_storage_update" on storage.objects;
drop policy if exists "resumes_storage_delete" on storage.objects;

create policy "resumes_storage_select" on storage.objects
  for select using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "resumes_storage_insert" on storage.objects
  for insert with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "resumes_storage_update" on storage.objects
  for update using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "resumes_storage_delete" on storage.objects
  for delete using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

notify pgrst, 'reload schema';
