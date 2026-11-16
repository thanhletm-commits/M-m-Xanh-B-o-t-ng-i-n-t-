-- Supabase PostgreSQL schema & Storage setup for Báo tường điện tử Mầm Xanh (Lớp 1/8)
-- Run this complete script once in the Supabase SQL Editor before deploying to Netlify.

create extension if not exists "pgcrypto";

create table if not exists public.students (
  id text primary key,
  order_number integer not null,
  name text not null,
  nickname text,
  avatar_url text,
  sprout_variant text not null,
  short_intro text not null default '',
  is_demo boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists students_order_number_key
  on public.students (order_number);

create or replace function public.assign_student_order_number()
returns trigger
language plpgsql
set search_path = ''
as $
begin
  perform pg_catalog.pg_advisory_xact_lock(618, 1);

  if tg_op = 'INSERT' and new.order_number is null then
    select coalesce(max(order_number), 0) + 1
      into new.order_number
      from public.students;
  end if;

  return new;
end;
$;

create or replace trigger assign_student_order_number
before insert or update of order_number on public.students
for each row execute function public.assign_student_order_number();

create table if not exists public.products (
  id text primary key,
  student_id text not null references public.students(id) on delete cascade,
  type text not null check (type in ('thiep','tranh','loi_chuc','video','anh_san_pham','bai_viet')),
  title text not null,
  description text not null default '',
  media_url text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id text primary key,
  order_number integer not null,
  name text not null,
  role text not null,
  subject_key text not null,
  avatar_url text,
  audio_url text,
  letter_title text not null,
  letter_content text not null,
  accent_color text not null default '#65B741'
);

alter table public.teachers add column if not exists audio_url text;

create table if not exists public.messages (
  id text primary key,
  teacher_id text references public.teachers(id) on delete set null,
  student_id text references public.students(id) on delete set null,
  student_name text not null,
  teacher_name text not null,
  content text not null check (char_length(content) between 5 and 600),
  card_image_url text,
  audio_url text,
  status text not null default 'pending' check (status in ('pending','approved','hidden')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id text primary key,
  category text not null,
  caption text not null,
  image_url text,
  order_index integer not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id text primary key default 'global',
  intro_title text not null,
  intro_content text not null,
  intro_signature text not null,
  outro_quote text not null,
  outro_closing text not null,
  music_title text not null,
  music_url text,
  cover_image_url text,
  falling_petals_enabled boolean not null default true,
  dialogues jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.students enable row level security;
alter table public.products enable row level security;
alter table public.teachers enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.settings enable row level security;

-- Public read access for public content; messages only readable when approved
drop policy if exists "Public read students" on public.students;
create policy "Public read students" on public.students for select using (true);

drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products for select using (true);

drop policy if exists "Public read teachers" on public.teachers;
create policy "Public read teachers" on public.teachers for select using (true);

drop policy if exists "Public read memories" on public.memories;
create policy "Public read memories" on public.memories for select using (true);

drop policy if exists "Public read settings" on public.settings;
create policy "Public read settings" on public.settings for select using (true);

drop policy if exists "Public read approved messages" on public.messages;
create policy "Public read approved messages" on public.messages for select using (status = 'approved');

-- Public insert messages MUST enforce pending status (cannot self-approve or modify)
drop policy if exists "Public submit pending wish" on public.messages;
create policy "Public submit pending wish" on public.messages
  for insert with check (status = 'pending');

-- Authenticated teacher admin full access
drop policy if exists "Admin manage students" on public.students;
create policy "Admin manage students" on public.students for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin manage products" on public.products;
create policy "Admin manage products" on public.products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin manage teachers" on public.teachers;
create policy "Admin manage teachers" on public.teachers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin manage messages" on public.messages;
create policy "Admin manage messages" on public.messages for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin manage memories" on public.memories;
create policy "Admin manage memories" on public.memories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin manage settings" on public.settings;
create policy "Admin manage settings" on public.settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket for student avatars, products, memory photos, wish cards & MP3 music
insert into storage.buckets (id, name, public)
values ('mam-xanh-media', 'mam-xanh-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read mam-xanh-media" on storage.objects;
create policy "Public read mam-xanh-media" on storage.objects
  for select using (bucket_id = 'mam-xanh-media');

drop policy if exists "Public upload wish media" on storage.objects;
create policy "Public upload wish media" on storage.objects
  for insert with check (
    bucket_id = 'mam-xanh-media'
    and (storage.foldername(name))[1] = 'wishes'
  );

drop policy if exists "Admin full media access" on storage.objects;
create policy "Admin full media access" on storage.objects
  for all using (bucket_id = 'mam-xanh-media' and auth.role() = 'authenticated')
  with check (bucket_id = 'mam-xanh-media' and auth.role() = 'authenticated');
