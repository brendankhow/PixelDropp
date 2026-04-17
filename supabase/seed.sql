-- PixelDrop — Seed Data (development only)
-- Run this in the Supabase SQL Editor after running 001_initial.sql and storage-setup.sql
-- Uses placeholder images from placehold.co
--
-- NOTE: stripe_price_id and stripe_product_id are intentionally omitted here.
-- In production, these are auto-created by the admin product upload form (Phase 5).
-- Without stripe_price_id, products will appear on the storefront but cannot be
-- purchased — the cart drawer will warn the buyer and skip unpriced items at checkout.

insert into products (name, description, price, category, preview_image_url, file_path, is_active, tags)
values
  (
    'Aurora Borealis — iPhone',
    'A stunning aurora borealis wallpaper in deep violets and greens, perfectly optimised for iPhone 15 Pro. Makes your lock screen look like a window to the Arctic.',
    499,
    'iphone',
    'https://placehold.co/1170x2532/0A0A0A/5B21B6?text=Aurora+Borealis',
    'placeholder/aurora-iphone.zip',
    true,
    ARRAY['aurora', 'dark', 'nature', 'purple']
  ),
  (
    'Midnight Circuit — iPhone',
    'Abstract circuit board art in deep midnight tones. Clean, minimal, and incredibly satisfying on an OLED display.',
    499,
    'iphone',
    'https://placehold.co/1170x2532/0A0A0A/A78BFA?text=Midnight+Circuit',
    'placeholder/circuit-iphone.zip',
    true,
    ARRAY['abstract', 'dark', 'minimal', 'tech']
  ),
  (
    'Cosmic Nebula — Desktop',
    'An ultra-high resolution nebula wallpaper at 4K. Deep space tones of indigo and violet that make your desktop look like mission control.',
    799,
    'desktop',
    'https://placehold.co/3840x2160/0A0A0A/6D28D9?text=Cosmic+Nebula',
    'placeholder/nebula-desktop.zip',
    true,
    ARRAY['space', 'dark', '4k', 'nebula']
  ),
  (
    'Creator Bundle — iPhone + Desktop',
    'Get the full set: 5 iPhone wallpapers and 3 desktop wallpapers in one download. Hand-crafted in dark, minimal aesthetics for the modern creator.',
    1499,
    'bundle',
    'https://placehold.co/1200x900/0A0A0A/5B21B6?text=Creator+Bundle',
    'placeholder/creator-bundle.zip',
    true,
    ARRAY['bundle', 'dark', 'minimal', 'value']
  );
