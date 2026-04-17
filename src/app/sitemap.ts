import { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pixeldrop.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('is_active', true);

    const productRoutes: MetadataRoute.Sitemap = (data ?? []).map((p) => ({
      url: `${siteUrl}/products/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
