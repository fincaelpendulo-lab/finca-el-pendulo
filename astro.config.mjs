import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// BASE_PATH is "/finca-el-pendulo" while the site is served from GitHub Pages'
// project URL, and "/" on the real domain (Hostinger sets BASE_PATH=/).
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: 'https://fincaelpendulo.com.mx',
  base,
  trailingSlash: 'never',
  build: {
    // about.astro -> about.html; .htaccess serves it at /about.
    format: 'file',
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(40[34]|gracias|thank-you)\/?$/.test(page),
    }),
  ],
  image: {
    responsiveStyles: false,
  },
});
