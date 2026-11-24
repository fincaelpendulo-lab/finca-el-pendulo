// Blog posts: Markdown files in src/content/blog/<name>.<es|en>.md.
// Front matter: title, description, date (YYYY-MM-DD), image (a photo name), slug, pair (the other language's slug),
// og (optional: a social image in public/og/, made from scripts/og.json with `npm run icons`, or by scripts/blog/cover.mjs).
// Blog worker fields (optional): imageAlt, imageCredit, imageCreditUrl (stock photos), keyword, profile.
// Posts dated in the future are left out of the build: approved posts are merged ahead of time and go live on
// their date (.github/workflows/publish-scheduled-posts.yml pushes the rebuild that morning).
import type { Lang } from './i18n';
interface Frontmatter { title: string; description: string; date: string | Date; image: string; slug: string; pair?: string; og?: string; imageAlt?: string; imageCredit?: string; imageCreditUrl?: string; keyword?: string; profile?: string }
type Module = { frontmatter: Frontmatter; Content: any };
const files = import.meta.glob<Module>('/src/content/blog/*.md', { eager: true });
const iso = (d: unknown) => (d instanceof Date ? d.toISOString() : String(d)).slice(0, 10);
// Today in Guadalajara (UTC-6), so a post dated today is in the morning build.
// BLOG_PREVIEW=1 npm run build includes them, to check a draft compiles.
const today = (globalThis as any).process?.env?.BLOG_PREVIEW === '1' ? '9999-12-31' : new Date(Date.now() - 6 * 3600 * 1000).toISOString().slice(0, 10);
export const posts = (lang: Lang) => Object.entries(files)
  .filter(([f]) => f.endsWith(`.${lang}.md`))
  .map(([, m]) => ({ ...m.frontmatter, date: iso(m.frontmatter.date), Content: m.Content }))
  .filter((p) => p.date <= today)
  .sort((a, b) => b.date.localeCompare(a.date));
export const postPath = (lang: Lang, slug: string) => (lang === 'es' ? `/blog/${slug}` : `/en/blog/${slug}`);
