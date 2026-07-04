create extension if not exists pgcrypto;

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text,
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

alter table public.artworks add column if not exists category text;
alter table public.artworks add column if not exists image_width int;
alter table public.artworks add column if not exists image_height int;

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

-- Privilegi di base per i ruoli pubblici. SERVONO oltre alla RLS: senza questi
-- la lettura anon fallisce con "permission denied for table artworks".
grant usage on schema public to anon, authenticated;
grant select on public.artworks to anon, authenticated;
grant insert on public.commission_requests to anon, authenticated;

-- Privilegi della service role (usata da TUTTE le mutazioni admin).
-- La service role bypassa la RLS ma NON i privilegi SQL: il restore di un
-- progetto in pausa puo' perderli (visto succedere: "permission denied for
-- table artworks" con hint di GRANT), quindi vanno riaffermati qui.
grant usage on schema public to service_role;
grant all on public.artworks to service_role;
grant all on public.commission_requests to service_role;

-- E per le tabelle future create dall'editor SQL (ruolo postgres):
alter default privileges in schema public
  grant all on tables to service_role;

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

-- Tipo opera (ortogonale a category, che resta la dimensione collezione/serie)
-- e contatore visualizzazioni. Il default 'tavola' riempie anche le righe
-- esistenti al momento dell'ALTER.
alter table public.artworks add column if not exists kind text not null default 'tavola';
alter table public.artworks add column if not exists view_count int not null default 0;

alter table public.artworks drop constraint if exists artworks_kind_check;
alter table public.artworks
  add constraint artworks_kind_check check (kind in ('tavola', 'illustrazione'));

-- Impostazioni sito modificabili dall'admin (annuncio header, testi hero).
-- Le scritture passano solo dalla service role (nessun grant di insert/update).
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

-- Come per artworks: il grant serve oltre alla RLS per la lettura anon,
-- e la service role (scritture admin) ha bisogno dei privilegi espliciti.
grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
using (true);

-- Chiavi di default (idempotente; valore vuoto = elemento nascosto nel sito).
-- contact_email parte dal valore reale gia' pubblicato; i social partono
-- vuoti (le icone compaiono solo quando l'admin inserisce gli URL veri).
insert into public.site_settings (key, value) values
  ('announcement_text', ''),
  ('hero_title', ''),
  ('hero_subtitle', ''),
  ('contact_email', 'cloudiestdayy@gmail.com'),
  ('instagram_url', ''),
  ('twitter_url', ''),
  ('artstation_url', '')
on conflict (key) do nothing;

-- Incremento atomico delle visualizzazioni. SECURITY DEFINER perche' anon
-- non ha (e non deve avere) UPDATE su artworks; conta solo opere pubblicate.
create or replace function public.increment_artwork_view(artwork_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.artworks
  set view_count = view_count + 1
  where slug = artwork_slug
    and published = true;
$$;

revoke all on function public.increment_artwork_view(text) from public;
grant execute on function public.increment_artwork_view(text) to anon, authenticated;
