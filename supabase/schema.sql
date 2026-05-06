create extension if not exists pgcrypto;

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  year int,
  image_path text not null,
  image_width int,
  image_height int,
  featured boolean default false,
  published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists public.commission_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text default 'new',
  created_at timestamptz default now()
);

alter table public.artworks enable row level security;
alter table public.commission_requests enable row level security;

drop policy if exists "Public can read published artworks" on public.artworks;
create policy "Public can read published artworks"
on public.artworks
for select
using (published = true);

drop policy if exists "Public can create commission requests" on public.commission_requests;
create policy "Public can create commission requests"
on public.commission_requests
for insert
with check (
  length(trim(name)) >= 2
  and position('@' in email) > 1
  and length(trim(message)) >= 12
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artworks',
  'artworks',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read artwork images" on storage.objects;
create policy "Public can read artwork images"
on storage.objects
for select
using (bucket_id = 'artworks');
