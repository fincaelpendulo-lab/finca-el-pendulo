// Facts for the Instagram and Facebook posts of a published blog post. The captions themselves were written
// with the post (blog/social/<key>.json) and approved by Carlos in the dashboard.
//
//   node scripts/blog/social-post.mjs <key>
//
// Checks the Spanish page and its 4:5 cover are live and prints JSON: link, title, imageUrl (1080x1350 JPEG,
// which Instagram and Facebook accept) and the captions as merged on main. Exits 1 if not live yet.
import { execFileSync } from 'node:child_process';
import { root, config, postUrl } from './config.mjs';

const key = process.argv[2];
if (!key) { console.log('Usage: node scripts/blog/social-post.mjs <key>'); process.exit(2); }
const link = postUrl('es', key);
const res = await fetch(link, { redirect: 'follow' });
if (res.status !== 200) { console.error(`${link} returned ${res.status}; not live yet`); process.exit(1); }
const imageUrl = `${config.siteUrl}/og/post-${key}-4x5.jpg`;
const img = await fetch(imageUrl, { method: 'HEAD' });
if (img.status !== 200) { console.error(`${imageUrl} returned ${img.status}; cover not live yet`); process.exit(1); }
const html = await res.text();
const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1]?.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/ \| Finca El Péndulo$/, '');
// The approved captions, as merged on main (this checkout may be behind).
let social = {};
try {
  execFileSync('git', ['fetch', '-q', 'origin', 'main'], { cwd: root });
  social = JSON.parse(execFileSync('git', ['show', `origin/main:blog/social/${key}.json`], { cwd: root }).toString());
} catch { console.error(`No blog/social/${key}.json on origin/main`); }
console.log(JSON.stringify({ key, link, title, imageUrl, instagram: social.instagram ?? null, facebook: social.facebook ?? null }, null, 2));
