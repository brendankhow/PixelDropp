-- PixelDrop — Storage Bucket Setup
-- Run this in the Supabase SQL Editor AFTER running 001_initial.sql

-- ─── Create storage buckets ───────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('product-previews', 'product-previews', true);

insert into storage.buckets (id, name, public)
  values ('product-files', 'product-files', false);

-- ─── Storage policies ─────────────────────────────────────────────────────────

-- Anyone can read preview images (they are publicly accessible thumbnails)
create policy "Public read previews"
  on storage.objects for select
  using (bucket_id = 'product-previews');

-- Only service role can access the private deliverable files
create policy "Service role only files"
  on storage.objects
  using (bucket_id = 'product-files' and auth.role() = 'service_role');
