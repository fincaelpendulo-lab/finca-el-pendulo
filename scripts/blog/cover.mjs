// Social cover for a blog post, in the feed's "Frase y calma" look (marketing/diseno/guia-visual.md).
// The post page itself shows the clean photo (frontmatter `image`); this cover is for Instagram, Facebook
// and link previews.
//
//   node scripts/blog/cover.mjs <key> --photo <file.jpg> --title "Tu primer *temazcal*" [--sub "Qué esperar antes, durante y después"] [--focus top|center|bottom]
//
// Writes, from the same photo and text:
//   public/og/post-<key>-4x5.jpg   1080x1350, the image of the Instagram and Facebook post
//   public/og/post-<key>.jpg       1200x630, the link preview (frontmatter `og: post-<key>`)
// and keeps the photo path in blog/covers/<key>.json so the cover can be rebuilt with another title.
//
// Look: photo slightly lifted and desaturated, a soft warm-black veil only behind the text (radial, 28 % at most),
// big white Cormorant Garamond headline, one *accent word* in italics, a Montserrat subtitle, small white
// Finca lockup at the bottom centre. Headline 2 to 6 words, subtitle one short line.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import sharp from 'sharp';
import { create as loadFont } from 'fontkitten';
import { root, config } from './config.mjs';

const args = process.argv.slice(2);
const key = args[0];
const opt = (k, d) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d);
const title = opt('title');
const sub = opt('sub', '');
const focus = opt('focus', 'center');
if (!key || !title) { console.log('Usage: cover.mjs <key> --photo <file> --title "Short *hook*" [--sub "One short line"] [--focus top|center|bottom]'); process.exit(2); }

const memo = join(root, 'blog/covers', `${key}.json`);
mkdirSync(join(root, 'blog/covers'), { recursive: true });
let photoPath = opt('photo');
if (!photoPath && existsSync(memo)) photoPath = join(root, JSON.parse(readFileSync(memo, 'utf8')).photo);
if (!photoPath || !existsSync(photoPath)) { console.error('No photo: pass --photo <file>'); process.exit(1); }
writeFileSync(memo, JSON.stringify({ photo: relative(root, resolve(photoPath)), title, sub, focus }, null, 2));

const fonts = {};
const font = (p) => (fonts[p] ??= loadFont(readFileSync(join(root, p))));
const F = { display: config.cover.displayFont, italic: config.cover.italicFont, text: config.cover.textFont };

// Lays out words (each {t, f}) into centred lines no wider than maxW; returns SVG paths and size.
function block(words, size, maxW, lineH, tracking = 0) {
  const adv = (w) => { const f = font(w.f); const k = size / f.unitsPerEm; return f.glyphsForString(w.t).reduce((s, g) => s + g.advanceWidth * k + tracking, 0); };
  const space = (f) => font(f).glyphsForString(' ')[0].advanceWidth * (size / font(f).unitsPerEm);
  const lines = [[]];
  let lw = 0;
  for (const w of words) {
    const add = adv(w) + (lines.at(-1).length ? space(w.f) : 0);
    if (lines.at(-1).length && lw + add > maxW) { lines.push([w]); lw = adv(w); } else { lines.at(-1).push(w); lw += add; }
  }
  const asc = font(words[0].f).ascent * (size / font(words[0].f).unitsPerEm);
  let paths = '';
  const widths = lines.map((ln) => ln.reduce((s, w, i) => s + adv(w) + (i ? space(w.f) : 0), 0));
  lines.forEach((ln, i) => {
    let x = (maxW - widths[i]) / 2;
    ln.forEach((w, j) => {
      if (j) x += space(w.f);
      const f = font(w.f); const k = size / f.unitsPerEm;
      for (const g of f.glyphsForString(w.t)) {
        paths += `<path fill="${w.c ?? '#fff'}" transform="translate(${x.toFixed(1)} ${(asc + i * lineH).toFixed(1)}) scale(${k} ${-k})" d="${g.path.toSVG()}"/>`;
        x += g.advanceWidth * k + tracking;
      }
    });
  });
  return { paths, lines: lines.length, height: Math.ceil(asc + (lines.length - 1) * lineH + size * 0.3) };
}

// "*word*" → italic accent word (white on light photos is the rule; miel only with --accent).
const useMiel = args.includes('--accent');
const headWords = title.split(/\s+/).map((t) => ({ t: t.replace(/\*/g, ''), f: F.display }));
// Italics span: everything between an opening and closing asterisk is italic.
let inItalic = false;
title.split(/\s+/).forEach((t, i) => { if (t.startsWith('*')) inItalic = true; if (inItalic) { headWords[i].f = F.italic; if (useMiel) headWords[i].c = config.cover.accent; } if (/\*[.,:;!?]?$/.test(t)) inItalic = false; });

async function render(W, H, out, { maxSize, minSize, colW, subSize, logoH, gravity }) {
  const photo = await sharp(photoPath).rotate().resize(W, H, { fit: 'cover', position: gravity })
    .modulate({ saturation: 0.78, brightness: 1.03 }).linear(0.92, 14).toBuffer();
  let size = maxSize, head;
  for (; size >= minSize; size -= 4) { head = block(headWords, size, colW, size * 1.02); if (head.lines <= 3) break; }
  const subB = sub ? block(sub.split(/\s+/).map((t) => ({ t: t.toUpperCase(), f: F.text })), subSize, colW, subSize * 1.5, subSize * 0.14) : null;
  const gap = Math.round(size * 0.32);
  const blockH = head.height + (subB ? gap + subB.height : 0);
  const top = Math.round((H - blockH) / 2 - H * 0.02);
  const left = Math.round((W - colW) / 2);
  const cx = W / 2, cy = top + blockH / 2;
  const veil = config.cover.veil;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="v" cx="${cx}" cy="${cy}" r="${Math.max(colW * 0.78, blockH)}" gradientUnits="userSpaceOnUse" gradientTransform="translate(${cx} ${cy}) scale(1 ${Math.min(1, (blockH + H * 0.25) / (colW * 1.2))}) translate(${-cx} ${-cy})">
        <stop offset="0" stop-color="${veil}" stop-opacity="0.30"/><stop offset="0.6" stop-color="${veil}" stop-opacity="0.18"/><stop offset="1" stop-color="${veil}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="b" x1="0" x2="0" y1="0" y2="1"><stop offset="0.78" stop-color="${veil}" stop-opacity="0"/><stop offset="1" stop-color="${veil}" stop-opacity="0.28"/></linearGradient>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="${Math.round(size * 0.12)}"/><feComponentTransfer><feFuncA type="linear" slope="0.24"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/><rect width="100%" height="100%" fill="url(#b)"/>
    <g filter="url(#s)"><g transform="translate(${left} ${top})">${head.paths}</g>
    ${subB ? `<g transform="translate(${left} ${top + head.height + gap})">${subB.paths}</g>` : ''}</g>
  </svg>`;
  const logo = await sharp(join(root, config.cover.logo)).trim().resize({ height: logoH }).toBuffer({ resolveWithObject: true });
  await sharp(photo).composite([
    { input: Buffer.from(svg) },
    { input: logo.data, left: Math.round((W - logo.info.width) / 2), top: H - logoH - Math.round(H * 0.055) },
  ]).jpeg({ quality: 86, mozjpeg: true }).toFile(out);
  return `${relative(root, out)} (headline ${size}px, ${head.lines} lines)`;
}

const g = { top: 'north', center: 'centre', bottom: 'south' }[focus] ?? 'centre';
mkdirSync(join(root, 'public/og'), { recursive: true });
console.log(await render(1080, 1350, join(root, 'public/og', `post-${key}-4x5.jpg`), { maxSize: 132, minSize: 84, colW: 860, subSize: 30, logoH: 92, gravity: g }));
console.log(await render(1200, 630, join(root, 'public/og', `post-${key}.jpg`), { maxSize: 100, minSize: 64, colW: 980, subSize: 24, logoH: 62, gravity: g }));
