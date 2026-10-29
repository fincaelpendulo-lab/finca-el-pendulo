// Blog posts: Markdown files in src/content/blog/<name>.<es|en>.md.
// Front matter: title, description, date (YYYY-MM-DD), image (a photo name), slug, pair (the other language's slug).
import type { Lang } from './i18n';
interface Frontmatter { title: string; description: string; date: string | Date; image: string; slug: string; pair?: string }
type Module = { frontmatter: Frontmatter; Content: any };
const files = import.meta.glob<Module>('/src/content/blog/*.md', { eager: true });
const iso = (d: unknown) => (d instanceof Date ? d.toISOString() : String(d)).slice(0, 10);
export const posts = (lang: Lang) => Object.entries(files)
  .filter(([f]) => f.endsWith(`.${lang}.md`))
  .map(([, m]) => ({ ...m.frontmatter, date: iso(m.frontmatter.date), Content: m.Content }))
  .sort((a, b) => b.date.localeCompare(a.date));
export const postPath = (lang: Lang, slug: string) => (lang === 'es' ? `/blog/${slug}` : `/en/blog/${slug}`);
