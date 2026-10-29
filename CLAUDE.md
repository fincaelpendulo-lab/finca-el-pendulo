# Finca El Péndulo: sitio web

Sitio de Finca El Péndulo (Tepatitlán de Morelos, Jalisco). Astro estático, español principal en `/` e inglés en `/en`, formularios por un Cloudflare Worker hacia GoHighLevel, despliegue en Hostinger con vista previa en GitHub Pages. Hecho con la skill `website-builder`.

## Dónde se edita cada cosa
| Qué | Dónde |
| --- | --- |
| Datos de contacto, dirección, Cloudbeds, WhatsApp, GA4, Turnstile, Worker | `src/data/site.json` |
| Espacios (textos ES/EN, foto, galería) | `src/data/espacios.json` |
| Hospedaje (10 tipos de habitación, textos de Cloudbeds, fotos `hab-<tipo>-N`) | `src/data/hospedaje.json` |
| Precios del cotizador, pagos, qué incluye el retiro | `src/data/retiros.json` |
| Experiencias (Bienestar, Naturaleza, Creatividad) | `src/data/experiencias.json` |
| Eventos (cada uno con su página: campamentos, conciertos, cenas, festivales) | `src/data/eventos.json` + `src/views/EventoDetalle.astro` |
| Próximos eventos (fecha, título, tipo; se ocultan solos al pasar) | `src/data/proximos.json` |
| Equipo (Comunidad) | `src/data/equipo.json` |
| Blog | `src/content/blog/<nombre>.<es|en>.md` (title, description, date, image, slug, pair) |
| Newsletter (pop-up una vez por visita y franja sobre el pie) | `NewsletterForm.astro`, `[data-newsletter]` en `site.js`; sin Worker abre WhatsApp |
| Testimonios | `src/data/testimonios.json` |
| Menú, pie de página, textos de botones | `src/data/ui.ts` |
| Texto de cada página (ES y EN en el mismo archivo) | `src/views/*.astro` |
| Rutas en inglés | `src/lib/i18n.ts` (`enRoutes`) |
| Fotos | `src/assets/photos/<nombre>.jpg` (máx. 1800 px), se usan por nombre con `<Photo name="...">` |
| Videos aéreos y sus pósters | `public/video/` |
| Logos y símbolos | `src/assets/brand/`, `brand-src/` (para `npm run icons`) |
| Colores, tipografía, espacios | `design-system/tokens.json` → `npm run tokens` → `src/styles/tokens.css` |
| Componentes (Hero, ColorSplit, SpaceCard…) | `src/components/`, estilos en `src/styles/components.css` (copiados del sistema de diseño) |
| Redirecciones, dominio .com, encabezados | `public/.htaccess` |
| Formularios a WhatsApp (Temazcal, Day Pass, Sesión de fotos) | `ContactForm.astro` sin `crm` + `[data-wa-form]` en `site.js` |
| Formularios al CRM (Retiros, Eventos y sus páginas, Bodas, Contacto) | `ContactForm.astro` con `crm="retiro|evento|boda|contacto"` + `[data-crm-form]` en `site.js`; piden correo y WhatsApp |
| Aplicación de voluntariado (en el sitio, al CRM) | `VolunteerForm.astro` |
| Formularios → GHL (pendiente de conectar) | `worker/src/index.js`: `FORMS` (etiqueta que dispara cada workflow: `web-retiro`, `web-evento`, `web-boda`, `web-contacto`, `web-voluntariado`), `FIELDS` (campos personalizados), newsletter → `/subscribe`, etiqueta `newsletter`. Mientras `formEndpoint` esté vacío, los formularios CRM y el newsletter abren WhatsApp. |
| Descripción (alt y título) de cada foto de la galería | `src/data/fotos.json` |
| Página de gracias tras formularios CRM (`?f=<form>` elige el mensaje; noindex, fuera del sitemap) | `src/views/Gracias.astro` |
| Calificación de Google (actualizar a mano) | `src/data/site.json` → `reviews`; reseñas elegidas en `src/data/resenas-google.json` |
| Day Pass y Sesión de fotos (precios, incluye) | `src/data/visitas.json` |
| Reglamento (página /reglamento, enlazado en el pie) | `src/data/reglamento.json` |
| Experiencias: cada actividad con foto y texto | `src/data/experiencias.json` → `details` |

## Sistema de diseño
Estructura copiada de mexisol.world (repo `~/Developer/mexisol-world`), con colores y tipografía de la Finca. Paleta original: artifact "Finca El Péndulo" (https://claude.ai/artifact/G2vzGi4hYHYdoYNEnThXQN), copia en `design-system/`. Estilos en `src/styles/global.css` (roles `--surface`, `--surface-deep` = agave-oscuro, `--label-ink` = ground, `--photo-overlay`).
- Encabezado blanco fijo, enlaces en mayúsculas con submenús (`nav` en `ui.ts`), EN/ES y "Reservar"; debajo de 1360 px, botón "Menú" con panel a pantalla completa.
- Etiquetas en mayúsculas espaciadas (`.label`), titulares en Newsreader tipo oración, texto en Tenor Sans.
- Piezas: `Hero` (HeroSplit: video + tarjeta + 2 fotos), `PageHeader` (banda de foto con velo verde), `ColorSplit` (GuideSplit: texto + foto a sangre), `SpaceCard` (foto, etiqueta, título, texto gris), `.tile`, `.photo-row`, `.deep` (panel agave-oscuro), `.rule-list`, `.faq`, `.card`.
- Fondo blanco, `arena` para alternar; nunca dos bloques del mismo color juntos. Esquinas rectas, sin sombras, sin emojis. El mosaico (`TileBand`) va solo sobre el pie.
- Menú (una sola fila desde 1360 px): Inicio, Quiénes somos (Nuestra historia, Voluntariado, Comunidad, Casos de éxito, Blog, Contacto), Hospedaje (Habitaciones, Day Pass, Sesión de fotos), Retiros, Experiencias, Espacios, Eventos, Galería. Experiencias y Eventos no despliegan.
- Inicio: hero, franja de fotos animada, Quiénes somos, Retiros/Eventos/Bodas, Hospedaje compacto, Experiencias, luego espacios, próximos eventos, casos de éxito, opiniones, blog, preguntas, ubicación.
- Retiros: el paquete incluye hospedaje, 3 alimentos, coffee break y uso de espacios; sin tarifas publicadas. No mencionar "mil ceremonias". Estancias largas se eliminó.
- Enlaces externos abren en otra pestaña (site.js). Botón flotante de WhatsApp en todas las páginas.
- Botones con verbos concretos: "Cotiza tu retiro", "Hospédate con nosotros", "Ver los espacios". Nunca "Conoce más".
- Animación (pedida por Carlos): secciones y tarjetas suben con un fundido al entrar en pantalla (`.reveal` en site.js), el hero entra al cargar, fotos hacen zoom suave al pasar el cursor. Todo se desactiva con movimiento reducido.
- Visor de fotos: `LightboxPhoto.astro` (grupo por `group`), lo usan Espacios (foto principal + miniaturas debajo) y Galería.
- Galería: todas las fotos menos las habitaciones (`hab-*`); descripción y título de cada foto en `src/data/fotos.json`.
- Hero del inicio: video aéreo a todo lo ancho con la tarjeta encima (sin miniaturas).

## Voz de marca
PENDIENTE: Carlos enviará la guía de voz. Mientras tanto: cálida, serena, concreta; habla de "la Finca"; tutea en español.

## Fotos
- Solo fotos de la carpeta de Carlos en buena calidad (mín. ~1400 px de lado largo). Las que solo existen a 1024 px (habitaciones, fotos históricas, Gaia, Hormiguero) se escalaron 1.5x con nitidez.
- Nunca la misma foto dos veces en una sección, ni dos nombres para la misma imagen. El hero y la tira animada del inicio no comparten fotos.
- Alberca: `alberca-01`, `alberca-02`, `alberca-03`, `alberca-04-vertical`, `alberca-mural`.
- Osho Hut: `esp-osho-hut-1` (interior), `osho-hut-sala`, `esp-osho-hut-3` (exterior), `osho-hut-arcoiris`.
- Terraza Ambú: `esp-terraza-ambu-1..3`, `terraza-ambu-noche`, `terraza-ambu-fuente`, `cena-candiles`. Ágora Gnosis: `esp-agora-gnosis-1/2`. El 27: `invernadero-mesa`, `esp-el-27-3`. Atrio del maestro: `atrio-flores`, `atrio-meditacion`, `atrio-grupo`.
- El 27 (invernadero con mesa larga) no es el Invernadero Gaia.
- Pedir permiso antes de usar en anuncios fotos donde se reconozca a alguien.
- Selección de Carlos: disco "FINCA EL PENDULO/Selección de fotos" (generales + `Hospedaje/` por tipo de habitación).

## Personas que se pueden nombrar
Marina Melgarejo (fundadora) y los autores de los testimonios (Carlos Obregón, Alma Rosa Ortega, Li Sáenz Urgell). A nadie más sin confirmación.

## Comandos
`npm run dev` · `npm run build` · `npm run links` · `npm run lint` · `npm run icons` · `npm run tokens`
