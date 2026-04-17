# PixelDrop — Deployment Guide

## Prerequisites

You need accounts on: Supabase, Stripe, Resend, Vercel (or any Next.js host).

---

## 1. Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run both migration files:
   - `supabase/migrations/001_initial.sql` — creates the `products` and `orders` tables, indexes, and RLS policies
   - `supabase/storage-setup.sql` — creates the `product-previews` (public) and `product-files` (private) storage buckets
3. Create the admin user:
   - Go to **Authentication → Users → Add User**
   - Enter your email and a strong password
   - This is the only account that can access `/admin`
4. Copy from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (under Service Role — keep this secret)

---

## 2. Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Use **Test Mode** during development, switch to **Live Mode** for production
3. Copy from **Developers → API Keys**:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
4. **After deployment**, register the webhook endpoint:
   - Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Copy the **Signing Secret** → `STRIPE_WEBHOOK_SECRET`
5. Optionally: add your logo and brand colour in **Settings → Branding** (buyers see this on the Stripe Checkout page)

---

## 3. Resend

1. Create an account at [resend.com](https://resend.com)
2. Go to **Domains** and add + verify your sending domain (requires adding DNS records)
3. Go to **API Keys → Create API Key**
   - Copy → `RESEND_API_KEY`
4. Set `FROM_EMAIL` to an address on your verified domain, e.g. `orders@yourdomain.com`

> **Dev shortcut:** Resend allows sending from `onboarding@resend.dev` without domain verification — use this for local testing only.

---

## 4. Vercel

1. Push your project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Framework preset: **Next.js** (auto-detected)
4. Add all environment variables from `.env.local.example`:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   STRIPE_SECRET_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET
   RESEND_API_KEY
   FROM_EMAIL
   NEXT_PUBLIC_SITE_URL
   ```

5. Set `NEXT_PUBLIC_SITE_URL` to your Vercel domain (e.g. `https://pixeldrop.vercel.app`) — this is used for Stripe `success_url` and `cancel_url`
6. Click **Deploy**

---

## 5. Post-Deployment Checklist

After your first deploy:

- [ ] Visit your domain — confirm the homepage loads with no broken images
- [ ] Add your first real product via `/admin/products/new`
- [ ] Make a test purchase with a Stripe test card (`4242 4242 4242 4242`)
- [ ] Confirm delivery email arrives within 2 minutes
- [ ] Click the download link in the email — confirm file downloads
- [ ] Try the Stripe webhook test: `stripe trigger checkout.session.completed`
- [ ] Confirm unauthenticated `/admin` visits redirect to `/admin/login`
- [ ] Try accessing `https://yourdomain.com/api/admin/products` without auth — confirm 401
- [ ] Try directly accessing a private file URL — confirm it is not publicly accessible

---

## 6. Acceptance Criteria (from PRD.md Section 13)

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 1 | Buyer visits landing page on mobile — loads <3s, product grid visible, no broken images | ✅ | ISR 1h, `next/image` with lazy loading, `priority` on first card (LCP) |
| 2 | Buyer adds product and proceeds to checkout — Stripe Checkout opens with correct price + email field | ✅ | `/api/checkout` creates Stripe session; gracefully skips items without `stripe_price_id` |
| 3 | Buyer completes payment — redirected to `/success`; delivery email arrives <2 min | ✅ | Webhook → order insert → signed URLs → Resend email → status='delivered' |
| 4 | Buyer clicks download link in email — file downloads; link is the correct deliverable | ✅ | Supabase signed URL (48h expiry) pointing to private `product-files` bucket |
| 5 | Stripe webhook fires twice (retry) — only one order created; only one email sent | ✅ | Idempotency check on `stripe_session_id` before processing |
| 6 | Admin uploads new product — product appears on storefront; Stripe Price created | ✅ | `/api/admin/products` POST creates Stripe Product + Price, uploads to Storage, inserts to DB |
| 7 | Admin deactivates a product — hidden from storefront immediately | ✅ | Storefront queries `is_active = true`; toggle calls PATCH and refreshes |
| 8 | Admin resends delivery email — new signed URL generated; buyer receives fresh email | ✅ | `/api/admin/resend-email` fetches products, generates fresh signed URLs, sends via Resend |
| 9 | Unauthenticated visit to `/admin` — redirected to `/admin/login` | ✅ | `src/proxy.ts` middleware + auth check in every admin API route |
| 10 | Direct URL access to private file — 403 Forbidden, file not publicly accessible | ✅ | `product-files` bucket is private; files only accessible via signed URLs with expiry |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test Stripe webhooks locally
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

---

## Environment Variables Reference

See `.env.local.example` for all required variables.
