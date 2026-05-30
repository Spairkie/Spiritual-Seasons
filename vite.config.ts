import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // GitHub Pages deploys to a subdirectory — set base to './' for compatibility
  base: './',

  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Code-split pages into lazy chunks
        manualChunks(id: string) {
          if (id.includes('/pages/home'))        return 'page-home';
          if (id.includes('/pages/devotional'))  return 'page-devotional';
          if (id.includes('/pages/quiz'))        return 'page-quiz';
          if (id.includes('/pages/toc'))         return 'page-toc';
          if (id.includes('/pages/search'))      return 'page-search';
          if (id.includes('/pages/favorites'))   return 'page-favorites';
          if (id.includes('/pages/progress'))    return 'page-progress';
          if (id.includes('/pages/reflections')) return 'page-reflections';
          if (id.includes('/pages/settings'))    return 'page-settings';
          if (id.includes('/pages/privacy'))     return 'page-privacy';
          if (id.includes('/pages/intro'))       return 'page-intro';
          return undefined;
        },
      },
    },
  },

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/icons/*.{svg,png}', 'assets/images/*.webp'],
      manifest: false, // manifest.webmanifest is in public/
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /content\/.*\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'content-json',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
});
