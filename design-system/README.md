# Finca El Péndulo

Manual de identidad corporativa de Finca El Péndulo, centro de desarrollo integral en Tepatitlán de Morelos, Jalisco. Este sistema reúne los colores, la tipografía, los símbolos y los patrones de la marca para cualquier pieza: impresos, documentos, redes y web.

Desde el 29 de octubre de 2026 el sistema sigue al sitio **fincaelpendulo.com.mx**: los tokens, los componentes y sus estilos son los mismos que usa la web (estructura de MexiSol World con los colores y la tipografía de la Finca). Si cambias algo aquí, cámbialo también en el sitio (`design-system/tokens.json` y `src/styles/global.css`), y al revés.

## ¿Quiénes somos?

Somos una comunidad divergente que nace de encuentros sincrónicos con un objetivo en común, el descubrir, observar y experimentar los ires y venires de la vida.

**“FINCA EL PÉNDULO”** surge en 2015 y se ha ido conformando con la suma de opiniones y contribuciones de la comunidad que lo conforma.

## Visión

Contribuir al bienestar de una sociedad, mediante la transformación individual utilizando las herramientas adecuadas para su desarrollo integral.

## Misión

Ser un centro de desarrollo integral que promueva el arte, el buen vivir y la consciencia.

## Nuestros valores

Valoramos y respetamos la individualidad, el pensamiento divergente y la independencia del individuo reconociéndolo como responsable de su propia transformación.

## La Finca

Lo que dice fincaelpendulo.com.mx, para usar con las mismas palabras en cualquier pieza.

- **Promesa:** "Un espacio para crear experiencias con propósito".
- **Quiénes somos:** "Una comunidad holística". Un centro holístico en Tepatitlán de Morelos, Jalisco, que combina alojamiento, espacios para actividades, servicios holísticos y contacto con la naturaleza para favorecer el descanso, la claridad mental y el crecimiento personal. Una comunidad autosustentable que mantiene el lugar como un refugio accesible.
- **Espacios:** "Un lugar que acompaña tu proceso". Cuatro hectáreas y más de 15 espacios: Osho Hut, Oráculo, Salón Ágora Gnosis, Sammasati, Terraza Ambú, Taller de arte, Lago, Caballerizas, Temazcal, Alberca, Gimnasio, Spa, El 27, Invernadero Gaia, Lobos, Hormiguero y Jardín de Rosas.
- **Osho Hut:** edificio circular de piedra, con techo de palma y piso de mármol; el espacio más sagrado de la Finca.
- **Hospedaje:** diez tipos de habitación en Cloudbeds: penthouse y habitaciones deluxe con jacuzzi, habitaciones privadas, contenedores, aldeas, la Cabaña Burra y el Hormiguero para grupos. También **Day Pass** (un día en la Finca) y **Sesión de fotos**.
- **Experiencias**, en tres familias: Bienestar ("Prácticas que invitan a la calma, la introspección y la conexión con el cuerpo"), Naturaleza ("Experiencias que conectan con el entorno y el ritmo natural de la finca") y Creatividad ("Espacios para explorar, crear y expresarse desde lo tangible").
- **Retiros:** "Diseñado para facilitadores que buscan un lugar natural, funcional y con comunidad". El paquete incluye hospedaje, 3 alimentos, coffee break y uso de los espacios. No se publican tarifas: se cotiza.
- **Espacios incluidos:** "Los espacios están incluidos cuando reservas tu retiro o te hospedas".
- **Eventos:** bodas, campamentos, conciertos, cenas románticas (menú de tres tiempos con jarra de clericot, $600 por persona) y festivales, cada uno con su página.
- **Ubicación:** Camino al Saucillo 861, Tepatitlán, Jalisco.

## Colores corporativos

El color define un escenario de valores emocionales concretos que debemos considerar en su aplicación a cualquier soporte de comunicación.

Los colores principales del logotipo **“FINCA EL PÉNDULO”** son el PANTONE P-50-15 U, P-33-15 U, P-25-13 U y P-5763 U. Utiliza también como colores secundarios la escala de grises PANTONE P-169-16 U y P-179-6 U, además de una variante de color en el PANTONE BLACK C.

### Principales

Cada color nace de un elemento del paisaje de la finca.

| Token | Nombre | Inspiración | PANTONE | CMYK | RGB | HEX |
|---|---|---|---|---|---|---|
| `ground` | Ground | Tierra roja del camino | P-50-15 U | 0 / 83 / 77 / 51 | 139 / 45 / 30 | #8B2D1E |
| `wood` | Wood | Leña y troncos | P-33-15 U | 40 / 55 / 61 / 52 | 103 / 76 / 61 | #674C3D |
| `corn` | Corn | Hoja de maíz | P-25-13 U | 0 / 42 / 74 / 26 | 195 / 135 / 65 | #C38741 impreso, #B98A5B en pantalla |
| `agave` | Agave | Penca de agave | P-5763 U | 50.55 / 33.72 / 55.2 / 18.46 | 128 / 134 / 109 | #80866D |

### Secundarios

| Token | PANTONE | CMYK | RGB | HEX |
|---|---|---|---|---|
| `gris-oscuro` | P-169-16 U | 43 / 36 / 41 / 60 | 87 / 85 / 79 | #57554F |
| `gris-claro` | P-179-6 U | 0 / 0 / 0 / 40 | 178 / 178 / 177 | #B2B2B1 |
| `negro` | BLACK C (variante) | 65.22 / 60.67 / 61.58 / 74 | ver nota | #2E2A25 |

> **Nota:** el manual da para BLACK C un RGB de 157 / 156 / 156, que es un gris claro y no coincide con la muestra impresa (casi negra). Por ahora `negro` usa el color de la muestra; falta confirmar el valor oficial.

> **Corn en pantalla:** el RGB del manual (#C38741) es más saturado que Ground, Wood y Agave, y en pantalla brillaba más que ellos. Para web y redes se usa #B98A5B: el mismo tono, un poco más apagado, para que conviva con los otros tres. En impresión sigue el PANTONE P-25-13 U.

### Uso y contraste

- En el sitio el texto va en `negro` (`tinta`, 14.3:1) sobre `cal` y `arena`; el texto secundario en `tinta-suave` (negro al 68 %, 5.1:1). `wood` queda para bloques y piezas impresas.
- Las etiquetas en MAYÚSCULAS van en `ground` (8.4:1); sobre bloques oscuros, en `corn`, y sobre `ground` o `wood`, en `etiqueta-sobre-ground`.
- `corn` (3.2:1) y `agave` (3.8:1) solo se usan en texto de 24px o más, en filetes, estrellas o como fondo.
- Sobre `ground`, `wood`, `agave-oscuro`, `negro` o fotos con velo, el texto va en blanco.
- Filetes de 1px en `filete` (negro al 22 %). `gris-claro` y `linea` quedan para piezas impresas, nunca para texto.
- La referencia visual de inspiración está en el grupo **Referencias** (`paleta-inspiracion.png`).

## Tipografía

Dos familias, las mismas que en MexiSol World para el texto, con una serif editorial propia para los titulares.

- **Newsreader** (`display`), peso 400: titulares, títulos de sección, nombres de espacios, fechas y cifras. Tipo oración ("Un lugar que acompaña tu proceso"). Es variable con tamaño óptico.
- **Tenor Sans** (`text`): todo lo que se lee: entradas, texto corrido, botones, menú, notas. Tiene un solo peso; no se usa negrita (el `<strong>` solo oscurece el color).
- **Etiquetas en MAYÚSCULAS espaciadas** (`label`): 13px, espaciado 0.32em, en `ground`, encima de los títulos de sección. En tarjetas, fechas y campos van más juntas (`label--tight`, 0.1em). El menú (`nav`) y los botones chicos también van en MAYÚSCULAS con 0.1em.
- **Escala del sitio** (escritorio → móvil): `display` 88 → 54px, `headline` 60 → 40, `heading` 48 → 36, `title` 28 → 24, `lead` 24 → 20, `body` 17px con interlineado 1.65, `button` 15, `caption` 14, `label` y `nav` 13.
- Líneas de texto de 68 caracteres como máximo (`.prose`); entradas de 46.
- El nombre FINCA EL PÉNDULO dentro del logotipo y del sello está dibujado como parte de la marca; no se recompone con estas fuentes.

## Logotipo

El logotipo es el símbolo de Marina dentro de un arco abierto, con el nombre FINCA EL PÉNDULO en arco debajo. Usa solo los archivos del grupo **Logos**: no se redibuja, no se recolorea y el nombre no se recompone con otra fuente.

| Archivo | Versión | Cuándo |
|---|---|---|
| `logo-color.png` | Logotipo a color: arco `corn`, luna `ground`, trazo y nombre `wood` | Versión principal, sobre `papel` |
| `logo-color-transparente.png` | La misma versión a color, sin fondo | Web y piezas sobre `cal` o `arena` |
| `logo-negro.png` | Logotipo a una tinta, negro | Impresión a una tinta, sellos, documentos en blanco y negro |
| `simbolo-negro.png` | Símbolo sin nombre, negro | Espacios pequeños, avatares, marcas de agua sobre fondos claros |
| `simbolo-blanco.png` | Símbolo sin nombre, blanco | Sobre `ground`, `wood`, `negro` o fotografía oscura |

- Fondo claro: logotipo a color o negro. Fondo oscuro o foto: símbolo blanco.
- El símbolo solo (sin nombre) es para cuando el nombre ya aparece cerca o el espacio es muy chico.

## Elementos auxiliares permitidos

Las Lunas y el símbolo de Marina como ícono podrá ser usado como elemento auxiliar para las aplicaciones que sean necesarias de la marca **“FINCA EL PÉNDULO”**.

- **Las Lunas** (`assets/Simbolos/lunas.png`): tres lunas entrelazadas en `ground`, `wood` y `corn` dentro de un círculo `agave`.
- **Símbolo de Marina** (`assets/Simbolos/simbolo-marina.png`): trazo en `wood` con una luna creciente en `ground`.

## Patrón mosaico

Una retícula de teselas cuadradas en los cuatro colores principales, con separación blanca entre ellas, que se repite en diagonal. Sobre el mosaico puede ir el sello: el símbolo de Marina dentro de un círculo blanco con filete `corn` y el nombre **FINCA EL PÉNDULO** en una cinta. Ver `assets/Patrones/patron-mosaico.png`.

## Composición: fotos, color sólido y nada más

La Finca se cuenta con imágenes. Cada vista es casi toda fotografía real y bloques de color plano; el texto es poco y grande. La estructura es la de MexiSol World.

- **Fondo blanco** (`cal`); `arena` para alternar secciones. Nunca dos bloques del mismo color seguidos.
- **Fotos a sangre** en el hero, los encabezados de página y las secciones `ColorSplit`, sin marcos ni filtros. Con texto encima llevan `velo-foto` y un degradado desde abajo; el texto va pegado al borde inferior.
- **Bloques sólidos** en `agave-oscuro` (el más usado: pie de página, `ColorSplit`, `StatementBand`), `wood`, `ground` y `arena`. Texto blanco sobre los oscuros.
- **Esquinas rectas** en todo (`radius-none`). La única pieza redonda es el botón de WhatsApp.
- **Sin sombras.** La profundidad la dan las fotos, el color y los filetes de 1px (`filete`). Las listas empiezan con un filete `negro` y separan filas con `filete`.
- **Separación de 12px** entre fotos en mosaicos, filas de fotos y tarjetas; a ras cuando una foto y un bloque forman una sola sección.
- **Contenedor** de 1200px (`content-max`) con margen lateral `clamp(20px, 4vw, 48px)`; secciones con 96px arriba y abajo (64px en móvil).
- **El mosaico** (`TileBand`) aparece una sola vez: encima del pie de página.
- Sin degradados decorativos, sin brillos, sin bordes de color a un lado, sin emojis.

## Movimiento

El sitio se mueve poco y despacio. Todo se desactiva con "reducir movimiento".

- **Al entrar en pantalla**, las secciones y tarjetas suben 28px con un fundido (0.9 s), escalonadas. Lo que es más alto que la pantalla no se anima.
- **Al cargar**, la tarjeta del hero y los títulos de los encabezados de página suben con un fundido (1 s).
- **Al pasar el cursor**, las fotos crecen un poco (3 % en tarjetas, 5 % en galerías) y los títulos de tarjeta se subrayan.
- **La franja de fotos** del inicio (`GalleryMarquee`) avanza sola y se detiene al pasar el cursor.
- **Los videos aéreos** se reproducen en silencio y en bucle, siempre con botón de pausa.

## Fotografía

Los grupos **Paisaje**, **Espacios**, **Hospedaje**, **Bienestar**, **Animales** y **Detalles** reúnen fotos de la Finca. En el sitio están en `src/assets/photos/` (1800px máximo; la web sirve AVIF y WebP). El README de cada grupo dice para qué sirve cada foto.

- Solo fotos de la selección de Carlos en buena calidad (mínimo ~1400px de lado largo). Las que solo existen a 1024px (habitaciones, fotos históricas) se escalaron 1.5x con nitidez.
- **Nunca la misma foto dos veces en una sección**, ni la misma imagen con dos nombres. El hero y la franja animada del inicio no comparten fotos.
- Hero del inicio: video aéreo `aerea-agaves-cabanas` a todo lo ancho. Espacios, Retiros y Experiencias abren con su propio video aéreo (grupo **Aereas**).
- Cada espacio con sus fotos reales. Alberca: `alberca-01` a `alberca-04` y `alberca-mural`. El 27 (el invernadero con mesa larga; no es el Invernadero Gaia): `invernadero-mesa` y `el-27-*`. Osho Hut: exterior, interior (`osho-hut-sala`) y `osho-hut-arcoiris`.
- Galería: todas las fotos menos las habitaciones; cada una con descripción (`alt`) y título.
- Luz natural, colores cálidos. Antes de usar en anuncios una foto donde se reconozca a una persona, pide su permiso.

## Dirección de diseño

- **Un solo elemento memorable: el mosaico.** Las teselas del manual (`TileBand`, la portada) son la firma. Todo lo demás es callado: fotos reales, bloques de color plano y texto.
- **Las fotos hacen el trabajo.** Ninguna sección se arma con tarjetas iguales con sombra.
- **La estructura informa.** Números solo en secuencias reales ("01 / Bienestar"). Etiquetas solo cuando dicen algo.
- **Las palabras dicen qué pasa.** "Cotiza tu retiro", "Ver los espacios", "Hospédate con nosotros", "Reservar"; **nunca "Conoce más"**. La misma acción conserva el mismo nombre en todo el sitio.
- **Solo datos confirmados.** No se menciona "mil ceremonias" ni se nombra a nadie del equipo sin confirmación (se puede nombrar a Marina Melgarejo, fundadora, y a los autores de los testimonios).
- **Antes de publicar, quita un accesorio.** Si una sección tiene etiqueta, título, entrada, dos botones y una insignia, sobra algo.

## Voz

Pendiente la guía de voz de la Finca. Mientras tanto: cálida, serena y concreta; se habla de "la Finca" y se tutea en español. El sitio también está en inglés (`/en`), con las mismas reglas.

## El sitio web

- **Encabezado** (`SiteHeader`): blanco y fijo arriba, logotipo, menú en MAYÚSCULAS, EN/ES y "Reservar" (Cloudbeds). Menú: Inicio · Quiénes somos (Nuestra historia, Voluntariado, Comunidad, Casos de éxito, Blog, Contacto) · Hospedaje (Habitaciones, Day Pass, Sesión de fotos) · Retiros · Experiencias · Espacios · Eventos · Galería. Debajo de 1360px, botón "Menú" con panel a pantalla completa.
- **Inicio**, en orden: `Hero` (video) → `GalleryMarquee` → Quiénes somos (`ColorSplit`) → Retiros, Eventos y Bodas (`PhotoTile`) → Hospedaje → Day Pass y Sesión de fotos → `ExperienceColumns` → espacios (`SpaceCard`) → `UpcomingEvents` → casos de éxito → `GoogleRating` → blog → `Faq` → ubicación → `NewsletterBanner` → `TileBand` → `SiteFooter`.
- **Páginas interiores** abren con `PageHeader` y terminan igual que el inicio (newsletter, mosaico, pie).
- **Espacios:** cada espacio con su foto principal, miniaturas debajo y el visor (`PhotoGallery`).
- **Formularios:** Retiros, Eventos (y cada evento), Bodas, Contacto y Voluntariado van al CRM (GoHighLevel) con la casilla de Cloudflare Turnstile y llevan a la página de gracias; Temazcal, Day Pass y Sesión de fotos abren WhatsApp con las respuestas. El newsletter (franja y pop-up una vez por visita) también va al CRM.
- **Siempre presentes:** botón flotante de WhatsApp (`WhatsAppFloat`), aviso de cookies (`CookieBanner`) y, en el pie, Reglamento y Aviso de privacidad. Los enlaces externos abren en otra pestaña.

## Calidad y accesibilidad

- **Contraste:** texto normal 4.5:1 o más; texto de 24px o más y bordes de control 3:1.
- **Tamaño mínimo de texto:** 13px (etiquetas y menú).
- **Áreas táctiles:** 44px como mínimo; botones de 48px.
- **Foco visible:** anillo `foco` de 2px (blanco sobre bloques oscuros y fotos).
- **Texto alternativo:** toda foto con contenido lleva `alt` que describe el lugar real; logotipos y adornos van con `alt` vacío.
- **Rendimiento:** fotos en AVIF y WebP con carga diferida; videos con póster.
- **Responsive:** sin scroll horizontal a 375px; revisado a 375, 768, 1024 y 1440px. En móvil las secciones de foto y texto se apilan con la foto arriba.

## Componentes

Carga `tokens.css`, `components/bundle.css` y `components/bundle.js` (después de React 18). Todo está en `window.FincaElPendulo`. Son los mismos componentes del sitio (Astro), con las mismas clases.

- **Navegación:** `SiteHeader`, `SiteFooter`.
- **Secciones:** `Hero`, `PageHeader`, `GalleryMarquee`, `ColorSplit`, `StatementBand`, `FactStrip`.
- **Contenido:** `SectionHeader`, `SpaceCard`, `PhotoTile`, `ExperienceColumns`, `PhotoMosaic`, `PhotoGallery`, `UpcomingEvents`, `GoogleRating`, `Faq`.
- **Acciones y formularios:** `Button`, `Field`, `NewsletterBanner`.
- **Marca:** `TileBand`.
- **Avisos:** `CookieBanner`, `WhatsAppFloat`.

Se retiraron porque el sitio no los usa: `BookingBar` (la barra de reserva fija en móvil; "Reservar" está en el encabezado y WhatsApp flota), `DateList` (lo reemplaza `UpcomingEvents`), `DaySchedule`, `QuoteSummary` (los retiros no publican tarifas) y `Badge`.

## Pendientes

- Guía de voz de la Finca.
- Logotipo: versión en blanco con nombre, área de protección, tamaño mínimo y archivos vectoriales (los actuales son PNG).
- Archivos vectoriales (SVG o AI) de las Lunas, el símbolo de Marina y el patrón: los actuales son recortes del manual en baja resolución.
- Confirmar el RGB de PANTONE BLACK C.
- Año de origen: el manual dice que la Finca surge en 2015; el sitio web dice que Marina Melgarejo la fundó en 2017. Unificar.
- Usos incorrectos de la marca.
