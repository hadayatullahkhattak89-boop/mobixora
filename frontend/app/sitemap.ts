import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mobixora.com';

  const staticRoutes = [
    '',
    '/shop',
    '/shop?category=smartphones',
    '/shop?category=iphones',
    '/shop?category=android-phones',
    '/shop?category=chargers',
    '/shop?category=earbuds',
    '/shop?category=power-banks',
    '/shop?category=smart-watches',
    '/shop?category=mobile-covers',
    '/track-order',
    '/about',
    '/contact',
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
}
