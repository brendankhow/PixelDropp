import { createServiceClient } from './server';

const EXPIRY_SECONDS = 48 * 60 * 60; // 48 hours

/**
 * Generate a signed URL for a private file in the 'product-files' bucket.
 * Uses the service role client so it can bypass RLS.
 * Throws with a clear message if the file is not found or URL generation fails.
 */
export async function generateSignedUrl(filePath: string): Promise<string> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from('product-files')
    .createSignedUrl(filePath, EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(
      `Failed to generate signed URL for "${filePath}": ${error?.message ?? 'Unknown error'}`
    );
  }

  return data.signedUrl;
}
