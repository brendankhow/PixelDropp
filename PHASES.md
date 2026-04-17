# PixelDrop — Claude Code Build Phases & Prompts

Each phase is self-contained and builds on the previous one.
Complete them **in order**. Do not skip phases.

---

## Before You Start — One-Time Setup Checklist

Complete these manually before running Phase 1:

1. **Supabase** — create a free project at supabase.com
   - Copy: Project URL, Anon Key, Service Role Key
   - Run the SQL from Phase 1 prompt in the Supabase SQL editor

2. **Stripe** — create an account at stripe.com
   - Enable test mode
   - Copy: Publishable Key, Secret Key
   - Webhook secret comes later (Phase 4)

3. **Resend** — create a free account at resend.com
   - Verify your sending domain
   - Copy: API Key

4. **Your `.env.local`** — fill in all values before starting Phase 1

---

## PHASE 1 — Project Foundation & Database

**What gets built:** Next.js project scaffold, Tailwind config, Supabase DB schema, Storage buckets, shared layout, global styles, and reusable UI components.

**Token budget:** ~4,000–6,000 tokens of output. Safe.

---

### PHASE 1 PROMPT

```
I'm building PixelDrop — a digital products storefront. Read PRD.md in this folder before doing anything else.

Set up the complete project foundation:

1. NEXT.JS SETUP
   - Init Next.js 14 with App Router, TypeScript, Tailwind CSS, ESLint
   - Install dependencies: @supabase/supabase-js @supabase/ssr stripe resend @radix-ui/react-dialog lucide-react clsx
   - Set up path alias: @/* → ./src/*
   - Create src/app folder structure matching all routes in PRD Section 9

2. FOLDER STRUCTURE
   Create these empty files/folders so the structure is ready:
   src/
   ├── app/
   │   ├── (store)/          ← public storefront layout group
   │   │   ├── layout.tsx
   │   │   ├── page.tsx
   │   │   ├── products/[slug]/page.tsx
   │   │   ├── cart/page.tsx
   │   │   └── success/page.tsx
   │   ├── admin/
   │   │   ├── layout.tsx
   │   │   ├── login/page.tsx
   │   │   ├── dashboard/page.tsx
   │   │   ├── products/page.tsx
   │   │   ├── products/new/page.tsx
   │   │   ├── products/[id]/edit/page.tsx
   │   │   └── orders/page.tsx
   │   └── api/
   │       ├── checkout/route.ts
   │       ├── webhooks/stripe/route.ts
   │       ├── admin/products/route.ts
   │       ├── admin/resend-email/route.ts
   │       └── admin/refund/route.ts
   ├── components/
   │   ├── ui/              ← shared primitives (Button, Badge, Card, etc.)
   │   ├── store/           ← public storefront components
   │   └── admin/           ← admin-only components
   ├── lib/
   │   ├── supabase/
   │   │   ├── client.ts    ← browser client
   │   │   ├── server.ts    ← server client
   │   │   └── middleware.ts
   │   ├── stripe.ts
   │   └── utils.ts
   └── types/
       └── index.ts

3. SUPABASE DATABASE
   Create supabase/migrations/001_initial.sql with this exact schema:

   -- Products table
   create table products (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     description text,
     price integer not null,
     category text not null check (category in ('iphone', 'desktop', 'bundle', 'other')),
     preview_image_url text,
     additional_images text[] default '{}',
     file_path text not null,
     is_active boolean default true,
     tags text[] default '{}',
     stripe_price_id text,
     stripe_product_id text,
     created_at timestamptz default now()
   );

   -- Orders table
   create table orders (
     id uuid primary key default gen_random_uuid(),
     stripe_session_id text unique not null,
     stripe_payment_intent_id text,
     customer_email text not null,
     amount_total integer not null,
     currency text default 'usd',
     status text default 'pending' check (status in ('pending','paid','delivered','refunded','failed')),
     products jsonb not null default '[]',
     email_sent_at timestamptz,
     created_at timestamptz default now()
   );

   -- Indexes
   create index orders_email_idx on orders(customer_email);
   create index orders_status_idx on orders(status);
   create index orders_created_idx on orders(created_at desc);
   create index products_active_idx on products(is_active, category);

   -- RLS: enable but allow service role full access
   alter table products enable row level security;
   alter table orders enable row level security;
   create policy "Public can read active products" on products for select using (is_active = true);
   create policy "Service role full access products" on products using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
   create policy "Service role full access orders" on orders using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

4. SUPABASE STORAGE
   Create supabase/storage-setup.sql:
   insert into storage.buckets (id, name, public) values ('product-previews', 'product-previews', true);
   insert into storage.buckets (id, name, public) values ('product-files', 'product-files', false);
   -- Public read on previews
   create policy "Public read previews" on storage.objects for select using (bucket_id = 'product-previews');
   -- Service role only on product-files
   create policy "Service role only files" on storage.objects using (bucket_id = 'product-files' and auth.role() = 'service_role');

5. TYPESCRIPT TYPES (src/types/index.ts)
   Export these types matching the DB schema exactly:
   - Product (all columns)
   - Order (all columns)
   - CartItem { product: Product; quantity: number }

6. SUPABASE CLIENT HELPERS
   - src/lib/supabase/client.ts → createBrowserClient
   - src/lib/supabase/server.ts → createServerClient (uses cookies)
   - src/lib/supabase/middleware.ts → updateSession helper

7. MIDDLEWARE (src/middleware.ts)
   - Protect all /admin/* routes (except /admin/login)
   - If no session → redirect to /admin/login
   - Use Supabase SSR middleware pattern

8. GLOBAL STYLES & LAYOUT
   - Tailwind config: extend with a dark, premium colour palette
     Primary: #5B21B6 (purple), Background: #0A0A0A, Surface: #111111, Border: #1F1F1F
   - Global font: Inter (Google Fonts)
   - Root layout: sets dark background, applies font

9. SHARED UI COMPONENTS (src/components/ui/)
   Build these reusable components:
   - Button.tsx (variants: primary, secondary, ghost, danger; sizes: sm, md, lg)
   - Badge.tsx (variants: success, warning, error, neutral)
   - Card.tsx (simple wrapper with surface bg and border)
   - Input.tsx (styled text input)
   - Select.tsx (styled dropdown)
   - Toggle.tsx (boolean toggle switch)
   - Spinner.tsx (loading spinner)

10. ENV SETUP
    Create .env.local.example with all variables from PRD Section 11.
    Create .env.local and tell me which values I need to fill in.

Do NOT build any page content yet — just the foundation. Every file should compile without errors. Run `npm run build` at the end and fix any type errors before finishing.
```

---

## PHASE 2 — Public Storefront (Product Display)

**What gets built:** Landing page, product grid, category filter, product detail page — all fully styled and mobile-responsive. Uses real Supabase data.

**Prerequisite:** Phase 1 complete. Supabase project created, `.env.local` filled in, migration SQL run in Supabase dashboard.

**Token budget:** ~5,000–8,000 tokens. Safe.

---

### PHASE 2 PROMPT

```
Phase 1 is complete. Now build the public-facing storefront pages. Read PRD.md sections 4.1 and 4.2.

The design should feel premium and modern — dark background (#0A0A0A), purple accents (#5B21B6), clean typography. Think Apple.com meets a boutique creative shop.

1. STORE LAYOUT (src/app/(store)/layout.tsx)
   - Sticky top navbar: PixelDrop logo (left), cart icon with item count badge (right)
   - Cart icon opens the cart drawer (build the drawer here as a client component)
   - Footer: simple, "© PixelDrop · Built for creators"

2. LANDING PAGE (src/app/(store)/page.tsx)
   - Hero section:
     - Full-width, dark gradient background
     - Headline: "Beautiful wallpapers for every screen"
     - Subheadline: "Hand-crafted for iPhone, desktop and beyond. Instant delivery to your inbox."
     - CTA button: "Shop Wallpapers" → scrolls to product grid
   
   - Trust bar below hero:
     "✓ Instant email delivery  ·  ✓ High resolution files  ·  ✓ Secure checkout"
   
   - Category filter tabs: All · iPhone · Desktop · Bundles
     - Clicking a tab filters the product grid without page reload (client-side state)
   
   - Product grid: responsive (1 col mobile, 2 col tablet, 3-4 col desktop)
     - Fetches products from Supabase where is_active = true
     - Filtered by selected category tab

3. PRODUCT CARD COMPONENT (src/components/store/ProductCard.tsx)
   - Preview image (uses next/image, aspect ratio 9:16 for iPhone, 16:9 for desktop)
   - Category badge (top-left corner overlay)
   - Product name
   - Price (formatted: $4.99)
   - "Add to Cart" button — adds to cart state, shows brief "Added ✓" feedback
   - Clicking the card (not the button) navigates to the PDP

4. PRODUCT DETAIL PAGE (src/app/(store)/products/[slug]/page.tsx)
   - Use product `id` as the slug (update if you prefer a name-based slug — just be consistent)
   - Large preview image (left on desktop, top on mobile)
   - Right column: name, category badge, price, description
   - Resolution spec line (e.g. "2556 × 1179 px · iPhone 15 Pro")
   - "Add to Cart" button — primary, full-width on mobile
   - Additional images carousel if additional_images array has entries
   - Back button / breadcrumb

5. CART STATE (src/lib/cart-store.ts)
   - Use Zustand for cart state (install: npm install zustand)
   - CartItem: { product: Product, quantity: number }
   - Actions: addItem, removeItem, updateQuantity, clearCart, getTotal
   - Persist to localStorage

6. CART DRAWER COMPONENT (src/components/store/CartDrawer.tsx)
   - Slides in from the right
   - List of cart items: thumbnail, name, quantity control (+/-), remove (×), line total
   - Subtotal at the bottom
   - "Proceed to Checkout" button (disabled if cart is empty) — calls POST /api/checkout
   - Empty state: "Your cart is empty. Start shopping ↑"

7. SERVER-SIDE DATA FETCHING
   - Landing page fetches products server-side with Next.js (use Supabase server client)
   - PDP fetches single product server-side, generates metadata (title, og:image)
   - Use generateStaticParams for ISR on the PDP

8. SEED DATA
   Create supabase/seed.sql with 4 sample products:
   - 2 iPhone wallpapers (use placeholder.co URLs for preview_image_url)
   - 1 desktop wallpaper
   - 1 bundle
   - file_path can be 'placeholder/sample.zip' for now
   Run this in the Supabase SQL editor to have data to work with.

Design requirements:
- Every page is pixel-perfect on iPhone 14 (390px width)
- Product images maintain correct aspect ratios
- All interactive elements have hover/active states
- Loading states for async operations (use Spinner component)
- Error states if Supabase fetch fails

Run `npm run build` at the end and fix all errors before finishing.
```

---

## PHASE 3 — Cart, Checkout & Success Page

**What gets built:** Stripe Checkout session API route, complete checkout flow, success page. The payment loop is fully functional after this phase.

**Prerequisite:** Phase 2 complete. Stripe account created, keys in `.env.local`.

**Token budget:** ~3,000–5,000 tokens. Safe.

---

### PHASE 3 PROMPT

```
Phases 1 and 2 are complete. Now wire up the full checkout flow. Read PRD.md sections 4.3, 4.4, and 8.1.

1. CHECKOUT API ROUTE (src/app/api/checkout/route.ts)
   POST handler:
   - Accept body: { items: [{ stripe_price_id: string, quantity: number, product_id: string, name: string }] }
   - Validate: items array is not empty, all stripe_price_ids are present
   - Create Stripe Checkout Session:
     {
       mode: 'payment',
       payment_method_types: ['card'],
       line_items: items.map(i => ({ price: i.stripe_price_id, quantity: i.quantity })),
       customer_creation: 'always',
       success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
       metadata: {
         product_ids: JSON.stringify(items.map(i => i.product_id))
       }
     }
   - Return { url: session.url }
   - On error: return 500 with error message

2. CART DRAWER — CONNECT TO CHECKOUT
   Update CartDrawer.tsx "Proceed to Checkout" button:
   - On click: POST to /api/checkout with cart items (needs stripe_price_id)
   - Show loading spinner while waiting
   - On success: window.location.href = url (redirect to Stripe)
   - On error: show inline error message "Checkout failed, please try again"
   
   IMPORTANT: ProductCard and CartItem must carry stripe_price_id. 
   Update the Product type and Supabase query to include stripe_price_id.

3. SUCCESS PAGE (src/app/(store)/success/page.tsx)
   - Read session_id from URL search params
   - Fetch Stripe session details server-side using stripe.checkout.sessions.retrieve(sessionId)
   - Display:
     - Large checkmark icon (green)
     - "Payment successful!" heading
     - "We're sending your wallpapers to [customer_email]" 
     - "They'll arrive within 1–2 minutes. Check your spam folder too."
     - Order summary: product names, total amount paid
     - "Share on X" button linking to: https://twitter.com/intent/tweet?text=Just+grabbed+some+beautiful+wallpapers+from+@PixelDrop+%F0%9F%8E%A8&url=https://pixeldrop.com
     - "Browse more wallpapers" link back to /
   - If session_id is missing or invalid: redirect to /

4. STRIPE LIBRARY SETUP (src/lib/stripe.ts)
   - Export a singleton Stripe instance (server-side)
   - Export a helper: formatPrice(cents: number) → "$4.99"

5. CART → STRIPE PRICE ID REQUIREMENT
   Products need a stripe_price_id to go to checkout.
   Update the seed.sql to include placeholder stripe_price_ids OR
   add a note in the admin product form (Phase 5) that these are auto-created on product save.
   For now, make checkout gracefully skip items without a stripe_price_id and show a warning.

6. ERROR HANDLING
   - If Stripe is not configured (missing env vars): return a clear error, don't crash
   - All API routes should return proper HTTP status codes

Run `npm run build` and test the complete flow manually:
- Add item to cart → open drawer → click checkout → should redirect to Stripe test checkout.
Fix all errors before finishing.
```

---

## PHASE 4 — Stripe Webhooks & Automatic Email Delivery

**What gets built:** Webhook handler, order creation in DB, Resend email with signed download links. This is the core fulfilment engine.

**Prerequisite:** Phase 3 complete. Resend account created, API key in `.env.local`.

**Token budget:** ~4,000–6,000 tokens. Safe.

---

### PHASE 4 PROMPT

```
Phases 1–3 are complete. Now build the fulfilment engine. Read PRD.md sections 4.5, 8.2, and 8.3.

1. STRIPE WEBHOOK HANDLER (src/app/api/webhooks/stripe/route.ts)
   - Use raw body parsing (disable Next.js body parsing for this route)
   - Verify Stripe signature using STRIPE_WEBHOOK_SECRET
   - Handle these events:
   
   checkout.session.completed:
     a. Check if order with this stripe_session_id already exists → if yes, skip (idempotency)
     b. Extract: customer_email, amount_total, currency, payment_intent, metadata.product_ids
     c. Fetch product details from Supabase using product_ids
     d. Insert order into DB with status = 'paid'
     e. Generate signed URLs for each product's file_path (48 hours expiry)
     f. Send delivery email via Resend
     g. Update order: status = 'delivered', email_sent_at = now()
     h. If email fails: log error, keep status = 'paid' (don't crash, allows admin to resend)
   
   payment_intent.payment_failed:
     a. Find order by payment_intent_id (if exists) → set status = 'failed'
   
   charge.refunded:
     a. Find order by payment_intent_id → set status = 'refunded'
   
   - Always return 200 to Stripe (even on internal errors, to prevent retries for non-retryable failures)

2. EMAIL TEMPLATE (src/components/emails/DeliveryEmail.tsx)
   Build a React Email template:
   - Clean, dark-themed HTML email
   - Header: PixelDrop logo text + tagline
   - "Your wallpapers are ready!" heading
   - Order summary: product names, amount paid
   - Download section: for each file, a prominent download button
     - Button links to the Supabase signed URL
     - Label: product name + "Download"
   - Note: "Links expire in 48 hours. Reply to this email if you need them resent."
   - Footer: "Thank you for your purchase · PixelDrop"
   Install: npm install @react-email/components react-email

3. EMAIL SENDER HELPER (src/lib/email.ts)
   Export sendDeliveryEmail({ to, products, downloadLinks, orderTotal }):
   - Uses Resend SDK
   - from: process.env.FROM_EMAIL
   - subject: "Your PixelDrop wallpapers are here 🎨"
   - react: <DeliveryEmail ... />

4. SIGNED URL HELPER (src/lib/supabase/storage.ts)
   Export generateSignedUrl(filePath: string): Promise<string>
   - Uses Supabase service role client
   - Bucket: 'product-files'
   - Expiry: 48 * 60 * 60 seconds
   - Throws with clear message if file not found

5. RESEND EMAIL API ROUTE (src/app/api/admin/resend-email/route.ts)
   POST handler (admin use only — check Supabase auth session):
   - Accept body: { orderId: string }
   - Fetch order from DB
   - Fetch products from DB using order.products[].id
   - Generate fresh signed URLs
   - Resend delivery email
   - Update order.email_sent_at = now()
   - Return { success: true }

6. WEBHOOK LOCAL TESTING SETUP
   Add a comment block at the top of the webhook route with instructions:
   "To test locally: stripe login → stripe listen --forward-to localhost:3000/api/webhooks/stripe
    Then in another terminal: stripe trigger checkout.session.completed"

7. NEXT.JS ROUTE CONFIG
   In the webhook route file, export:
   export const config = { api: { bodyParser: false } }
   (Required for Stripe signature verification)

Run `npm run build`. The fulfilment flow must compile cleanly. 
Write a comment in the webhook handler summarising the full flow for future reference.
```

---

## PHASE 5 — Admin Portal (Auth + Product Management)

**What gets built:** Admin login page, protected layout, product upload form with file uploads to Supabase Storage, product list with edit/delete, Stripe Product+Price auto-creation.

**Prerequisite:** Phase 4 complete. Admin account created in Supabase Dashboard → Authentication → Users.

**Token budget:** ~6,000–8,000 tokens. Safe.

---

### PHASE 5 PROMPT

```
Phases 1–4 are complete. Now build the admin portal. Read PRD.md sections 6.1, 6.2, and 6.3.

The admin UI should feel clean and professional — like a SaaS dashboard. 
Use a slightly lighter surface (#111111 cards on #0A0A0A bg) with the same purple accent.

1. ADMIN LAYOUT (src/app/admin/layout.tsx)
   - Sidebar navigation (collapsible on mobile):
     · Dashboard (chart icon) → /admin/dashboard
     · Products (grid icon) → /admin/products
     · Orders (receipt icon) → /admin/orders
   - Top bar: "PixelDrop Admin" title + "Sign out" button
   - Sign out calls supabase.auth.signOut() then redirects to /admin/login
   - Active nav item highlighted with purple accent
   - Only renders for authenticated users (middleware handles redirect)

2. ADMIN LOGIN PAGE (src/app/admin/login/page.tsx)
   - Centered card layout
   - PixelDrop logo/wordmark
   - Email + Password inputs
   - "Sign In" button
   - On submit: supabase.auth.signInWithPassword({ email, password })
   - On success: redirect to /admin/dashboard
   - On error: show inline error message
   - No "sign up" link

3. PRODUCTS API ROUTE (src/app/api/admin/products/route.ts)
   Use Supabase service role client for all operations.
   
   GET: fetch all products (including inactive), ordered by created_at desc
   
   POST: create new product
   - Validate required fields
   - Upload preview image to 'product-previews' bucket
   - Upload deliverable file to 'product-files' bucket  
   - Create Stripe Product: stripe.products.create({ name, description })
   - Create Stripe Price: stripe.prices.create({ product, unit_amount: price, currency: 'usd' })
   - Insert into products DB with stripe_product_id and stripe_price_id
   - Return created product
   
   PATCH /:id: update product
   - Allow updating: name, description, price, category, is_active, tags
   - If price changed: create new Stripe Price (Prices are immutable), archive old one
   - Update DB
   
   DELETE /:id: soft delete (set is_active = false)

4. PRODUCT UPLOAD FORM (src/app/admin/products/new/page.tsx)
   Client component. Use a multi-step form or single scrollable form — your choice.
   
   Fields (match PRD Section 6.2 exactly):
   - Product Name (text, required)
   - Description (textarea)
   - Category (select: iPhone / Desktop / Bundle / Other)
   - Price in USD (number input, min 0.50)
   - Preview Image (file input, accept: image/*)
     - Show image preview before upload
   - Additional Images (multi-file input, accept: image/*)
     - Show thumbnails of selected files
   - Deliverable File (file input, accept: *)
     - Show filename once selected
   - Active toggle (default: true)
   - Tags (text input, comma-separated, shown as chips)
   
   On submit:
   - Use FormData to POST to /api/admin/products
   - Show upload progress indicator
   - On success: redirect to /admin/products with success toast
   - On error: show inline error, don't reset form

5. PRODUCT EDIT PAGE (src/app/admin/products/[id]/edit/page.tsx)
   - Fetch existing product server-side
   - Render same form as new product, pre-filled
   - "Replace Preview Image" and "Replace Deliverable File" optional file inputs
   - PATCH to /api/admin/products
   - "Cancel" button → back to /admin/products

6. PRODUCT LIST PAGE (src/app/admin/products/page.tsx)
   Table with columns:
   - Preview (small thumbnail)
   - Name
   - Category badge
   - Price
   - Status (Active/Draft toggle — inline, calls PATCH immediately)
   - Sales (count from orders — compute from orders.products jsonb)
   - Created date
   - Actions: Edit (pencil icon) | Preview (external link icon) | Delete (trash icon)
   
   - "Add New Product" button → /admin/products/new
   - Confirm dialog before delete
   - Empty state if no products

7. TOAST NOTIFICATIONS (src/components/ui/Toast.tsx)
   Simple toast system (or use sonner: npm install sonner):
   - Success (green), Error (red), Info (blue)
   - Auto-dismisses after 3 seconds
   - Used across admin for action feedback

Run `npm run build`. Test manually: upload a product via the form, verify it appears in Supabase DB and on the storefront. Fix all errors before finishing.
```

---

## PHASE 6 — Admin Dashboard & Orders

**What gets built:** Sales metrics dashboard, revenue charts, orders table with resend/refund actions.

**Prerequisite:** Phase 5 complete. At least one test order in the DB (make a test Stripe payment).

**Token budget:** ~5,000–7,000 tokens. Safe.

---

### PHASE 6 PROMPT

```
Phases 1–5 are complete. Now build the sales dashboard and orders management. Read PRD.md sections 7 and 8.3.

Install chart library: npm install recharts

1. DASHBOARD PAGE (src/app/admin/dashboard/page.tsx)
   Server component — fetches all data server-side.
   
   a. METRICS CARDS (top row, 4 cards):
      Fetch from orders where status IN ('delivered', 'refunded'):
      - Total Revenue: sum(amount_total) / 100, formatted as $X,XXX.XX
      - Total Orders: count(*)
      - Units Sold: sum of all items across orders.products jsonb array
      - Avg Order Value: Total Revenue / Total Orders
      Each card: icon, label, value, subtle trend arrow (vs last 30 days)
   
   b. REVENUE CHART (client component: RevenueChart.tsx):
      - Line chart using Recharts
      - X axis: dates, Y axis: revenue in $
      - Toggle buttons: 30 days | 90 days | All time
      - Data fetched server-side, passed as prop, toggled client-side
      - Purple line (#5B21B6), dark grid lines, clean tooltip
   
   c. CATEGORY BREAKDOWN (client component: CategoryChart.tsx):
      - Bar chart: revenue by category (iPhone / Desktop / Bundle / Other)
      - Same purple colour scheme
   
   d. TOP PRODUCTS TABLE:
      - Ranked by total revenue
      - Columns: # | Product | Category | Units Sold | Revenue
      - Max 5 rows, "View all products →" link

2. ORDERS PAGE (src/app/admin/orders/page.tsx)
   Server component with client-side filtering.
   
   a. SEARCH & FILTERS bar:
      - Text input: search by email or order ID (client-side filter on loaded data)
      - Status filter dropdown: All / Paid / Delivered / Refunded / Failed
      - Date range: Last 7 days / 30 days / 90 days / All time
   
   b. ORDERS TABLE:
      Columns:
      - Date (formatted: "Apr 16, 2026 · 14:32")
      - Customer Email
      - Products (product names, comma-separated, truncated if long)
      - Amount (formatted: $4.99)
      - Status badge (use Badge component: delivered=green, paid=blue, refunded=yellow, failed=red)
      - Email Sent (checkmark + time, or "—" if not sent)
      - Actions
   
   c. ACTIONS per row (icon buttons with tooltips):
      - Resend Email (envelope icon):
        · POST /api/admin/resend-email { orderId }
        · Show spinner while loading
        · On success: toast "Email resent successfully"
        · On error: toast "Failed to resend email"
      
      - Refund (arrow-return icon):
        · Show confirmation dialog: "Refund $X.XX to [email]? This cannot be undone."
        · POST /api/admin/refund { orderId }
        · On success: update row status to 'refunded' optimistically
   
   d. REFUND API ROUTE (src/app/api/admin/refund/route.ts):
      - Check admin auth session
      - Fetch order from DB
      - Call stripe.refunds.create({ payment_intent: order.stripe_payment_intent_id })
      - Update order status = 'refunded'
      - Return { success: true }
   
   e. PAGINATION:
      - Show 20 orders per page
      - Simple prev/next pagination

3. DASHBOARD REDIRECT (src/app/admin/page.tsx):
   - Simple redirect to /admin/dashboard

4. EMPTY STATES:
   - Dashboard with no orders: "No sales yet. Share your products on X to get started! 🚀"
   - Orders table with no results: "No orders match your filters."

Run `npm run build`. Verify the dashboard renders without errors even with 0 orders in the DB. Fix all errors before finishing.
```

---

## PHASE 7 — Polish, Security & Production Readiness

**What gets built:** Mobile UX polish, SEO meta tags, error boundaries, loading states, security hardening, and Vercel deployment.

**Prerequisite:** Phases 1–6 complete and all pages rendering correctly.

**Token budget:** ~3,000–5,000 tokens. Safe.

---

### PHASE 7 PROMPT

```
Phases 1–6 are complete. This is the final phase — polish, security, and deployment. Read PRD.md sections 10 and 13.

1. SEO & METADATA
   - Root layout: default metadata (title, description, og:image, twitter:card)
   - Landing page: override with storefront-specific metadata
   - PDP: dynamic metadata using generateMetadata() — title = product name, og:image = preview_image_url
   - Add robots.txt and sitemap.xml (static, or dynamic for product pages)
   - All images have descriptive alt text

2. ERROR HANDLING
   - src/app/error.tsx — global error boundary (dark themed, "Something went wrong" message)
   - src/app/not-found.tsx — 404 page with "Page not found" and link back to /
   - API routes: all errors return proper HTTP status codes with { error: string } body
   - Webhook handler: wrap entire handler in try/catch, always return 200

3. LOADING STATES
   - src/app/loading.tsx — global loading skeleton
   - Product grid loading: skeleton cards (same dimensions as ProductCard)
   - PDP loading: skeleton layout
   - Admin tables: skeleton rows
   - All async buttons show Spinner and disable during loading

4. MOBILE UX AUDIT
   Test and fix these specifically:
   - Cart drawer: full-height on mobile, scrollable items, fixed bottom bar with total + checkout
   - Product grid: 1 column on 375px, 2 column on 640px+
   - PDP: image full-width on mobile, details below
   - Admin sidebar: collapses to hamburger menu on mobile
   - All tap targets minimum 44×44px
   - No horizontal scroll on any page

5. SECURITY HARDENING
   a. Admin API routes — add this check to ALL admin API routes:
      const supabase = createServerClient(...)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   
   b. Verify middleware protects all /admin/* routes correctly
   
   c. Add Content Security Policy headers in next.config.js:
      - Default: self only
      - Scripts: self + stripe.com
      - Frames: js.stripe.com (for Stripe Elements)
   
   d. Add X-Frame-Options: DENY header

6. PERFORMANCE
   - Verify all product images use next/image with proper sizes prop
   - Add priority={true} to the first product image in the grid (LCP optimization)
   - Verify ISR is configured: export const revalidate = 3600 on product pages

7. ENVIRONMENT & BUILD
   - Audit .env.local.example — ensure ALL variables are listed
   - Add validation in src/lib/env.ts: check all required env vars are set, throw clear error if missing
   - Run `npm run build` — zero errors, zero warnings if possible

8. VERCEL DEPLOYMENT GUIDE
   Create DEPLOY.md in the project root:
   
   # Deployment Guide
   
   ## 1. Supabase
   - Run supabase/migrations/001_initial.sql in Supabase SQL Editor
   - Run supabase/storage-setup.sql in Supabase SQL Editor
   - Create admin user: Authentication → Users → Add User
   - Copy all Supabase env vars
   
   ## 2. Stripe
   - Add all products via the admin portal (creates Stripe prices automatically)
   - Register webhook endpoint: https://yourdomain.com/api/webhooks/stripe
     Events to listen for: checkout.session.completed, payment_intent.payment_failed, charge.refunded
   - Copy webhook signing secret → STRIPE_WEBHOOK_SECRET
   
   ## 3. Resend
   - Verify your sending domain
   - Update FROM_EMAIL to use your verified domain
   
   ## 4. Vercel
   - Connect GitHub repo → import project
   - Add all env vars from .env.local.example
   - Deploy
   - Set NEXT_PUBLIC_SITE_URL to your Vercel domain
   
   ## 5. Post-deployment checks (run the 10 acceptance criteria from PRD.md Section 13)

9. FINAL ACCEPTANCE CRITERIA CHECK
   Go through every item in PRD.md Section 13 and verify each one passes.
   For each item, add a comment in DEPLOY.md: ✅ or ❌ with notes.

Run `npm run build` one final time. The build must be clean with zero errors.
```

---

## Quick Reference

| Phase | What's Built | Key Output |
|-------|-------------|------------|
| 1 | Foundation | Project scaffold, DB schema, shared components |
| 2 | Storefront | Landing page, PDP, cart UI |
| 3 | Checkout | Stripe Checkout, success page |
| 4 | Fulfilment | Webhooks, order DB, email delivery |
| 5 | Admin Portal | Product upload, file storage, Stripe sync |
| 6 | Dashboard | Metrics, charts, orders table, refunds |
| 7 | Production | Polish, security, SEO, deployment |

---

## Important Rules for Claude Code

1. **Read PRD.md first** — every prompt starts with "Read PRD.md". Don't skip this.
2. **Never duplicate code** — if a component/helper exists from a previous phase, import it.
3. **TypeScript strict mode** — no `any` types unless absolutely necessary.
4. **Run `npm run build` before finishing** — every phase must compile cleanly.
5. **Don't mock data in production paths** — seed.sql is for development only.
6. **Environment variables** — never hardcode secrets. Always use `process.env.*`.
