// C:\projects\teamwork-meter\vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-512-maskable.png',
      ],
      manifest: {
        name: 'כוח הצוות – מד שיתוף פעולה',
        short_name: 'Teamwork',
        description: 'מד שיתוף פעולה – אפליקציה משפחתית',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0b0f19',
        theme_color: '#0b0f19',
        dir: 'rtl',
        lang: 'he',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // לא להכניס את תמונות הדרקונים ל-precache (גדולות מ-2MB)
        globIgnores: ['**/dragons-team-hazut/**'],

        // כן להכניס את כל השאר (כולל mp3/webp) ל-precache
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,mp3}'],

        // העלאת התקרה כגיבוי
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB

        // ניווט אופליין בסיסי
        navigateFallback: '/index.html',

        // טעינת תמונות/אודיו בזמן ריצה + קאש
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'audio',
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
})
