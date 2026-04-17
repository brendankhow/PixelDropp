import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

// ── Auth guard ────────────────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Upload helper ─────────────────────────────────────────────────────────────
async function uploadToStorage(
  supabase: ReturnType<typeof createServiceClient>,
  bucket: string,
  file: File,
  suffix: string
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${randomUUID()}-${suffix}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return path;
}

// ── GET /api/admin/products ───────────────────────────────────────────────────
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// ── POST /api/admin/products ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  // ── Parse fields ────────────────────────────────────────────────────────────
  const name = (formData.get('name') as string | null)?.trim();
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const category = formData.get('category') as string | null;
  const priceStr = formData.get('price') as string | null;
  const isActiveStr = formData.get('is_active') as string | null;
  const tagsStr = (formData.get('tags') as string | null) ?? '';

  const previewFile = formData.get('preview_image');
  const deliverableFile = formData.get('deliverable_file');
  const additionalImageEntries = formData.getAll('additional_images');

  // ── Validate ────────────────────────────────────────────────────────────────
  if (!name) return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  if (!category) return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  if (!priceStr) return NextResponse.json({ error: 'Price is required' }, { status: 400 });

  const priceUsd = parseFloat(priceStr);
  if (isNaN(priceUsd) || priceUsd < 0.5) {
    return NextResponse.json({ error: 'Price must be at least $0.50' }, { status: 400 });
  }
  const priceCents = Math.round(priceUsd * 100);

  // Use duck-typing instead of `instanceof File`.
  // In Next.js 16 + Node 20 the FormData entries for file inputs are Blob-derived
  // objects from the Web Streams API, not the Node.js global `File` class, so
  // `instanceof File` evaluates to false even when a real file was uploaded.
  function isUploadedFile(v: FormDataEntryValue | null): v is File {
    return !!v && typeof (v as Blob).size === 'number' && (v as Blob).size > 0;
  }

  if (!isUploadedFile(previewFile)) {
    return NextResponse.json({ error: 'Preview image is required' }, { status: 400 });
  }
  if (!isUploadedFile(deliverableFile)) {
    return NextResponse.json({ error: 'Deliverable file is required' }, { status: 400 });
  }

  const isActive = isActiveStr !== 'false';
  const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const additionalImageFiles = additionalImageEntries.filter(isUploadedFile);

  const supabase = createServiceClient();

  // ── Upload files ─────────────────────────────────────────────────────────────
  let previewPath: string;
  let filePath: string;
  let additionalImageUrls: string[] = [];

  try {
    previewPath = await uploadToStorage(supabase, 'product-previews', previewFile, 'preview');
    filePath = await uploadToStorage(supabase, 'product-files', deliverableFile, 'file');

    if (additionalImageFiles.length > 0) {
      const additionalPaths = await Promise.all(
        additionalImageFiles.map((f, i) =>
          uploadToStorage(supabase, 'product-previews', f, `additional-${i}`)
        )
      );
      additionalImageUrls = additionalPaths.map((p) => {
        const { data } = supabase.storage.from('product-previews').getPublicUrl(p);
        return data.publicUrl;
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'File upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { data: previewUrlData } = supabase.storage
    .from('product-previews')
    .getPublicUrl(previewPath);
  const previewImageUrl = previewUrlData.publicUrl;

  // ── Create Stripe Product + Price ────────────────────────────────────────────
  let stripeProductId: string;
  let stripePriceId: string;

  try {
    const stripeProduct = await stripe.products.create({
      name,
      description: description || undefined,
    });
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: priceCents,
      currency: 'usd',
    });
    stripeProductId = stripeProduct.id;
    stripePriceId = stripePrice.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error';
    return NextResponse.json({ error: `Stripe: ${msg}` }, { status: 500 });
  }

  // ── Insert into DB ──────────────────────────────────────────────────────────
  const { data: product, error: dbError } = await supabase
    .from('products')
    .insert({
      name,
      description: description || null,
      price: priceCents,
      category,
      preview_image_url: previewImageUrl,
      additional_images: additionalImageUrls,
      file_path: filePath,
      is_active: isActive,
      tags,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(product, { status: 201 });
}
