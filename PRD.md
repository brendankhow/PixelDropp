# PixelDrop — Product Requirements Document
**Version:** 1.0 | **Status:** Ready for Engineering | **Stack:** Next.js · Supabase · Stripe · Resend

---

## 1. Product Overview

### 1.1 Vision
PixelDrop is a lean, high-conversion digital storefront for creators selling digital products online. The MVP focuses on wallpapers (iPhone, desktop/laptop), but the architecture is **product-agnostic** — any digital file can be listed, sold, and automatically delivered.

**Core promise:** a buyer sees a promotion on X, taps a link, pays in seconds, and receives their download in their inbox. No account creation. No friction.

### 1.2 Goals
- Sub-3-click checkout from landing page to payment confirmation
- Zero manual fulfilment — every sale triggers automatic email delivery
- Scalable product catalog — add any digital product type without code changes
- Full visibility into sales, revenue, and delivery status via an internal dashboard

### 1.3 Out of Scope (MVP)
- Physical product shipping
- Subscription / recurring billing
- User accounts & purchase history
- Multi-vendor marketplace
- Mobile native app

---

## 2. User Personas

### 2.1 The Buyer
| Attribute | Detail |
|-----------|--------|
| Discovery | Sees product promoted on X (Twitter) |
| Device | Primarily mobile (iPhone); some desktop |
| Intent | Impulse / aspirational purchase |
| Pain Point | Complicated checkouts cause drop-off |
| Expectation | Instant delivery to email, no account needed |

### 2.2 The Seller (Admin)
| Attribute | Detail |
|-----------|--------|
| Identity | Creator / founder (single user) |
| Needs | Upload products, set prices, monitor sales |
| Access | Password-protected admin portal at `/admin` |
| Expectation | No-code product management interface |

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) | SSR, fast, excellent DX |
| Styling | Tailwind CSS | Rapid, consistent UI |
| Backend / DB | Supabase (Postgres + Storage) | Auth, file storage, DB in one |
| Payments | Stripe Checkout + Webhooks | PCI compliant, hosted checkout |
| Email Delivery | Resend + React Email | Reliable transactional email |
| File Storage | Supabase Storage (private buckets) | Secure signed download URLs |
| Hosting | Vercel | Zero-config Next.js deployment |
| Admin Auth | Supabase Auth (single admin user) | Simple, secure |

> **Note:** Stripe does not include a per-product sales dashboard. A custom internal dashboard is required (see Section 7).

---

## 4. Public Storefront — Buyer Experience

### 4.1 Landing Page
Entry point from all X promotions. Must load fast and convert immediately.

**Required elements:**
- Hero section: headline, subheadline, prominent CTA button
- Product grid: cards with thumbnail, name, price, "Buy Now" button
- Category filter tabs: All · iPhone Wallpapers · Desktop Wallpapers
- Trust signals: "✓ Instant email delivery", "✓ High resolution", "✓ Secure checkout via Stripe"
- Mobile-first responsive layout

**Performance:**
- LCP < 2.5s on mobile
- All images served as WebP with lazy loading
- No cookie banners / interstitials blocking the product grid

### 4.2 Product Detail Page (PDP)
- High-resolution preview image (watermarked or blurred edge optional)
- Product name, description, resolution specs (e.g. 2556 × 1179 px for iPhone 15 Pro)
- Price with currency symbol
- "Add to Cart" button — primary CTA
- Compatibility badge (e.g. iPhone 12–15 / MacBook / 4K Desktop)
- Preview carousel for bundle products

### 4.3 Cart
- Slide-out cart drawer (not a full page) to maintain context
- Line items with thumbnail, name, price, quantity control, remove button
- Order total clearly shown
- "Proceed to Checkout" button — triggers Stripe Checkout session creation
- Cart state persisted in `localStorage`

### 4.4 Checkout Flow (Stripe Hosted)
Checkout is handled by **Stripe Checkout** (hosted page) for PCI compliance.

**Stripe Checkout configuration:**
- Email field: required
- Payment methods: Card + Apple Pay + Google Pay (auto-enabled)
- Billing address: off (digital goods)
- Custom branding: logo, brand colour, store name in Stripe Dashboard
- `success_url`: `https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}`
- `cancel_url`: `https://yourdomain.com/cart`

**Success Page (`/success`):**
- "Payment successful! Check your inbox." confirmation message
- Order summary (product name, email, amount paid)
- Note: "Your wallpapers will arrive within 1–2 minutes"
- Social share prompt: "Share your new wallpaper on X"

### 4.5 Post-Payment Email Delivery
Triggered by confirmed `checkout.session.completed` Stripe webhook.

**Email spec:**
- From: `orders@yourdomain.com`
- Subject: `Your PixelDrop wallpapers are here 🎨`
- Body: order summary + product name
- Download links: one per file — **Supabase signed URLs with 48-hour expiry**
- Fallback: "If your download link has expired, reply to this email."

---

## 5. Data Model

### 5.1 `products` table
```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null, -- in cents (e.g. 499 = $4.99)
  category text not null, -- 'iphone' | 'desktop' | 'bundle' | 'other'
  preview_image_url text, -- public URL
  additional_images text[], -- array of public URLs
  file_path text not null, -- private Supabase Storage path
  is_active boolean default true,
  tags text[],
  stripe_price_id text,
  stripe_product_id text,
  created_at timestamptz default now()
);
```

### 5.2 `orders` table
```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_payment_intent_id text,
  customer_email text not null,
  amount_total integer not null, -- in cents
  currency text default 'usd',
  status text default 'pending', -- 'pending' | 'paid' | 'delivered' | 'refunded' | 'failed'
  products jsonb not null, -- [{ id, name, price }]
  email_sent_at timestamptz,
  created_at timestamptz default now()
);
```

### 5.3 Supabase Storage Buckets
| Bucket | Access | Contents |
|--------|--------|----------|
| `product-previews` | Public | Thumbnail and preview images |
| `product-files` | Private | Deliverable files (ZIP, PNG, PDF, etc.) |

---

## 6. Admin Portal — Product Management

### 6.1 Authentication
- Route: `/admin` — redirects to `/admin/login` if not authenticated
- Supabase Auth — single admin account (email + password)
- No public registration — admin account created via Supabase Dashboard
- Session managed via Supabase Auth cookies + Next.js middleware

### 6.2 Product Upload Form (`/admin/products/new`)

| Field | Type | Notes |
|-------|------|-------|
| Product Name | Text input | Required |
| Description | Textarea | Supports basic markdown |
| Category | Dropdown | iPhone · Desktop · Bundle · Other |
| Price (USD) | Number input | Converted to cents internally |
| Preview Image | File upload (JPG/PNG/WebP) | Uploaded to public bucket |
| Additional Images | Multi-file upload | PDP carousel |
| Deliverable File | File upload (any type) | Uploaded to private bucket |
| Active / Draft | Toggle | Controls storefront visibility |
| Tags | Text input (comma-separated) | For filtering |

**On save:**
1. Preview images → Supabase Storage `product-previews` (public) → URL stored in DB
2. Deliverable file → Supabase Storage `product-files` (private) → path stored in DB
3. Stripe Product + Price created via Stripe API → IDs stored in DB
4. Product live on storefront if Active = true

### 6.3 Product List (`/admin/products`)
- Table: name, category, price, status, created date, sales count
- Inline active/draft toggle
- Edit, Delete (soft delete), Preview actions

---

## 7. Internal Sales Dashboard (`/admin/dashboard`)

### 7.1 Overview Metrics Cards
- Total Revenue (all time, USD)
- Total Orders (count of paid orders)
- Units Sold (sum of all line items)
- Average Order Value

### 7.2 Charts
- Line chart: daily revenue over last 30 / 90 days / all time
- Bar chart: revenue by product category

### 7.3 Orders Table (`/admin/orders`)
- Columns: Date · Email · Products · Amount · Status · Email Sent
- Status badge: `pending` / `paid` / `delivered` / `refunded` / `failed`
- Search by email or order ID
- Filter by status and date range
- **"Resend Email"** action — regenerates signed URL, resends delivery email
- **"Refund"** action — triggers Stripe refund, updates order status

### 7.4 Top Products Table
- Ranked by total revenue and units sold
- Columns: Product · Category · Units Sold · Revenue

---

## 8. Stripe Integration

### 8.1 Checkout Session Creation (`POST /api/checkout`)
```js
{
  mode: 'payment',
  line_items: [...], // from cart, using stripe_price_id
  customer_creation: 'always',
  success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${SITE_URL}/cart`,
  metadata: { product_ids: JSON.stringify(['uuid1', 'uuid2']) }
}
```

### 8.2 Webhook Handler (`POST /api/webhooks/stripe`)
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create order → send delivery email → set status = `delivered` |
| `payment_intent.payment_failed` | Log failure, set status = `failed` |
| `charge.refunded` | Set status = `refunded` |

**Idempotency:** Check if `stripe_session_id` already exists in `orders` before processing. Prevents duplicate emails on Stripe retries.

### 8.3 Stripe Environment
- Use **test mode** during development (`sk_test_...`)
- Switch to **live mode** for production (`sk_live_...`)
- Webhook secret must be registered in Stripe Dashboard

---

## 9. Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page — hero, product grid, category filter |
| `/products/[slug]` | Public | Product detail page |
| `/cart` | Public | Cart page (or handled by slide-out drawer) |
| `/success` | Public | Post-payment confirmation page |
| `/admin` | Admin | Redirect to `/admin/dashboard` |
| `/admin/login` | Public | Admin login form |
| `/admin/dashboard` | Admin | Sales dashboard |
| `/admin/products` | Admin | Product list |
| `/admin/products/new` | Admin | New product upload form |
| `/admin/products/[id]/edit` | Admin | Edit existing product |
| `/admin/orders` | Admin | Orders table with actions |
| `/api/checkout` | API | POST — creates Stripe Checkout session |
| `/api/webhooks/stripe` | API (Stripe) | POST — handles all Stripe events |
| `/api/admin/products` | API (Admin) | CRUD for products |
| `/api/admin/resend-email` | API (Admin) | POST — resend delivery email |
| `/api/admin/refund` | API (Admin) | POST — trigger Stripe refund |

---

## 10. Non-Functional Requirements

### 10.1 Security
- All `/admin/*` routes protected by Supabase Auth middleware
- Deliverable files in **private** Supabase bucket — never publicly accessible
- Signed download URLs: 48-hour expiry, unique per order
- Stripe webhook signature verification on every request
- All secrets in environment variables — never hardcoded

### 10.2 Performance
- `next/image` for all product images (auto WebP, lazy load, resize)
- Product catalog uses Next.js ISR — revalidates on product update
- No blocking scripts in the critical rendering path

### 10.3 Mobile Experience
- Full Tailwind responsive design — mobile, tablet, desktop
- Touch-friendly tap targets (minimum 44px)
- Apple Pay / Google Pay prominent on mobile via Stripe

### 10.4 Reliability
- Webhook processing is idempotent (duplicate-safe)
- Failed email delivery logged and visible in admin orders table
- Supabase platform handles DB backups

---

## 11. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
FROM_EMAIL=orders@yourdomain.com

# App
NEXT_PUBLIC_SITE_URL=https://pixeldrop.com
```

---

## 12. Acceptance Criteria

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Buyer visits landing page on mobile | Loads <3s, product grid visible, no broken images |
| 2 | Buyer adds product and proceeds to checkout | Stripe Checkout opens with correct price + email field |
| 3 | Buyer completes payment | Redirected to `/success`; delivery email arrives <2 min |
| 4 | Buyer clicks download link in email | File downloads; link is the correct deliverable |
| 5 | Stripe webhook fires twice (retry) | Only one order created; only one email sent |
| 6 | Admin uploads new product | Product appears on storefront; Stripe Price created |
| 7 | Admin deactivates a product | Hidden from storefront immediately |
| 8 | Admin resends delivery email | New signed URL generated; buyer receives fresh email |
| 9 | Unauthenticated visit to `/admin` | Redirected to `/admin/login` |
| 10 | Direct URL access to private file | 403 Forbidden — file not publicly accessible |
