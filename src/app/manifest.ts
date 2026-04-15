import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sunday Sunset Academy',
    short_name: 'Sunday Sunset',
    description: 'Hệ thống Quản lý Sunday - Sunset Basketball Academy',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1117',
    theme_color: '#4f46e5',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
