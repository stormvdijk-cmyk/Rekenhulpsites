// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { AstroPWAIntegration as AstroPWA } from '@vite-pwa/astro';

// SITE_URL en BASE_PATH worden in de GitHub Actions-workflow gezet (actions/configure-pages).
// Lokaal en op Cloudflare Pages/eigen domein: BASE_PATH leeg laten.
// Altijd https: GitHub Pages geeft het eigen domein door als http:// zolang 'Enforce HTTPS' uit staat.
const site = (process.env.SITE_URL || 'https://uwrekenhulp.nl').replace(/^http:\/\//, 'https://');
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'nl', locales: { nl: 'nl-NL' } },
    }),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      base,
      scope: base,
      manifest: {
        name: 'Rekenhulp – financiële rekenhulpen',
        short_name: 'Rekenhulp',
        description: 'Gratis Nederlandse rekenhulpen voor salaris, btw, sparen, lenen en meer.',
        lang: 'nl',
        theme_color: '#0f4c5c',
        background_color: '#f7f9fa',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      includeManifestIcons: false,
      generateSW: {
        globPatterns: ['**/*.{html,css,js,svg,png,txt}'],
        navigateFallback: undefined,
        cleanupOutdatedCaches: true,
        // Rekenhulpen bewaren hun invoer in de querystring; negeer die bij het opzoeken in de cache.
        ignoreURLParametersMatching: [/.*/],
        // Pagina's worden geserveerd als /slug/ (map met index.html); zet de cache-URL's daarop.
        manifestTransforms: [
          async (entries) => ({
            manifest: entries.map((e) => {
              if (e.url === '404') return { ...e, url: '404.html' };
              if (!/\.[a-z0-9]+$/i.test(e.url) && !e.url.endsWith('/')) return { ...e, url: `${e.url}/` };
              return e;
            }),
            warnings: [],
          }),
        ],
        // Externe scripts (AdSense, analytics) nooit cachen
        runtimeCaching: [],
      },
    }),
  ],
});
