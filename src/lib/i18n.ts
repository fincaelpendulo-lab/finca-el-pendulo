// Spanish is the main language (at the root); English lives under /en.
// Every Spanish page with an English twin is listed here: ES path -> EN path.
export type Lang = 'es' | 'en';

export const enRoutes: Record<string, string> = {
  '/': '/en',
  '/sobre-la-finca': '/en/about',
  '/espacios': '/en/spaces',
  '/hospedaje': '/en/stay',
  '/retiros': '/en/retreats',
  '/experiencias': '/en/experiences',
  '/eventos': '/en/events',
  '/comunidad': '/en/community',
  '/voluntariado': '/en/volunteer',
  '/contacto': '/en/contact',
  '/aviso-de-privacidad': '/en/privacy',
  '/bodas': '/en/weddings',
  '/temazcal': '/en/temazcal',
  '/galeria': '/en/gallery',
  '/casos-de-exito': '/en/success-stories',
  '/blog': '/en/blog',
  '/campamentos': '/en/camps',
  '/conciertos': '/en/concerts',
  '/cenas-romanticas': '/en/romantic-dinners',
  '/festivales': '/en/festivals',
  '/day-pass': '/en/day-pass',
  '/sesion-de-fotos': '/en/photo-sessions',
  '/reglamento': '/en/house-rules',
  '/gracias': '/en/thank-you',
};
const esRoutes = Object.fromEntries(Object.entries(enRoutes).map(([es, en]) => [en, es]));

/** The path of a page in the given language (pass the Spanish path), keeping ?query and #hash. */
export function localize(path: string, lang: Lang): string {
  if (lang === 'es' || /^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const [p, hash] = path.split('#');
  const [clean, query] = p.split('?');
  const en = enRoutes[clean || '/'] ?? clean;
  return `${en}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}

/** The Spanish and English versions of a page, or null where one does not exist. */
export function counterparts(path: string, lang: Lang): { es: string | null; en: string | null } {
  if (lang === 'es') return { es: path, en: enRoutes[path] ?? null };
  return { es: esRoutes[path] ?? null, en: path };
}

/** Language from the URL, for shared components: pageLang(Astro.url.pathname). */
export const pageLang = (pathname: string): Lang => (/^(\/[^/]+)?\/en(\/|$)/.test(pathname) ? 'en' : 'es');

/** Pick the string for the current language from a { es, en } pair. */
export const tr = <T,>(v: { es: T; en: T } | T, lang: Lang): T =>
  v && typeof v === 'object' && 'es' in (v as object) ? (v as { es: T; en: T })[lang] : (v as T);
