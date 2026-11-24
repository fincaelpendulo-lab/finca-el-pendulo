// Builds the records the blog review dashboard shows (dashboardUrl in blog/blog.config.json).
//
//   node scripts/blog/review-doc.mjs post <key> [--ref origin/blog/<key>]
//     Reads the ES and EN post and the social captions from a git ref (default: the post's PR branch) and writes
//     blog/.review/<key>.json (fields for posts/<key>) and blog/.review/<key>.jpg (the 4:5 social cover, for upload).
//   node scripts/blog/review-doc.mjs plan YYYY-MM
//     Writes blog/.review/plan-YYYY-MM/<key>.json for every planned post: the plan fields only, no status,
//     so it can be merged into existing records without touching their review state.
//
// Record fields: unsuffixed = Spanish (the Finca's main language), *En = English.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { root, postUrl, parse } from './config.mjs';

const out = join(root, 'blog/.review');
const git = (...a) => execFileSync('git', a, { cwd: root, maxBuffer: 64 * 1024 * 1024 });

const words = (s) => s.replace(/[#*_>`|[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
function countSources(body) {
  const i = body.search(/^## (Sources|Fuentes)\s*$/m);
  const urls = i < 0 ? [] : [...body.slice(i).matchAll(/\]\((https?:(?:[^()\s]|\([^()\s]*\))+)\)/g)].map((m) => m[1]);
  const academic = /doi\.org|pubmed|ncbi\.nlm\.nih\.gov|nature\.com|sciencedirect|springer|wiley|tandfonline|jamanetwork|thelancet|nejm|frontiersin|plos|bmj|sagepub|cambridge\.org|oup\.com|apa\.org|scielo|redalyc|unam\.mx|udg\.mx|inah\.gob|\.gob\.mx|\.gov\b|\.edu\b|who\.int/;
  const video = /youtube\.com|youtu\.be|vimeo\.com|ted\.com/;
  const books = /books\.google|penguinrandomhouse|planetadelibros|fondodeculturaeconomica|harpercollins|simonandschuster|macmillan|hachette|soundstrue|goodreads|openlibrary|worldcat|isbn/;
  const reviews = /google\.com\/maps|tripadvisor|booking\.com|airbnb/;
  const c = { academic: 0, books: 0, video: 0, testimonials: 0, media: 0, total: urls.length };
  for (const u of urls) c[academic.test(u) ? 'academic' : video.test(u) ? 'video' : books.test(u) ? 'books' : reviews.test(u) ? 'testimonials' : 'media']++;
  return c;
}

const [cmd, arg, ...rest] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

if (cmd === 'post') {
  const key = arg;
  try { git('fetch', '-q', 'origin'); } catch {}
  const ref = rest.includes('--ref') ? rest[rest.indexOf('--ref') + 1] : `origin/blog/${key}`;
  const es = parse(git('show', `${ref}:src/content/blog/${key}.es.md`).toString());
  const en = parse(git('show', `${ref}:src/content/blog/${key}.en.md`).toString());
  const social = JSON.parse(git('show', `${ref}:blog/social/${key}.json`).toString());
  writeFileSync(join(out, `${key}.jpg`), git('show', `${ref}:public/og/${es.data.og}-4x5.jpg`));
  const doc = {
    slug: key, slugEn: en.data.slug, date: es.data.date,
    title: es.data.title, titleEn: en.data.title,
    description: es.data.description, descriptionEn: en.data.description,
    keyword: es.data.keyword, keywordEn: en.data.keyword, profile: es.data.profile,
    image: es.data.image, imageAlt: es.data.imageAlt, imageCredit: es.data.imageCredit ?? '', imageCreditUrl: es.data.imageCreditUrl ?? '',
    bodyEs: es.body.trim(), bodyEn: en.body.trim(),
    words: { es: words(es.body), en: words(en.body) },
    sources: countSources(es.body),
    instagram: social.instagram, facebook: social.facebook,
    liveUrl: postUrl('es', key), liveUrlEn: postUrl('en', en.data.slug),
    commit: git('rev-parse', '--short', ref).toString().trim(),
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(join(out, `${key}.json`), JSON.stringify(doc, null, 2));
  console.log(`${join(out, `${key}.json`)}\n${join(out, `${key}.jpg`)}`);
} else if (cmd === 'plan') {
  const plan = JSON.parse(readFileSync(join(root, 'blog/plans', `${arg}.json`), 'utf8'));
  const dir = join(out, `plan-${arg}`);
  mkdirSync(dir, { recursive: true });
  for (const p of plan.posts) {
    const doc = { slug: p.slug, slugEn: p.slugEn, date: p.date, title: p.title, titleEn: p.titleEn, keyword: p.keyword,
      keywordEn: p.keywordEn, profile: p.profile, theme: p.theme, angle: p.angle, outline: p.outline };
    writeFileSync(join(dir, `${p.slug}.json`), JSON.stringify(doc, null, 2));
  }
  console.log(`${plan.posts.length} records in ${dir}`);
} else {
  console.log('Usage: review-doc.mjs post <key> [--ref <git ref>] | plan YYYY-MM');
}
