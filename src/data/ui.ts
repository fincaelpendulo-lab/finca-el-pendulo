// Interface words in both languages: navigation, buttons and repeated labels.
// Page copy lives in each page view (src/views) and facts in the JSON files beside this one.
import type { Lang } from '../lib/i18n';

// Header menu. Items with `children` open a dropdown (a list below 1360px).
type NavLink = { path: string; es: string; en: string };
export const nav: (NavLink & { children?: NavLink[] })[] = [
  { path: '/', es: 'Inicio', en: 'Home' },
  { path: '/sobre-la-finca', es: 'Quiénes somos', en: 'About us', children: [
    { path: '/sobre-la-finca', es: 'Nuestra historia', en: 'Our story' },
    { path: '/voluntariado', es: 'Voluntariado', en: 'Volunteering' },
    { path: '/comunidad', es: 'Comunidad', en: 'Community' },
    { path: '/casos-de-exito', es: 'Casos de éxito', en: 'Success stories' },
    { path: '/blog', es: 'Blog', en: 'Blog' },
    { path: '/contacto', es: 'Contacto', en: 'Contact' },
  ] },
  { path: '/hospedaje', es: 'Hospedaje', en: 'Stay', children: [
    { path: '/hospedaje', es: 'Habitaciones', en: 'Rooms' },
    { path: '/day-pass', es: 'Day Pass', en: 'Day Pass' },
    { path: '/sesion-de-fotos', es: 'Sesión de fotos', en: 'Photo sessions' },
  ] },
  { path: '/retiros', es: 'Retiros', en: 'Retreats' },
  { path: '/experiencias', es: 'Experiencias', en: 'Experiences' },
  { path: '/espacios', es: 'Espacios', en: 'Spaces' },
  { path: '/eventos', es: 'Eventos', en: 'Events' },
  { path: '/galeria', es: 'Galería', en: 'Gallery' },
];

export const footerNav = [
  { title: { es: 'Visítanos', en: 'Visit' }, links: [
    { path: '/hospedaje', es: 'Hospedaje', en: 'Stay' },
    { path: '/day-pass', es: 'Day Pass', en: 'Day Pass' },
    { path: '/sesion-de-fotos', es: 'Sesión de fotos', en: 'Photo sessions' },
    { path: '/experiencias', es: 'Experiencias', en: 'Experiences' },
    { path: '/temazcal', es: 'Temazcal', en: 'Temazcal' },
    { path: '/espacios', es: 'Espacios', en: 'Spaces' },
    { path: '/galeria', es: 'Galería', en: 'Gallery' },
  ] },
  { title: { es: 'Organiza', en: 'Host' }, links: [
    { path: '/retiros', es: 'Retiros', en: 'Retreats' },
    { path: '/eventos', es: 'Eventos', en: 'Events' },
    { path: '/bodas', es: 'Bodas', en: 'Weddings' },
    { path: '/eventos#proximos', es: 'Próximos eventos', en: 'Upcoming events' },
  ] },
  { title: { es: 'Quiénes somos', en: 'About us' }, links: [
    { path: '/sobre-la-finca', es: 'Nuestra historia', en: 'Our story' },
    { path: '/comunidad', es: 'Comunidad', en: 'Community' },
    { path: '/voluntariado', es: 'Voluntariado', en: 'Volunteering' },
    { path: '/casos-de-exito', es: 'Casos de éxito', en: 'Success stories' },
    { path: '/blog', es: 'Blog', en: 'Blog' },
    { path: '/contacto', es: 'Contacto', en: 'Contact' },
  ] },
];

const words = {
  quote: { es: 'Cotiza tu retiro', en: 'Plan your retreat' },
  book: { es: 'Hospédate con nosotros', en: 'Book a stay' },
  bookShort: { es: 'Reservar', en: 'Book' },
  spaces: { es: 'Ver los espacios', en: 'See the spaces' },
  whatsapp: { es: 'Escríbenos por WhatsApp', en: 'Message us on WhatsApp' },
  directions: { es: 'Cómo llegar', en: 'Get directions' },
  location: { es: 'Ubicación', en: 'Location' },
  tagline: { es: 'Un espacio para crear experiencias con propósito.', en: 'A place to create experiences with purpose.' },
  rights: { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },
  cookies: { es: 'Cookies', en: 'Cookies' },
  home: { es: 'Finca El Péndulo, inicio', en: 'Finca El Péndulo, home' },
  menuOpen: { es: 'Abrir menú', en: 'Open menu' },
  menu: { es: 'Menú', en: 'Menu' },
  close: { es: 'Cerrar', en: 'Close' },
  contact: { es: 'Contacto', en: 'Contact' },
  main: { es: 'Principal', en: 'Main' },
  pause: { es: 'Pausar video', en: 'Pause video' },
} as const;

export const t = (key: keyof typeof words, lang: Lang): string => words[key][lang];
