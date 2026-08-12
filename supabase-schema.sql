-- Campus One production schema for Supabase
-- Run this in Supabase SQL Editor, then set config.js with your project URL and anon key.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'cr');
create type public.note_purchase_type as enum ('file', 'ai');

create table public.rooms (
  code text primary key,
  college text not null,
  batch text,
  cr_locked boolean not null default false,
  cr_pin_hash text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'student',
  college text not null,
  batch text,
  room_code text references public.rooms(code) on delete set null,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text,
  message text not null,
  category text not null default 'Academic',
  priority text not null default 'Normal',
  author_id uuid not null references public.profiles(id) on delete cascade,
  room_code text references public.rooms(code) on delete cascade,
  recipients text[] not null default array['All'],
  pinned boolean not null default false,
  requires_response boolean not null default true,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.announcement_reads (
  announcement_id uuid references public.announcements(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create table public.announcement_responses (
  announcement_id uuid references public.announcements(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  response text not null check (response in ('attending', 'maybe', 'declined')),
  updated_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  college text not null,
  room_code text references public.rooms(code) on delete cascade,
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  price integer not null check (price >= 10 and price <= 199),
  max_price integer not null default 199,
  rating numeric not null default 4.5,
  file_path text,
  file_name text,
  ai_summary_points jsonb not null default '[]',
  ai_study_plan jsonb not null default '[]',
  ai_key_dates jsonb not null default '[]',
  ai_topics jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.note_purchases (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  purchase_type public.note_purchase_type not null,
  gross_amount integer not null,
  uploader_earned integer not null default 0,
  platform_earned integer not null default 0,
  payment_id text,
  paid_at timestamptz not null default now(),
  unique (note_id, buyer_id, purchase_type)
);

create table public.cr_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  college text not null,
  batch text,
  room_code text references public.rooms(code) on delete cascade,
  file_path text,
  file_name text,
  pinned boolean not null default false,
  author_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;
alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;
alter table public.announcement_responses enable row level security;
alter table public.notes enable row level security;
alter table public.note_purchases enable row level security;
alter table public.cr_posts enable row level security;

create policy "Rooms are visible to authenticated users"
on public.rooms for select to authenticated using (true);

create policy "Authenticated users can create rooms"
on public.rooms for insert to authenticated with check ((select auth.uid()) = created_by);

create policy "Room creator can update room lock"
on public.rooms for update to authenticated using ((select auth.uid()) = created_by);

create policy "Profiles are visible to authenticated users"
on public.profiles for select to authenticated using (true);

create policy "Users can update their own profile"
on public.profiles for update to authenticated using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
on public.profiles for insert to authenticated with check ((select auth.uid()) = id);

create policy "Authenticated users can view announcements"
on public.announcements for select to authenticated using (
  room_code is null
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.room_code = announcements.room_code)
);

create policy "Only CRs can create announcements"
on public.announcements for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'cr'));

create policy "Users can manage their reads"
on public.announcement_reads for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their responses"
on public.announcement_responses for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Notes marketplace visible to authenticated users"
on public.notes for select to authenticated using (
  room_code is null
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.room_code = notes.room_code)
);

create policy "Students and CRs can upload their own notes"
on public.notes for insert to authenticated
with check ((select auth.uid()) = uploader_id);

create policy "Purchases visible to buyer or uploader"
on public.note_purchases for select to authenticated
using (
  (select auth.uid()) = buyer_id
  or exists (select 1 from public.notes n where n.id = note_id and n.uploader_id = (select auth.uid()))
);

create policy "Buyers can insert purchases"
on public.note_purchases for insert to authenticated
with check ((select auth.uid()) = buyer_id);

create policy "CR board visible to authenticated users"
on public.cr_posts for select to authenticated using (
  room_code is null
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.room_code = cr_posts.room_code)
);

create policy "Only CRs can post CR board notices"
on public.cr_posts for insert to authenticated
with check (
  (select auth.uid()) = author_id
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'cr')
);

insert into storage.buckets (id, name, public)
values ('notes', 'notes', false), ('cr-posts', 'cr-posts', false)
on conflict (id) do nothing;
