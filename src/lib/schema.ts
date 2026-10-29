// JSON-LD for the Finca as a place (search results, maps). Facts come from site.json.
import site from '../data/site.json';
import type { Lang } from './i18n';

export function lodgingSchema(lang: Lang) {
  const a = site.address;
  return {
    '@type': 'LodgingBusiness',
    '@id': `${site.url}/#place`,
    name: site.name,
    url: `${site.url}/`,
    description: lang === 'es'
      ? 'Centro holístico en Tepatitlán de Morelos, Jalisco, para retiros, hospedaje en la naturaleza y experiencias de bienestar.'
      : 'Holistic centre in Tepatitlán de Morelos, Jalisco, for retreats, nature stays and wellbeing experiences.',
    image: `${site.url}/og/home.jpg`,
    telephone: site.whatsapp.display.replace(/\s/g, ''),
    email: site.email,
    address: { '@type': 'PostalAddress', streetAddress: a.street, postalCode: a.postalCode, addressLocality: a.locality, addressRegion: a.region, addressCountry: a.country },
    ...(site.geo.latitude ? { geo: { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude } } : {}),
    hasMap: site.maps,
    checkinTime: '14:00',
    checkoutTime: '12:00',
    parentOrganization: { '@id': `${site.url}/#organization` },
  };
}
