// Checks a new blog post (both languages), its covers and its social captions before it goes out for review.
//
//   node scripts/blog/check-post.mjs <key>        (key = the Spanish slug = the file name before .es.md)
//
// Errors (exit 1): missing fields, em dashes, too short, keyword missing from the opening, no Fuentes/Sources
// section, a source that does not load, broken internal links, missing photo, cover or translation, words the
// Finca never uses, missing or overlong social captions.
// For every DOI it prints the title Crossref has on record, and for every YouTube link the video title
// and channel, so the writer can confirm each source says what the post claims.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { root, config, postFile, parse } from './config.mjs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';
const errors = [];
const warnings = [];
const notes = [];

// Never in the blog or its captions (Carlos's rules for the Finca; see blog/house-facts.md).
const FORBIDDEN = [/ayahuasca/i, /kambo/i, /psilocib/i, /\bpeyote\b/i, /\bhongos (mágicos|sagrados)\b/i, /\bmedicina(s)? (sagrada|ancestral)e?s?\b/i, /mil ceremonias/i, /conoce más/i, /learn more/i, /\bruger\b/i];

const words = (s) => s.replace(/[#*_>`|[\]()]/g, ' ').split(/\s+/).filter(Boolean);
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();

const blogSlugs = { es: new Set(), en: new Set() };
for (const f of readdirSync(join(root, 'src/content/blog'))) {
  const m = f.match(/\.(es|en)\.md$/);
  if (m) { try { blogSlugs[m[1]].add(parse(readFileSync(join(root, 'src/content/blog', f), 'utf8')).data.slug); } catch {} }
}

function internalExists(path) {
  path = path.replace(/\/$/, '') || '/';
  if (['/', '/en', '/blog', '/en/blog'].includes(path)) return true;
  const blog = path.match(/^(\/en)?\/blog\/([^/]+)$/);
  if (blog) return blogSlugs[blog[1] ? 'en' : 'es'].has(blog[2]);
  const base = join(root, 'src/pages', path);
  return existsSync(`${base}.astro`) || existsSync(join(base, 'index.astro'));
}

function checkLang(lang, key) {
  const file = postFile(key, lang);
  if (!existsSync(file)) { errors.push(`${lang}: ${file} does not exist`); return null; }
  const text = readFileSync(file, 'utf8');
  const post = { ...parse(text), text };
  const d = post.data;
  const tag = `${key}.${lang}`;
  for (const k of ['title', 'description', 'date', 'image', 'imageAlt', 'keyword', 'profile', 'slug', 'pair', 'og']) {
    if (!d[k]) errors.push(`${tag}: frontmatter "${k}" is missing`);
  }
  if (d.image?.startsWith('stock-') && (!d.imageCredit || !d.imageCreditUrl)) errors.push(`${tag}: stock photo needs imageCredit and imageCreditUrl`);
  if (d.title && d.title.length > 65) warnings.push(`${tag}: title is ${d.title.length} characters (aim for 60 or less)`);
  if (d.description && (d.description.length < 120 || d.description.length > 160)) errors.push(`${tag}: description is ${d.description.length} characters (120 to 160)`);
  if (/[—–]/.test(text)) errors.push(`${tag}: contains em or en dashes; rewrite those sentences`);
  for (const re of FORBIDDEN) if (re.test(text)) errors.push(`${tag}: uses "${text.match(re)[0]}", which the Finca never says in the blog`);
  const count = words(post.body).length;
  if (count < 800) errors.push(`${tag}: ${count} words (minimum 800)`);
  else if (count < 1000) warnings.push(`${tag}: ${count} words; fine only if the question is fully answered`);
  if (count > 2600) warnings.push(`${tag}: ${count} words; check it is not padded`);

  const kw = d.keyword ? norm(d.keyword) : '';
  if (kw) {
    const opening = norm(words(post.body.split(/\n## /)[0]).slice(0, 150).join(' '));
    if (!norm(d.title || '').includes(kw)) warnings.push(`${tag}: keyword "${d.keyword}" is not in the title word for word`);
    if (!opening.includes(kw)) errors.push(`${tag}: keyword "${d.keyword}" is not in the first 150 words`);
    if (!norm(d.description || '').includes(kw)) warnings.push(`${tag}: keyword is not in the description`);
    const h2 = [...post.body.matchAll(/^## (.+)$/gm)].map((m) => norm(m[1]));
    if (!h2.some((h) => kw.split(' ').filter((w) => w.length > 3).every((w) => h.includes(w)))) warnings.push(`${tag}: no H2 contains the keyword's main words`);
  }
  const h2s = [...post.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  if (h2s.length < 4) errors.push(`${tag}: only ${h2s.length} H2 sections`);
  const faq = lang === 'es' ? /preguntas frecuentes/i : /frequently asked questions/i;
  if (!h2s.some((h) => faq.test(h))) warnings.push(`${tag}: no FAQ section`);

  const srcHead = lang === 'es' ? /^## Fuentes\s*$/m : /^## Sources\s*$/m;
  const srcIdx = post.body.search(srcHead);
  if (srcIdx < 0) errors.push(`${tag}: no "## ${lang === 'es' ? 'Fuentes' : 'Sources'}" section`);
  const sources = srcIdx < 0 ? [] : [...post.body.slice(srcIdx).matchAll(/\]\((https?:(?:[^()\s]|\([^()\s]*\))+)\)/g)].map((m) => m[1]);
  if (srcIdx >= 0 && sources.length < 4) errors.push(`${tag}: ${sources.length} sources (minimum 4)`);

  if (d.image && !existsSync(join(root, 'src/assets/photos', `${d.image}.jpg`))) errors.push(`${tag}: photo src/assets/photos/${d.image}.jpg is missing`);
  if (d.og) for (const f of [`${d.og}.jpg`, `${d.og}-4x5.jpg`]) if (!existsSync(join(root, 'public/og', f))) errors.push(`${tag}: cover public/og/${f} is missing (run cover.mjs)`);

  for (const m of post.body.matchAll(/\]\((\/[^)#\s]*)(#[^)]*)?\)/g)) {
    if (lang === 'en' && !m[1].startsWith('/en')) warnings.push(`${tag}: internal link ${m[1]} goes to a Spanish page`);
    if (lang === 'es' && m[1].startsWith('/en')) warnings.push(`${tag}: internal link ${m[1]} goes to an English page`);
    if (!internalExists(m[1])) errors.push(`${tag}: internal link ${m[1]} has no page`);
  }
  if (/\]\(\.\.?\//.test(post.body)) errors.push(`${tag}: use absolute internal links (/retiros, /en/retreats), not ../`);
  return { ...post, links: [...post.body.matchAll(/\]\((https?:(?:[^()\s]|\([^()\s]*\))+)\)/g)].map((m) => m[1]) };
}

function checkSocial(key) {
  const file = join(root, 'blog/social', `${key}.json`);
  if (!existsSync(file)) return errors.push(`blog/social/${key}.json is missing (Instagram and Facebook captions)`);
  const s = JSON.parse(readFileSync(file, 'utf8'));
  for (const net of ['instagram', 'facebook']) {
    const t = s[net];
    if (!t) { errors.push(`social: "${net}" caption is missing`); continue; }
    if (/[—–]/.test(t)) errors.push(`social ${net}: contains em or en dashes`);
    for (const re of FORBIDDEN) if (re.test(t)) errors.push(`social ${net}: uses "${t.match(re)[0]}"`);
    const n = words(t).length;
    if (n < 30 || n > 140) warnings.push(`social ${net}: ${n} words (aim for 40 to 110)`);
    const tags = (t.match(/#\w+/g) || []).length;
    if (tags > 5) errors.push(`social ${net}: ${tags} hashtags (5 at most)`);
  }
  if (s.facebook && !/fincaelpendulo\.com\.mx\/blog\//.test(s.facebook)) errors.push('social facebook: needs the post link (https://fincaelpendulo.com.mx/blog/<slug>)');
}

async function fetchOk(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html,application/pdf,*/*' }, signal: AbortSignal.timeout(20000) });
      if (res.status < 400) return { ok: true, status: res.status };
      if (method === 'GET') return { ok: false, status: res.status };
    } catch (e) { if (method === 'GET') return { ok: false, status: e.name === 'TimeoutError' ? 'timeout' : e.message }; }
  }
}

async function verify(url) {
  const doi = url.match(/doi\.org\/(10\.[^\s?#]+)/i)?.[1];
  if (doi) {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, { headers: { 'User-Agent': `blog-checker/1.0 (mailto:${config.contactEmail})` } });
    if (!res.ok) return errors.push(`DOI not found in Crossref (rerun once; Crossref fails at times): ${url}`);
    const w = (await res.json()).message;
    return notes.push(`DOI ${doi}: "${w.title?.[0]}" (${w['container-title']?.[0] ?? ''}, ${w.issued?.['date-parts']?.[0]?.[0] ?? '?'})`);
  }
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`);
    if (!res.ok) return errors.push(`YouTube video not available: ${url}`);
    const v = await res.json();
    return notes.push(`YouTube: "${v.title}" by ${v.author_name}`);
  }
  const pmid = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/)?.[1];
  if (pmid) {
    const res = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${pmid}`);
    const r = res.ok ? (await res.json()).result?.[pmid] : null;
    if (!r || r.error) return errors.push(`PubMed ID not found: ${url}`);
    return notes.push(`PubMed ${pmid}: "${r.title}" (${r.source}, ${r.pubdate})`);
  }
  const r = await fetchOk(url);
  if (!r.ok) (r.status === 403 || r.status === 429 ? warnings : errors).push(`Link returned ${r.status}: ${url}${r.status === 403 || r.status === 429 ? ' (blocked for scripts; confirm the page with WebFetch)' : ''}`);
}

const key = process.argv[2];
if (!key) { console.log('Usage: node scripts/blog/check-post.mjs <key (Spanish slug)>'); process.exit(2); }
const es = checkLang('es', key);
const en = checkLang('en', key);
if (es && es.data.slug !== key) errors.push(`${key}.es: slug should be "${key}" (the file name)`);
if (es && en) {
  if (es.data.pair !== en.data.slug) errors.push(`${key}.es: pair should be "${en.data.slug}"`);
  if (en.data.pair !== es.data.slug) errors.push(`${key}.en: pair should be "${es.data.slug}"`);
  if (es.data.image !== en.data.image) warnings.push('Spanish and English posts use different photos');
  if (es.data.date !== en.data.date) errors.push('Spanish and English posts have different dates');
  if (es.data.og !== `post-${key}` || en.data.og !== `post-${key}`) errors.push(`og should be "post-${key}" in both posts`);
}
checkSocial(key);

const urls = [...new Set([...(es?.links ?? []), ...(en?.links ?? [])])].filter((u) => !u.startsWith(config.siteUrl));
for (let i = 0; i < urls.length; i += 6) await Promise.all(urls.slice(i, i + 6).map(verify));

for (const n of notes) console.log(`  source  ${n}`);
for (const w of warnings) console.log(`  warn    ${w}`);
for (const e of errors) console.log(`  ERROR   ${e}`);
console.log(errors.length ? `\n${errors.length} error(s). Fix them and run again.` : `\nOK: ${urls.length} external links checked, ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
