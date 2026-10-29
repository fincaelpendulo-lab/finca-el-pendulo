// Builds favicons and 1200x630 social images from the logo files in brand-src/.
// Needs brand-src/mark-white.png and brand-src/lockup-white.png, and scripts/og.json:
//   { "home": { "photo": "src/assets/photos/hero.jpg", "position": "centre" }, ... }
// Run: npm run icons
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { mkdir, writeFile, readFile } from 'node:fs/promises';

const BRAND = '#8b2d1e'; // icon background, the darkest brand colour
const WASH = 'rgb(46,42,37)'; // photo overlay colour on social images (negro)
const mark = 'brand-src/mark-white.png';
await mkdir('public/icons', { recursive: true });
await mkdir('public/og', { recursive: true });

async function icon(size, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const m = await sharp(mark).trim().resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: BRAND } })
    .composite([{ input: m, gravity: 'center' }]).png().toBuffer();
}

for (const [name, size, pad] of [['icon-192.png', 192, 0.14], ['icon-512.png', 512, 0.14], ['apple-touch-icon.png', 180, 0.16], ['maskable-512.png', 512, 0.24]]) {
  await writeFile(`public/icons/${name}`, await icon(size, pad));
}
await writeFile('public/favicon.ico', await pngToIco([await icon(16, 0.06), await icon(32, 0.08), await icon(48, 0.1)]));
const svgPng = (await icon(256, 0.12)).toString('base64');
await writeFile('public/icons/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 256"><image width="256" height="256" xlink:href="data:image/png;base64,${svgPng}"/></svg>\n`);

const og = JSON.parse(await readFile('scripts/og.json', 'utf8'));
const lockup = await sharp('brand-src/lockup-white.png').trim().resize({ height: 230 }).toBuffer();
const wash = Buffer.from(`<svg width="1200" height="630"><rect width="1200" height="630" fill="${WASH}" fill-opacity="0.45"/></svg>`);
for (const [name, cfg] of Object.entries(og)) {
  const base = await sharp(cfg.photo).rotate().resize(1200, 630, { fit: 'cover', position: cfg.position || 'centre' }).toBuffer();
  await sharp(base).composite([{ input: wash }, { input: lockup, top: 64, left: 72 }]).jpeg({ quality: 78, mozjpeg: true }).toFile(`public/og/${name}.jpg`);
}
console.log('icons and', Object.keys(og).length, 'social images written');
