import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

/* `npm run dev` serves the app with instant reload; `npm run build` writes
   dist/, the folder that gets uploaded to hosting. The PWA plugin adds what
   Android needs to install it from the browser: a manifest and a service
   worker that keeps the app working offline. */
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Crusader',
        short_name: 'Crusader',
        description:
          'A bodyweight training plan with animated exercises, progressions and stretch breaks.',
        theme_color: '#0B0C0E',
        background_color: '#0B0C0E',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: { port: 5184, strictPort: true },
  /* three.js (the 3D figure) is most of the ~900 kB bundle; it is cached
     once by the service worker, so the default 500 kB warning is raised */
  build: { chunkSizeWarningLimit: 1000 },
});
