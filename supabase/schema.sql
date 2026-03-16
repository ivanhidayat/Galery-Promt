-- ============================================================
-- prompt-gallery · Supabase Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Tabel utama
create table if not exists public.images (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  image_url       text not null,
  prompt          text not null,
  negative_prompt text,
  model           text not null,
  steps           integer,
  cfg             numeric(4,1),
  sampler         text,
  resolution      text,
  tags            text[] default '{}',
  created_at      timestamptz default now()
);

-- 2. Index untuk pencarian & filter
create index if not exists idx_images_tags        on public.images using gin(tags);
create index if not exists idx_images_model       on public.images (model);
create index if not exists idx_images_created_at  on public.images (created_at desc);

-- Full-text search: gabungan title + prompt
alter table public.images
  add column if not exists fts tsvector
  generated always as (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(prompt,''))
  ) stored;

create index if not exists idx_images_fts on public.images using gin(fts);

-- 3. Row Level Security
alter table public.images enable row level security;

-- Siapa saja boleh baca
create policy "Public read" on public.images
  for select using (true);

-- Hanya service_role / admin yang boleh insert/update/delete
-- (Untuk admin panel, gunakan service role key di server-side)
create policy "Admin write" on public.images
  for all using (auth.role() = 'service_role');

-- 4. Storage bucket untuk gambar
insert into storage.buckets (id, name, public)
  values ('prompt-images', 'prompt-images', true)
  on conflict do nothing;

-- Policy: siapa saja boleh baca file
create policy "Public image read" on storage.objects
  for select using (bucket_id = 'prompt-images');

-- Policy: hanya authenticated (admin) boleh upload
create policy "Admin image upload" on storage.objects
  for insert with check (
    bucket_id = 'prompt-images'
    and auth.role() = 'authenticated'
  );

-- ============================================================
-- Contoh seed data (optional, hapus jika tidak perlu)
-- ============================================================
insert into public.images
  (title, image_url, prompt, negative_prompt, model, steps, cfg, sampler, resolution, tags)
values
  (
    'Bali Temple Cinematic Photography',
    'https://placehold.co/1024x1024/1a1a2e/ffffff?text=Bali+Temple',
    'ultra realistic bali temple photography, golden hour sunlight, cinematic lighting, 8k detail, professional photography',
    'blurry, low quality, distorted face, watermark',
    'SDXL', 30, 7.0, 'DPM++ 2M', '1024x1024',
    ARRAY['cinematic','photorealistic','architecture','bali']
  ),
  (
    'Cyberpunk City Neon Rain',
    'https://placehold.co/1920x1080/0d0d0d/00ffcc?text=Cyberpunk+City',
    'cyberpunk megacity, neon reflections on wet streets, towering skyscrapers, flying cars, foggy atmosphere, ultra detailed',
    'blurry, day time, low resolution',
    'FLUX', 28, 6.0, 'DDIM', '1920x1080',
    ARRAY['cinematic','fantasy','neon','city']
  );
