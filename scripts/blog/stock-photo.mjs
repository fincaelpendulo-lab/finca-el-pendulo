// Stock cover photos for blog posts.
//
//   node scripts/blog/stock-photo.mjs search "<query>" [--slug my-post] [--n 8] [--orientation portrait|landscape]
//     Finds photos (portrait by default, for the 4:5 social cover) and saves small previews in
//     blog/.photo-candidates/<slug>/ (01.jpg, 02.jpg...) plus candidates.json. Look at the previews before choosing.
//   node scripts/blog/stock-photo.mjs save <slug> <number> [--for cover|page]
//     cover (default; Carlos 2026-11-24: covers use stock photos): saves blog/covers/stock-<slug>.jpg, the photo
//       for scripts/blog/cover.mjs. The post page keeps a Finca photo.
//     page: saves src/assets/photos/stock-blog-<slug>.jpg for the post page (stock is named stock-* so it never
//       passes as the Finca); put the printed credit in the frontmatter.
//
// Providers, in order: Pexels (PEXELS_API_KEY), Unsplash (UNSPLASH_ACCESS_KEY), then Openverse (no key,
// only licenses that allow commercial use). Keys are read from the environment or from .env in the repo root.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { root, config } from './config.mjs';
const env = { ...readDotenv(join(root, '.env')), ...process.env };
const UA = `blog-photos/1.0 (+${config.siteUrl})`;

function readDotenv(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8').split('\n')
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/))
      .filter(Boolean).map((m) => [m[1], m[2]]),
  );
}

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  return res.json();
}

async function pexels(q, n) {
  if (!env.PEXELS_API_KEY) return [];
  const d = await getJson(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&orientation=${orient}&per_page=${n}`,
    { Authorization: env.PEXELS_API_KEY });
  return d.photos.map((p) => ({
    provider: 'Pexels', id: String(p.id), width: p.width, height: p.height, alt: p.alt || '',
    preview: p.src.medium, full: p.src.original,
    author: p.photographer, authorUrl: p.photographer_url, page: p.url, license: 'Pexels License',
  }));
}

async function unsplash(q, n) {
  if (!env.UNSPLASH_ACCESS_KEY) return [];
  const d = await getJson(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&orientation=${orient}&per_page=${n}`,
    { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` });
  const utm = `?utm_source=${config.utmSource}&utm_medium=referral`;
  return d.results.map((p) => ({
    provider: 'Unsplash', id: p.id, width: p.width, height: p.height, alt: p.alt_description || '',
    preview: p.urls.small, full: `${p.urls.raw}&w=2000&fm=jpg&q=85`, track: p.links.download_location,
    author: p.user.name, authorUrl: p.user.links.html + utm, page: p.links.html + utm, license: 'Unsplash License',
  }));
}

async function openverse(q, n) {
  const d = await getJson(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license_type=commercial&aspect_ratio=${orient === 'portrait' ? 'tall' : 'wide'}&mature=false&page_size=20`);
  return d.results.filter((p) => !/nc|nd/.test(p.license)).map((p) => ({
    provider: 'Openverse', id: p.id, width: p.width, height: p.height, alt: p.title || '',
    preview: p.thumbnail, full: p.url, author: p.creator || 'Unknown', authorUrl: p.creator_url || p.foreign_landing_url,
    page: p.foreign_landing_url, license: `${p.license.toUpperCase()} ${p.license_version || ''}`.trim(), licenseUrl: p.license_url,
  }));
}

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} downloading ${new URL(url).host}`);
  return Buffer.from(await res.arrayBuffer());
}

const [cmd, ...args] = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const orient = opt('orientation', 'portrait') === 'landscape' ? 'landscape' : 'portrait';

if (cmd === 'search') {
  const q = args[0];
  const slug = opt('slug', 'draft');
  const n = Number(opt('n', 8));
  if (!q) throw new Error('Usage: search "<query>" [--slug s] [--n 8]');
  let found = [];
  for (const provider of [pexels, unsplash, openverse]) {
    try { found = (await provider(q, n)).filter((p) => Math.min(p.width, p.height) >= 1080 && (orient === 'portrait' ? p.height >= p.width : p.width > p.height)).slice(0, n); } catch (e) { console.error(`${provider.name}: ${e.message}`); }
    if (found.length) break;
  }
  if (!found.length) { console.log('No photos found. Try a broader query.'); process.exit(1); }
  const dir = join(root, 'blog/.photo-candidates', slug);
  mkdirSync(dir, { recursive: true });
  const out = [];
  for (const [i, p] of found.entries()) {
    const file = join(dir, `${String(i + 1).padStart(2, '0')}.jpg`);
    let img = null;
    for (const url of [p.preview, p.full]) { try { img = await download(url); break; } catch {} }
    if (!img) continue;
    try { await sharp(img).resize(640).jpeg({ quality: 70 }).toFile(file); } catch { continue; }
    out.push({ n: i + 1, file, ...p });
  }
  writeFileSync(join(dir, 'candidates.json'), JSON.stringify(out, null, 2));
  for (const p of out) console.log(`${p.n}. [${p.provider}] ${p.width}x${p.height} by ${p.author}: ${p.alt}\n   preview: ${p.file}`);
} else if (cmd === 'save') {
  const [slug, num] = args;
  const list = JSON.parse(readFileSync(join(root, 'blog/.photo-candidates', slug, 'candidates.json'), 'utf8'));
  const p = list.find((c) => c.n === Number(num));
  if (!p) throw new Error(`No candidate ${num} for ${slug}`);
  const forPage = opt('for', 'cover') === 'page';
  const name = forPage ? `stock-blog-${slug}` : `stock-${slug}`;
  const file = forPage ? join(root, 'src/assets/photos', `${name}.jpg`) : join(root, 'blog/covers', `${name}.jpg`);
  mkdirSync(dirname(file), { recursive: true });
  await sharp(await download(p.full)).rotate().resize(1800, 1800, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true })
    .toFile(file);
  // Unsplash asks apps to report each download.
  if (p.track) await getJson(p.track, { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` }).catch(() => {});
  const credit = `${p.author} / ${p.provider === 'Openverse' ? p.license : p.provider}`;
  console.log(JSON.stringify({ file: file.replace(root + '/', ''), image: forPage ? name : undefined, imageCredit: credit, imageCreditUrl: p.page, provider: p.provider, license: p.license }, null, 2));
} else {
  console.log('Usage: stock-photo.mjs search "<query>" [--slug s] | save <slug> <n>');
}
