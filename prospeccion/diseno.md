# Diseño: skill "prospeccion-finca"

Basado en `requisitos.md`. Para que Carlos lo apruebe antes de construir.

## Idea en una línea
Claude Code busca, verifica, califica y redacta; GHL guarda, Carlos aprueba y GHL envía y da seguimiento. No hay panel aparte.

## Flujo
1. **Buscar** (Python, sin IA): Serper (Google web, Maps/Places y búsquedas `site:instagram.com`), micole.net para escuelas. De pymes.org.mx solo se usa lo que muestra Google, sin entrar al sitio (bloquea robots de IA).
2. **Filtrar** (Python, sin IA): distancia a la Finca (200 km estudios; 100 km empresas; Guadalajara, Tepatitlán y Los Altos para escuelas y wedding planners), duplicados, lista de no contactar, directorios, lo que ya está en GHL y los rechazados antes.
3. **Leer el sitio y buscar contacto** (Python, sin IA): sitio, enlace de la bio, Facebook, ficha de Maps, plataformas de cursos y menciones en otros sitios. Patrón de correo del dominio y una sola verificación con Reoon. También teléfono y WhatsApp.
4. **Calificar** (IA, barato): Claude recibe una ficha corta por prospecto (unas 300 palabras, nunca la página completa) y la rúbrica del segmento. Devuelve: califica sí/no/dudoso, puntaje, motivo en una línea y la observación concreta para el correo. Se hace en lotes de 10 con un modelo ligero.
5. **Redactar** (IA, solo calificados): Claude escribe los 3 correos con las reglas y los ejemplos aprobados de su segmento, más las lecciones aprendidas de rechazos.
6. **Subir a GHL** (API): contacto con etiquetas y campos, y una oportunidad en el pipeline "Prospección", etapa "Por revisar".
7. **Carlos revisa en GHL**: lee el correo en los campos del contacto y puede editarlo. Para aprobar mueve la oportunidad a "Aprobado"; para rechazar la mueve a "Descartado" y elige un motivo.
8. **GHL envía**: un workflow por etapa manda el correo 1, espera, el 2, espera, el 3, y se detiene si responde. Un aviso interno le llega a Carlos cuando alguien responde.
9. **Aprender**: al inicio de cada corrida, la skill lee los descartados con su motivo y las ediciones de Carlos, y los resume en `aprendizajes.md` por segmento. Ese archivo entra en la calificación y la redacción.

## Ahorro de tokens frente a Harvey
- Todo lo que no requiere criterio (buscar, leer sitios, filtrar, verificar) es Python: cero tokens.
- Claude ve fichas cortas, no páginas. Solo redacta para quien ya calificó.
- Un modelo ligero para calificar y uno mejor solo para redactar.
- Cada corrida imprime cuántos tokens usó y cuántos prospectos calificados salieron.

## En GHL (se crea una vez)
- **Pipeline "Prospección"**: Por revisar → Aprobado → En secuencia → Respondió → Interesado → Descartado. (GHL no deja crear pipelines por API: lo crea Carlos o yo desde el navegador.)
- **Campos del contacto** (grupo "Prospección"): segmento, puntaje, motivo de calificación, fuente, sitio, Instagram, seguidores, estado del correo (verificado/riesgoso), asunto y cuerpo de los correos 1–3, motivo de descarte (lista: no es el perfil, muy lejos, muy pequeño, competencia, religioso, ya es cliente, otro) y nota de Carlos.
- **Etiquetas**: `prospeccion`, `prosp-<segmento>`, `prosp-dm` (sin correo, contactar por DM), `prosp-dudoso`.
- **Workflow "Prospección · Secuencia"**: se dispara al pasar a "Aprobado"; envía los correos desde los campos; espera 3–4 días y 7 días; se detiene si responde; mueve a "Respondió" y avisa a Carlos.
- **WhatsApp (decidido: semiautomático)**: nada se envía solo. La skill redacta un mensaje corto y arma un enlace `https://wa.me/<número>?text=<mensaje>` que guarda en el campo "Prospección WhatsApp". Si después del correo 2 no hay respuesta y el prospecto tiene teléfono, el workflow le crea a Carlos una tarea en GHL con ese enlace; Carlos lo abre en el celular y envía desde su WhatsApp. Nunca como primer contacto.

## Archivos de la skill
- `SKILL.md`: cuándo usarla y el flujo.
- `segmentos/<segmento>.md`: criterios, rúbrica, ejemplos buenos y malos, oferta, ejemplos de correo aprobados.
- `reglas-correo.md`: reglas generales de Carlos y lo que nunca se dice.
- `aprendizajes.md`: lo que se aprende de los rechazos (se actualiza solo).
- `scripts/`: búsqueda, filtros, lectura de sitios y contactos, verificación, subida a GHL y lectura de rechazos.
- Llaves (Serper, Reoon, GHL) fuera de la skill, como hoy hace `sync.py`.

## Cómo se usa
- A pedido: "busca 20 wedding planners en Guadalajara" o "corre la prospección de esta semana".
- Programada: una corrida semanal (por ejemplo, lunes temprano) en esta Mac, repartida por segmento hasta ~50 prospectos.

## Lo que falta decidir
- Reparto semanal (decidido): estudios 15, facilitadores 15, empresas 8, escuelas 6, wedding planners 6.
- Los seguimientos (correos 2 y 3): la skill los redacta con las mismas reglas; Carlos aprueba los primeros para fijar el estilo.
