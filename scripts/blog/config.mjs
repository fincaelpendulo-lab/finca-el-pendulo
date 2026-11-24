// Per-project settings for the blog scripts, read from blog/blog.config.json.
//
// Finca El Péndulo layout: posts are src/content/blog/<key>.es.md and <key>.en.md, where <key> is the
// Spanish slug. Each file has `slug` (its own URL slug) and `pair` (the other language's slug).
// Spanish lives at /blog/<slug>, English at /en/blog/<slug>.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const c = JSON.parse(readFileSync(join(root, 'blog/blog.config.json'), 'utf8'));
export const config = {
  siteUrl: c.siteUrl.replace(/\/$/, ''),
  brand: c.brand,
  contactEmail: c.contactEmail,
  dashboardUrl: c.dashboardUrl,
  repo: c.repo,
  utmSource: c.utmSource ?? 'finca_el_pendulo',
  cover: {
    veil: c.cover?.veil ?? '#1f1a14',
    accent: c.cover?.accent ?? '#f0cf98',
    logo: c.cover?.logo ?? 'brand-src/lockup-white.png',
    displayFont: c.cover?.displayFont,
    italicFont: c.cover?.italicFont,
    textFont: c.cover?.textFont,
  },
};

export const postFile = (key, lang) => join(root, 'src/content/blog', `${key}.${lang}.md`);
export const postPath = (lang, slug) => (lang === 'es' ? `/blog/${slug}` : `/en/blog/${slug}`);
export const postUrl = (lang, slug) => `${config.siteUrl}${postPath(lang, slug)}`;
export const exists = existsSync;

// Small frontmatter reader (one `key: value` per line; quoted strings; [a, b] lists).
export function parse(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('no frontmatter');
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
  }
  return { data, body: m[2] };
}
