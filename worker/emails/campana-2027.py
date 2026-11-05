# Builds the "Calendario 2027" newsletters for the facilitators in GHL, one per archetype (tag c2027_*).
# Same look and helpers as build.py; facts come from src/data/*.json. No 2027 dates or retreat prices are
# published here: each newsletter asks for dates and group size and sends people to the call calendar.
# Run: python3 worker/emails/campana-2027.py   → worker/emails/campana-2027/<tag>.html + subjects.json
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build import (ARENA, CALL, MUTED, button, deep_panel, email, facts, h2, hero, label, p, question, quote, retiros, row,
                   steps, url, wa_link)

OUT = os.path.join(HERE, 'campana-2027')
LANG = 'es'
HI = 'Hola, {{contact.first_name}}:'
SIGN = 'Con cariño,<br>Charlie y el equipo de Finca El Péndulo'
EXTRA = {x['id']: x for x in retiros['extras']}
DP = json.load(open(os.path.join(HERE, '..', '..', 'src', 'data', 'visitas.json'), encoding='utf-8'))['dayPass']
PAY = ', '.join(f'{x["pct"]}% {x["when"]["es"].lower()}' for x in retiros['payments'])
money = lambda n: f'${n:,.0f}'

def next_steps(bg=ARENA):
    return steps(LANG, [
        ('Cuéntanos tu idea', 'Fechas que te interesan, número de personas y noches. Con eso basta para empezar.'),
        ('Recibe tu propuesta', 'Te enviamos la cotización con hospedaje, alimentos, espacios y actividades.'),
        ('Aparta tu fecha', f'Pagos: {PAY}. La fecha queda para quien aparta primero.')], bg=bg)

def close(review):
    return quote(review, LANG) + row(p(SIGN, size=16, mb=0), '#ffffff', '36px 48px 8px') + question(LANG)

def intro(*paras):
    return row(p(HI) + ''.join(p(x) for x in paras) +
               button('Aparta tu fecha 2027', CALL) + button('Ver los espacios', url('/espacios', LANG), 'outline'))

NEWS = {}

NEWS['c2027_formadores'] = ('Tu calendario 2027 empieza en la Finca', 'Abrimos el calendario 2027 para formaciones, certificaciones y retiros de desarrollo humano.',
    hero('retiro', 'La Terraza Ambú abierta al agavero', 'Calendario 2027 · Formadores',
         'Tu próxima generación, en un lugar que sostiene el proceso') +
    intro('Abrimos el calendario 2027 y queremos ofrecértelo primero a ti. Sabemos que quien forma grupos planea con meses de anticipación, y que las fechas buenas se van rápido.',
          'En la Finca tu grupo duerme, come y trabaja en el mismo lugar. Tú te enfocas en facilitar; nosotros nos encargamos de horarios, alimentos y espacios.') +
    deep_panel('Para formaciones y certificaciones', 'Lo que tu grupo necesita, en un solo lugar', [
        'Salón Ágora Gnosis para sesiones, presentaciones y talleres',
        'Osho Hut y Oráculo para prácticas y cierres',
        'Hospedaje para el grupo y tu staff, con 3 alimentos al día y coffee break',
        'Si das varias generaciones al año, podemos apartarlas juntas desde ahora'],
        button('Agenda una llamada', CALL, 'light')) +
    row(label('Así trabajamos') + h2('Un programa armado contigo') +
        facts([('Grupo mínimo', f'{retiros["minPeople"]} personas, incluyendo staff'),
               ('Check-in / check-out', f'{retiros["checkIn"]} / {retiros["checkOut"]}'),
               ('Alimentos', 'Menús para cualquier dieta: vegana, vegetariana, sin gluten, ayuno o alergias'),
               ('Entre sesiones', 'Caballos, lago, fogata y temazcal para integrar al grupo')]), '#ffffff', '40px 48px 8px') +
    next_steps() + close(0))

NEWS['c2027_yoga_meditacion'] = ('Tu retiro de yoga 2027: el clima de marzo te espera', 'Febrero, marzo y abril son la mejor temporada en la Finca. Abrimos el calendario 2027.',
    hero('bienvenida', 'El lago de la Finca entre árboles', 'Calendario 2027 · Yoga y meditación',
         'Practicar al amanecer frente al agavero') +
    intro('Ya abrimos el calendario 2027. Si estás pensando en tu próximo retiro, febrero, marzo y abril son la mejor temporada en Tepatitlán: no llueve, el día es cálido y la noche fresca.',
          'Recibimos grupos de yoga, meditación, respiración y sonido. Preparamos los espacios para tu práctica y la cocina se adapta a lo que tu grupo come.') +
    deep_panel('Para tu práctica', 'Espacios pensados para el silencio', [
        'Osho Hut, el corazón espiritual de la Finca',
        'Oráculo: dieciséis pilares de ónix al aire libre',
        f'{EXTRA["colchon"]["name"]["es"]} si tu grupo los necesita',
        'Ceremonia de cacao, fogata y temazcal para complementar tu programa'],
        button('Ver los espacios', url('/espacios', LANG), 'light')) +
    row(label('Un fin de semana típico') + h2('De jueves a domingo, sin preocuparte de nada') +
        p('Tu grupo llega el jueves a las 2 de la tarde. Yoga por las mañanas, talleres en el día, cacao o fuego por la noche y tres comidas diarias. El domingo cierran con comida antes de irse.') +
        p(f'El paquete incluye {", ".join(x.lower() for x in retiros["includes"]["es"])}. El grupo mínimo es de {retiros["minPeople"]} personas, incluyendo staff.', MUTED, 15, 0),
        '#ffffff', '40px 48px 16px') +
    next_steps() + close(1))

NEWS['c2027_holistico_ceremonial'] = ('Un lugar para sostener tus ceremonias en 2027', 'Temazcal, Osho Hut, círculo de fuego y silencio. Abrimos el calendario 2027.',
    hero('boda', 'La Terraza Ambú de noche', 'Calendario 2027 · Retiros holísticos',
         'Un lugar que sostiene lo que tu grupo vive') +
    intro('Abrimos el calendario 2027 y pensamos en ti. La Finca nació como un espacio de sanación, y recibimos retiros holísticos y ceremoniales todo el año.',
          'Aquí tu grupo tiene privacidad, naturaleza y un equipo que conoce el ritmo de estos procesos: sabemos cuándo acompañar y cuándo hacerse a un lado.') +
    deep_panel('Espacios ceremoniales', 'Fuego, vapor y tierra', [
        'Osho Hut: salón ceremonial de piedra y palapa',
        'Temazcal con tinas de agua fría',
        'Oráculo y espacios para círculo de fuego y fogata',
        'Ceremonia de cacao preparada por la Finca, si la quieres en tu programa'],
        button('Ver los espacios', url('/espacios', LANG), 'light')) +
    row(label('Para armar tu programa') + h2('Lo que puedes sumar a tu retiro') +
        facts([(EXTRA['temazcal']['name']['es'], f'{money(EXTRA["temazcal"]["price"])} por grupo'),
               (EXTRA['cacao']['name']['es'], f'{money(EXTRA["cacao"]["price"])} por grupo'),
               (EXTRA['fuego']['name']['es'], f'{money(EXTRA["fuego"]["price"])} por persona'),
               (EXTRA['fogata']['name']['es'], f'{money(EXTRA["fogata"]["price"])} por hora')]) +
        p('Hospedaje, tres comidas al día, coffee break y uso de los espacios ya van en el paquete.', MUTED, 15, 0), '#ffffff', '40px 48px 16px') +
    next_steps() + close(2))

NEWS['c2027_terapeutas_circulos'] = ('Tus talleres y círculos de 2027, en la Finca', 'Para grupos pequeños: talleres de un día con Day Pass o retiros cortos de una o dos noches.',
    hero('contacto', 'Vista aérea de los agaves y las cabañas de la Finca', 'Calendario 2027 · Talleres y círculos',
         'Para grupos pequeños, también hay lugar') +
    intro('Abrimos el calendario 2027. Si das constelaciones, círculos de mujeres, terapia o talleres, no necesitas un grupo grande ni varias noches para venir a la Finca.',
          'Te proponemos dos formatos. Elige el que va con tu grupo.') +
    row(label('Formato 1') + h2('Un día de taller') +
        p(f'Tu grupo entra con Day Pass: {money(DP["price"])} por persona, de {DP["hours"]["es"]}. Incluye acceso a las áreas comunes, alberca y jacuzzi. Te ayudamos a elegir dónde dar tu taller: el Oráculo al aire libre o el Salón Ágora Gnosis si llueve.') +
        label('Formato 2') + h2('Un retiro corto') +
        p(f'Una o dos noches con hospedaje, tres comidas al día, coffee break y uso de los espacios. Grupo mínimo de {retiros["minPeople"]} personas, incluyendo staff.', mb=24) +
        button('Escríbenos por WhatsApp', wa_link(LANG)) + button('Agenda una llamada', CALL, 'outline'), ARENA, '40px 48px') +
    deep_panel('Para tu círculo', 'Espacios con intención', [
        'Oráculo: dieciséis pilares de ónix entre árboles',
        'Osho Hut para círculos y meditaciones',
        'Temazcal y círculo de fuego para cerrar el proceso',
        'Lago y senderos para la integración'],
        button('Ver los espacios', url('/espacios', LANG), 'light')) +
    close(3))

NEWS['c2027_grupos_grandes'] = ('La Finca entera para tu grupo en 2027', 'Para grupos de 30 personas o más: aparta tu fecha 2027 antes que nadie.',
    hero('evento', 'Mesa larga con candiles para una cena en la Finca', 'Calendario 2027 · Grupos grandes',
         'La Finca entera para tu grupo') +
    intro('Abrimos el calendario 2027 y las fechas para grupos grandes son las primeras en irse: cuando tu grupo pasa de 30 personas, la Finca queda prácticamente para ustedes.',
          'Recibimos residencias creativas, campamentos, encuentros de empresa y retiros grandes. Armamos la propuesta según lo que tu grupo necesita.') +
    deep_panel('Para grupos grandes', 'Todo en un mismo lugar', [
        'Hasta 50 personas entre habitaciones dobles y el Hormiguero',
        'Salón Ágora Gnosis para sesiones, presentaciones y planeación',
        'Terraza Ambú y Sammasati para comidas y cenas especiales',
        'Caballos, lago, fogata y temazcal entre sesiones'],
        button('Agenda una llamada', CALL, 'light')) +
    row(label('Cómo cotizamos') + h2('Una propuesta para tu grupo, no una tarifa fija') +
        p('El precio depende del tamaño del grupo, las noches y el tipo de habitación. Con grupos grandes cotizamos el total y te lo damos también por persona por noche, para que puedas armar tus números.') +
        p(f'Pagos: {PAY}.', MUTED, 15, 0), '#ffffff', '40px 48px 16px') +
    next_steps() + close(4))

NEWS['c2027_exploradores'] = ('Cuando quieras hacer tu retiro, aquí estamos', 'Abrimos el calendario 2027. Te contamos cómo funciona un retiro en la Finca, paso a paso.',
    hero('seguimiento', 'Cabaña con ventanal hacia el campo', 'Calendario 2027',
         'Tu primer retiro, sin complicaciones') +
    intro('Hace unos meses nos escribiste porque estabas buscando un lugar para facilitar. Abrimos el calendario 2027 y queríamos contarte, sin prisa, cómo funciona un retiro en la Finca.',
          'Estamos en Tepatitlán de Morelos, Jalisco, a una hora de Guadalajara y de su aeropuerto.') +
    deep_panel('El paquete incluye', 'Tú facilitas; nosotros nos encargamos del resto', retiros['includes']['es'] +
               [f'Grupo mínimo de {retiros["minPeople"]} personas, incluyendo tu staff'],
               button('Ver la página de retiros', url('/retiros', LANG), 'light')) +
    row(label('Preguntas frecuentes') + h2('Lo que más nos preguntan') +
        facts([('¿Dónde están?', 'Tepatitlán de Morelos, Jalisco, a una hora de Guadalajara'),
               ('¿Qué incluye?', 'Hospedaje, 3 alimentos al día, coffee break y uso de los espacios'),
               ('¿Puedo visitar antes?', 'Sí. Escríbenos y agendamos un recorrido'),
               ('¿Cuánto cuesta?', 'Depende del grupo, las noches y las habitaciones. En una llamada te damos el número')]),
        '#ffffff', '40px 48px 8px') +
    next_steps() + close(5))

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    subjects = {}
    for tag, (subject, preview, body) in NEWS.items():
        open(os.path.join(OUT, tag + '.html'), 'w', encoding='utf-8').write(email(LANG, subject, preview, body, marketing=True))
        subjects[tag] = subject
    open(os.path.join(OUT, 'subjects.json'), 'w', encoding='utf-8').write(json.dumps(subjects, indent=1, ensure_ascii=False) + '\n')
    print('\n'.join(f'{t}: {s}' for t, s in subjects.items()))
