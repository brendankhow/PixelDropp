import { Resend } from 'resend';
import { DeliveryEmail } from '@/components/emails/DeliveryEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendDeliveryEmailParams {
  to: string;
  products: Array<{ id: string; name: string; price: number }>;
  downloadLinks: Array<{ productName: string; url: string }>;
  orderTotal: number; // in cents
}

/**
 * Send the post-purchase delivery email via Resend.
 * Contains signed Supabase download URLs (48-hour expiry).
 * Throws on failure — callers should catch and handle gracefully.
 */
export async function sendDeliveryEmail({
  to,
  products,
  downloadLinks,
  orderTotal,
}: SendDeliveryEmailParams) {
  const from = process.env.FROM_EMAIL;
  if (!from) throw new Error('FROM_EMAIL environment variable is not set');

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: 'Your PixelDrop wallpapers are here 🎨',
    react: (
      <DeliveryEmail
        products={products}
        downloadLinks={downloadLinks}
        orderTotal={orderTotal}
      />
    ),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return data;
}
