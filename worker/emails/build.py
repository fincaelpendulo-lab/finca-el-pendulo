# Builds the GHL workflow emails of Finca El Péndulo: one HTML file per template plus subjects.json.
# Look taken from the "Newsletter Finca el Péndulo" artifact: white page, Newsreader titles,
# Tenor Sans text, spaced uppercase labels in ground, agave-oscuro panels, the tile band over the footer.
# Facts come from src/data/*.json; past dates in proximos.json are left out on every rebuild.
# Run: python3 worker/emails/build.py [--today YYYY-MM-DD]   (images: node worker/emails/images.mjs)
import json, os, sys
from datetime import date
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', '..', 'src', 'data')
load = lambda name: json.load(open(os.path.join(DATA, name + '.json'), encoding='utf-8'))
site, retiros, eventos, proximos, resenas = (load(n) for n in ('site', 'retiros', 'eventos', 'proximos', 'resenas-google'))
TODAY = date.fromisoformat(sys.argv[sys.argv.index('--today') + 1]) if '--today' in sys.argv else date.today()

SITE = site['url']
IMG = SITE + '/email/'
WA = 'https://wa.me/' + site['whatsapp']['number']
CALL = site['callBooking']['url']  # GHL calendar to book a call about retreats, events and weddings
GHL_CONTACT = 'https://app.gohighlevel.com/v2/location/Lkub474FFDoFMTUzhNv6/contacts/detail/{{contact.id}}'
EN_PATHS = {'/': '/en', '/retiros': '/en/retreats', '/espacios': '/en/spaces', '/eventos': '/en/events', '/hospedaje': '/en/stay',
            '/comunidad': '/en/community', '/bodas': '/en/weddings', '/aviso-de-privacidad': '/en/privacy', '/experiencias': '/en/experiences'}

# Colours from design-system/tokens.json.
INK, MUTED, GROUND, AGAVE_DEEP, ARENA, WOOD, CORN, AGAVE, LINE = (
    '#2e2a25', '#6d6862', '#8b2d1e', '#4f5440', '#efe6d8', '#674c3d', '#b98a5b', '#80866d', '#e2dbd0')
SERIF = "font-family:'Newsreader',Georgia,'Times New Roman',serif;font-weight:400;"
SANS = "font-family:'Tenor Sans','Helvetica Neue',Arial,sans-serif;"

def url(path, lang):
    return SITE + (EN_PATHS.get(path, path) if lang == 'en' else path)

def wa_link(lang):
    text = 'Hola, me interesa Finca El Péndulo' if lang == 'es' else 'Hi, I am interested in Finca El Péndulo'
    return WA + '?text=' + text.replace(' ', '%20').replace('é', '%C3%A9').replace(',', '%2C')

def head(lang, title, preview):
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>{escape(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz@6..72&amp;family=Tenor+Sans&amp;display=swap" rel="stylesheet">
<style>
body {{ margin: 0; padding: 0; background: #f6f2ec; }}
img {{ border: 0; display: block; max-width: 100%; height: auto; }}
a {{ color: {GROUND}; }}
@media (max-width: 620px) {{
.px {{ padding-left: 24px !important; padding-right: 24px !important; }}
.h1 {{ font-size: 38px !important; line-height: 1.06 !important; }}
.h2 {{ font-size: 30px !important; }}
.col {{ display: block !important; width: 100% !important; padding: 0 0 20px 0 !important; }}
}}
</style>
</head>
<body style="margin:0;padding:0;background:#f6f2ec;">
<div style="display:none;max-height:0;overflow:hidden;">{escape(preview)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f2ec;">
<tr><td align="center" style="padding:0;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;{SANS}color:{INK};">
<tr><td class="px" align="center" style="padding:28px 40px 22px;">
<a href="{url('/', lang)}"><img src="{IMG}logo.png" width="72" alt="Finca El Péndulo" style="width:72px;height:auto;margin:0 auto;"></a>
</td></tr>
'''

def hero(img, alt, eyebrow, title):
    # Photo, then the title on white below it (text over photos breaks in dark mode and Outlook).
    return f'''<tr><td style="padding:0;"><img src="{IMG}{img}.jpg" width="600" alt="{escape(alt)}" style="width:100%;max-width:600px;height:auto;"></td></tr>
<tr><td class="px" style="padding:36px 48px 8px;">
{label(eyebrow)}<h1 class="h1" style="margin:0;{SERIF}font-size:44px;line-height:1.06;color:{INK};">{title}</h1>
</td></tr>
'''

def label(text, color=GROUND):
    return f'<p style="margin:0 0 14px;font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:{color};">{text}</p>\n'

def h2(text, color=INK):
    return f'<h2 class="h2" style="margin:0 0 16px;{SERIF}font-size:34px;line-height:1.08;color:{color};">{text}</h2>\n'

def p(text, color=INK, size=16, mb=16):
    return f'<p style="margin:0 0 {mb}px;font-size:{size}px;line-height:1.65;color:{color};">{text}</p>\n'

def button(text, href, kind='primary'):
    styles = {'primary': f'background:{GROUND};', 'outline': f'border:1px solid {INK};', 'light': 'background:#ffffff;', 'outline-light': 'border:1px solid #ffffff;'}
    ink = '#ffffff' if kind in ('primary', 'outline-light') else INK
    return (f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 12px 12px 0;display:inline-table;"><tr><td style="{styles[kind]}">'
            f'<a href="{href}" style="display:inline-block;padding:15px 28px;font-size:15px;letter-spacing:0.04em;color:{ink};text-decoration:none;">{text}</a></td></tr></table>')

def row(inner, bg='#ffffff', pad='28px 48px 36px'):
    return f'<tr><td class="px" style="padding:{pad};background:{bg};">\n{inner}</td></tr>\n'

def facts(items):
    # Label/value rows, like the "Lugar / Aportación / Cupo" block.
    cells = ''.join(f'<tr><td style="padding:12px 0;border-top:1px solid {LINE};font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:{MUTED};width:38%;vertical-align:top;">{k}</td>'
                    f'<td style="padding:12px 0;border-top:1px solid {LINE};font-size:16px;line-height:1.5;color:{INK};">{v}</td></tr>' for k, v in items)
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;border-bottom:1px solid {LINE};">{cells}</table>\n'

def deep_panel(eyebrow, title, items, btn=None):
    lis = ''.join(f'<tr><td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.22);font-size:17px;color:#ffffff;">{i}</td></tr>' for i in items)
    return row(label(eyebrow, '#f1d9b9') + h2(title, '#ffffff') +
               f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 {28 if btn else 0}px;">{lis}</table>\n' + (btn or ''),
               AGAVE_DEEP, '40px 48px 40px')

def quote(i, lang, bg=ARENA):
    # A Google review excerpt from src/data/resenas-google.json (no reviewer names), with the overall rating.
    t, r = resenas[i % len(resenas)], site['reviews']
    es = lang == 'es'
    return row(label('Opiniones en Google' if es else 'Google reviews') +
               f'<p style="margin:0 0 8px;font-size:18px;letter-spacing:2px;color:{CORN};">★★★★★</p>\n' +
               f'<p style="margin:0 0 16px;{SERIF}font-size:24px;line-height:1.35;color:{INK};">“{t["text"][lang]}”</p>\n' +
               p(('Opinión en Google · ' if es else 'Google review · ') + t['context'][lang] + ('' if es else ' · translated from Spanish'), MUTED, 14, 12) +
               p((f'{r["rating"]} de 5 en Google, de {r["count"]} opiniones · ' if es else f'Rated {r["rating"]} out of 5 on Google from {r["count"]} reviews · ') +
                 f'<a href="{r["url"]}" style="color:{GROUND};">{"Leer las opiniones" if es else "Read the reviews"}</a>', MUTED, 14, 0), bg, '40px 48px')

def steps(lang, items, call=True, bg='#ffffff'):
    # "Pasos a seguir": numbered next steps, then the call and WhatsApp buttons.
    es = lang == 'es'
    rows = ''.join(f'<tr><td style="padding:14px 16px 14px 0;border-top:1px solid {LINE};width:40px;vertical-align:top;{SERIF}font-size:28px;line-height:1;color:{GROUND};">{n}</td>'
                   f'<td style="padding:14px 0;border-top:1px solid {LINE};vertical-align:top;"><p style="margin:0 0 4px;font-size:16px;color:{INK};"><b style="font-weight:400;{SERIF}font-size:20px;">{t}</b></p>'
                   f'<p style="margin:0;font-size:15px;line-height:1.55;color:{MUTED};">{d}</p></td></tr>' for n, (t, d) in enumerate(items, 1))
    btns = (button('Agenda una llamada' if es else 'Book a call', CALL) if call else '') + \
           button('Escríbenos por WhatsApp' if es else 'Message us on WhatsApp', wa_link(lang), 'outline' if call else 'primary')
    return row(label('Pasos a seguir' if es else 'Next steps') +
               f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-bottom:1px solid {LINE};">{rows}</table>\n' + btns, bg, '40px 48px')

def retreat_types(lang):
    es = lang == 'es'
    items = ''.join(f'<tr><td style="padding:12px 0;border-top:1px solid {LINE};"><p style="margin:0 0 4px;{SERIF}font-size:20px;color:{INK};">{x["name"][lang]}</p>'
                    f'<p style="margin:0;font-size:15px;line-height:1.55;color:{MUTED};">{x["text"][lang]}</p></td></tr>' for x in retiros['types'])
    return row(label('Tipos de retiro' if es else 'Kinds of retreat') + h2('Recibimos todo tipo de retiro' if es else 'We host every kind of retreat') +
               p('Nuestro equipo trabajará cerca de ti para lograr experiencias inolvidables para tus huéspedes. Algunos de los que más recibimos:' if es else 'Our team works closely with you to create unforgettable experiences for your guests. Some of the ones we host most often:', INK, 16, 16) +
               f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-bottom:1px solid {LINE};">{items}</table>\n' +
               button('Ver la página de retiros' if es else 'See the retreats page', url('/retiros', lang), 'outline'), '#ffffff', '40px 48px')

def tiles(lang):
    es = lang == 'es'
    items = [('tile-espacios', 'Espacios' if es else 'Spaces', 'Ver los espacios' if es else 'See the spaces', '/espacios'),
             ('tile-hospedaje', 'Hospedaje' if es else 'Stay', 'Ver las habitaciones' if es else 'See the rooms', '/hospedaje'),
             ('tile-eventos', 'Eventos' if es else 'Events', 'Ver los eventos' if es else 'See the events', '/eventos')]
    cols = ''.join(f'''<td class="col" width="33%" valign="top" style="padding:0 {8 if i < 2 else 0}px 0 {0 if i == 0 else 8}px;">
<a href="{url(path, lang)}"><img src="{IMG}{img}.jpg" width="160" alt="" style="width:100%;height:auto;margin:0 0 12px;"></a>
<p style="margin:0 0 6px;font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:{GROUND};">{name}</p>
<a href="{url(path, lang)}" style="font-size:15px;color:{INK};">{cta}</a></td>''' for i, (img, name, cta, path) in enumerate(items))
    return row(f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr>{cols}</tr></table>\n', '#ffffff', '8px 48px 40px')

def upcoming(lang):
    # Próximos eventos from src/data/proximos.json, past dates left out. Empty list → no block.
    items = sorted((e for e in proximos if date.fromisoformat(e.get('endDate') or e['date']) >= TODAY), key=lambda e: e['date'])[:4]
    if not items:
        return ''
    months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] if lang == 'es' else \
             ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    pick = lambda v: v[lang] if isinstance(v, dict) else v
    rows = ''.join(f'''<tr><td style="padding:14px 16px 14px 0;border-top:1px solid {LINE};width:64px;vertical-align:top;{SERIF}font-size:30px;line-height:1;color:{GROUND};">{d.day}<br><span style="{SANS}font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">{months[d.month - 1]}</span></td>
<td style="padding:14px 0;border-top:1px solid {LINE};vertical-align:top;"><p style="margin:0 0 4px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:{MUTED};">{pick(e.get('kind', ''))}</p><p style="margin:0;{SERIF}font-size:22px;line-height:1.2;color:{INK};">{pick(e['title'])}</p></td></tr>'''
                   for e in items for d in [date.fromisoformat(e['date'])])
    return row(label('Próximos eventos' if lang == 'es' else 'Upcoming events') +
               f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">{rows}</table>\n' +
               button('Ver todos los eventos' if lang == 'es' else 'See all events', url('/eventos', lang), 'outline'), ARENA, '40px 48px')

def question(lang, pad='8px 48px 40px'):
    es = lang == 'es'
    return row(h2('¿Tienes una pregunta?' if es else 'Have a question?') +
               p('Responde a este correo o escríbenos por WhatsApp. Te contestamos nosotros, no un robot.' if es else
                 'Reply to this email or message us on WhatsApp. A person from the Finca will answer.') +
               button('Escríbenos por WhatsApp' if es else 'Message us on WhatsApp', wa_link(lang)), '#ffffff', pad)

def foot(lang, marketing):
    es = lang == 'es'
    a = site['address']
    band = ''.join(f'<td width="8.33%" style="height:24px;background:{c};font-size:0;line-height:0;">&nbsp;</td>' for c in [CORN, AGAVE, GROUND, WOOD] * 3)
    band2 = ''.join(f'<td width="8.33%" style="height:24px;background:{c};font-size:0;line-height:0;">&nbsp;</td>' for c in [GROUND, WOOD, CORN, AGAVE] * 3)
    links = ' &nbsp;·&nbsp; '.join(f'<a href="{h}" style="color:#ffffff;text-decoration:underline;">{t}</a>' for t, h in [
        ('WhatsApp', wa_link(lang)), ('Sitio web' if es else 'Website', url('/', lang)), ('Aviso de privacidad' if es else 'Privacy notice', url('/aviso-de-privacidad', lang))])
    unsub = (f'<p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.75);">{"¿Prefieres no recibir estos correos?" if es else "Rather not receive these emails?"} '
             f'<a href="{{{{email.unsubscribe_link}}}}" style="color:#ffffff;">{"Darte de baja" if es else "Unsubscribe"}</a></p>') if marketing else ''
    return f'''<tr><td style="padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{band}</tr><tr>{band2}</tr></table></td></tr>
<tr><td class="px" align="center" style="padding:36px 48px 40px;background:{AGAVE_DEEP};color:#ffffff;text-align:center;">
<img src="{IMG}simbolo-blanco.png" width="40" alt="" style="width:40px;height:auto;margin:0 auto 18px;">
<p style="margin:0 0 6px;{SERIF}font-size:20px;color:#ffffff;">Finca El Péndulo</p>
<p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.8);">{a['street']}, {a['locality']}, {a['region']} · {site['whatsapp']['display']}</p>
<p style="margin:0;font-size:13px;line-height:1.8;">{links}</p>
{unsub}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
'''

def email(lang, title, preview, body, marketing=False):
    return head(lang, title, preview) + body + foot(lang, marketing)

HI = {'es': 'Hola, {{contact.first_name}}:', 'en': 'Hi {{contact.first_name}},'}
SIGN = {'es': 'Con cariño,<br>Finca El Péndulo', 'en': 'Warmly,<br>Finca El Péndulo'}
DATES = '{{contact.requested_dates}}'
PEOPLE = '{{contact.number_of_people}}'
MESSAGE = '{{contact.website_message}}'
bodas = next(e for e in eventos if e['id'] == 'bodas')
kinds = [e['name'] for e in eventos if e['id'] not in ('retiros', 'bodas')]
PAY = lambda lang: ', '.join(f'{x["pct"]}% {x["when"][lang].lower()}' for x in retiros['payments'])

def build():
    out, subjects = {}, {}
    for lang in ('es', 'en'):
        es = lang == 'es'
        S = lambda e, n: e if es else n

        # 01 Retiros: quote request received.
        key = f'01-retiro-{lang}'
        subjects[key] = S('Recibimos tu solicitud de retiro', 'We have your retreat request')
        out[key] = email(lang, subjects[key], S('Te enviaremos la propuesta para tu retiro por correo o WhatsApp.', 'We will send the proposal for your retreat by email or WhatsApp.'),
            hero('retiro', S('La Terraza Ambú abierta al agavero', 'The Ambú terrace open to the agave field'), S('Retiros', 'Retreats'),
                 S('Gracias por pensar en la Finca para tu retiro', 'Thank you for thinking of the Finca for your retreat')) +
            row(p(HI[lang]) +
                p(S('Recibimos tu solicitud de cotización. Revisamos las fechas, el tamaño del grupo y los espacios que necesitas, y te enviamos la propuesta por correo o WhatsApp.',
                    'We have your quote request. We will look at your dates, group size and the spaces you need, and send you the proposal by email or WhatsApp.')) +
                facts([(S('Fechas', 'Dates'), DATES), (S('Personas', 'People'), PEOPLE),
                       (S('Grupo mínimo', 'Minimum group'), S(f'{retiros["minPeople"]} personas, incluyendo staff', f'{retiros["minPeople"]} people, staff included')),
                       ('Check-in / check-out', f'{retiros["checkIn"]} / {retiros["checkOut"]}')]) +
                p(S('Si algo cambió, responde a este correo y lo ajustamos.', 'If anything has changed, reply to this email and we will adjust it.'), MUTED, 15, 0)) +
            steps(lang, [(S('Agenda una llamada', 'Book a call'), S('Elige día y hora en el calendario. Platicamos de tu grupo, tu programa y los espacios que necesitas.', 'Pick a day and time in the calendar. We talk about your group, your programme and the spaces you need.')),
                         (S('Recibe tu propuesta', 'Receive your proposal'), S('Te enviamos la cotización por correo o WhatsApp, con hospedaje, alimentos, espacios y actividades.', 'We send the quote by email or WhatsApp, with lodging, meals, spaces and activities.')),
                         (S('Aparta la fecha', 'Hold the date'), S(f'Pagos: {PAY(lang)}.', f'Payments: {PAY(lang)}.')),
                         (S('Preparamos todo para tu grupo', 'We get everything ready'), S('Coordinamos horarios, alimentos y actividades para que tú te enfoques en facilitar.', 'We coordinate schedules, meals and activities so you can focus on leading.'))], bg=ARENA) +
            deep_panel(S('El paquete incluye', 'The package includes'), S('Todo listo para que te enfoques en tu grupo', 'Everything ready so you can focus on your group'),
                       retiros['includes'][lang], button(S('Ver los espacios', 'See the spaces'), url('/espacios', lang), 'light')) +
            row(label(S('Alimentación', 'Food')) + h2(S('Menús a la medida de tu grupo', 'Menus made for your group')) +
                p(S('Preparamos los menús adaptándonos a cualquier dieta: vegana, vegetariana, sin gluten, sin lácteos, ayuno, detox o alergias específicas. No importa qué tan complicado sea tu menú o tus requisitos.',
                    'We prepare menus to suit any diet: vegan, vegetarian, gluten-free, dairy-free, fasting, detox or specific allergies. No matter how complex your menu or requirements are.'), INK, 16, 0), '#ffffff', '40px 48px 8px') +
            retreat_types(lang) + quote(0, lang) +
            row(p(SIGN[lang], INK, 16, 0), '#ffffff', '36px 48px 8px') + question(lang))

        # 02 Eventos: event request received.
        key = f'02-evento-{lang}'
        subjects[key] = S('Recibimos tu solicitud para el evento', 'We have your event request')
        out[key] = email(lang, subjects[key], S('Te escribiremos con fechas y detalles.', 'We will write back with dates and details.'),
            hero('evento', S('Cena larga bajo los candiles de la Terraza Ambú', 'A long dinner under the chandeliers of the Ambú terrace'), S('Eventos', 'Events'),
                 S('Tu evento en la Finca empieza aquí', 'Your event at the Finca starts here')) +
            row(p(HI[lang]) +
                p(S('Recibimos tu solicitud. Te escribiremos con fechas, espacios y lo que necesitas saber para tu evento.',
                    'We have your request. We will write back with dates, spaces and what you need to know for your event.')) +
                facts([(S('Fechas', 'Dates'), DATES), (S('Personas', 'People'), PEOPLE)]) +
                p(S('En la Finca organizamos ', 'At the Finca we host ') + ', '.join(k[lang].lower() for k in kinds[:-1]) + S(' y ', ' and ') + kinds[-1][lang].lower() + '.', INK, 16, 24) +
                button(S('Ver los eventos', 'See the events'), url('/eventos', lang), 'outline')) +
            steps(lang, [(S('Agenda una llamada', 'Book a call'), S('Elige día y hora en el calendario y platicamos de tu evento.', 'Pick a day and time in the calendar and we talk about your event.')),
                         (S('Recibe opciones', 'Receive options'), S('Te enviamos espacios, hospedaje y alimentos que se ajustan a tu fecha y número de personas.', 'We send spaces, lodging and food that fit your date and guest count.')),
                         (S('Aparta la fecha', 'Hold the date'), S('Con el anticipo confirmamos la fecha y el espacio.', 'A deposit confirms the date and the space.')),
                         (S('Coordinamos los detalles', 'We coordinate the details'), S('Montaje, horarios y alimentos, listos para el día del evento.', 'Set-up, timings and food, ready for the day.'))], bg=ARENA) +
            quote(1, lang, '#ffffff') + upcoming(lang) + row(p(SIGN[lang], INK, 16, 0), '#ffffff', '36px 48px 8px') + question(lang))

        # 03 Bodas: wedding request received.
        key = f'03-boda-{lang}'
        subjects[key] = S('Recibimos los datos de tu boda', 'We have your wedding details')
        out[key] = email(lang, subjects[key], S('Te escribiremos para platicar fechas, espacios y hospedaje.', 'We will write to talk about dates, spaces and lodging.'),
            hero('boda', S('La Terraza Ambú iluminada al anochecer junto a la fuente', 'The Ambú terrace lit at dusk beside the fountain'), S('Bodas', 'Weddings'),
                 S('Gracias por contarnos de tu boda', 'Thank you for telling us about your wedding')) +
            row(p(HI[lang]) +
                p(S('Recibimos los datos de tu boda. Te escribiremos para platicar fechas, espacios y hospedaje para tus invitados.',
                    'We have your wedding details. We will write to talk about dates, spaces and rooms for your guests.')) +
                facts([(S('Fecha', 'Date'), DATES), (S('Invitados', 'Guests'), PEOPLE)])) +
            steps(lang, [(S('Agenda una llamada', 'Book a call'), S('Elige día y hora en el calendario y platicamos de tu boda.', 'Pick a day and time in the calendar and we talk about your wedding.')),
                         (S('Recibe la propuesta', 'Receive the proposal'), S('Espacios para la ceremonia y la fiesta, hospedaje para tus invitados y alimentos.', 'Spaces for the ceremony and the party, rooms for your guests and food.')),
                         (S('Aparta la fecha', 'Hold the date'), S('Con el anticipo confirmamos tu fecha en la Finca.', 'A deposit confirms your date at the Finca.')),
                         (S('Planeamos juntos el día', 'We plan the day together'), S('Coordinamos montaje, horarios y detalles hasta el gran día.', 'We coordinate set-up, timings and details up to the big day.'))], bg=ARENA) +
            deep_panel(S('Bodas en la Finca', 'Weddings at the Finca'), S('Un día entero en la naturaleza', 'A whole day in nature'),
                       [bodas['text'][lang]], button(S('Ver los espacios', 'See the spaces'), url('/espacios', lang), 'light')) +
            quote(0, lang, '#ffffff') + row(p(SIGN[lang], INK, 16, 0), '#ffffff', '8px 48px 8px') + question(lang))

        # 04 Contacto: message received.
        key = f'04-contacto-{lang}'
        subjects[key] = S('Recibimos tu mensaje', 'We have your message')
        out[key] = email(lang, subjects[key], S('Te responderemos pronto.', 'We will reply soon.'),
            hero('contacto', S('Vista aérea de las cabañas entre hileras de agave', 'Aerial view of the cabins among rows of agave'), S('Contacto', 'Contact'),
                 S('Gracias por escribirnos', 'Thank you for writing to us')) +
            row(p(HI[lang]) +
                p(S('Recibimos tu mensaje y te responderemos pronto por correo o WhatsApp.', 'We have your message and will reply soon by email or WhatsApp.')) +
                f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr><td style="padding:16px 20px;border-left:3px solid {CORN};background:{ARENA};font-size:15px;line-height:1.6;color:{INK};">{MESSAGE}</td></tr></table>\n' +
                p(S('Mientras tanto, puedes ver las habitaciones y reservar en línea.', 'Meanwhile, you can see the rooms and book online.'), INK, 16, 24) +
                button(S('Hospédate con nosotros', 'Stay with us'), site['booking']['url' if es else 'urlEn'])) +
            tiles(lang) +
            steps(lang, [(S('Te respondemos', 'We reply'), S('Una persona de la Finca te escribe por correo o WhatsApp.', 'Someone from the Finca writes back by email or WhatsApp.')),
                         (S('¿Organizas un retiro, evento o boda?', 'Planning a retreat, event or wedding?'), S('Agenda una llamada en el calendario y lo platicamos.', 'Book a call in the calendar and we will talk it through.')),
                         (S('¿Quieres hospedarte?', 'Want to stay?'), S('Reserva tu habitación en línea cuando quieras.', 'Book your room online any time.'))], bg=ARENA) +
            quote(2, lang, '#ffffff') + row(p(SIGN[lang], INK, 16, 0), '#ffffff', '8px 48px 8px') + question(lang))

        # 05 Voluntariado: application received.
        key = f'05-voluntariado-{lang}'
        subjects[key] = S('Recibimos tu aplicación de voluntariado', 'We have your volunteer application')
        out[key] = email(lang, subjects[key], S('La revisaremos y te escribiremos.', 'We will review it and write to you.'),
            hero('voluntariado', S('Campo de agave azul en la Finca', 'A field of blue agave at the Finca'), S('Voluntariado', 'Volunteering'),
                 S('Gracias por querer sumarte a la comunidad', 'Thank you for wanting to join the community')) +
            row(p(HI[lang]) +
                p(S('Recibimos tu aplicación de voluntariado. La revisaremos con calma y te escribiremos para platicar.',
                    'We have your volunteer application. We will review it carefully and write to you to talk.')) +
                p(S('Si quieres agregar algo, responde a este correo.', 'If you want to add anything, reply to this email.'), MUTED, 15, 24) +
                button(S('Ver la comunidad', 'See the community'), url('/comunidad', lang), 'outline')) +
            steps(lang, [(S('Revisamos tu aplicación', 'We review your application'), S('La leemos con calma junto con el equipo de la Finca.', 'We read it carefully with the Finca team.')),
                         (S('Platicamos', 'We talk'), S('Te escribimos por correo o WhatsApp para conocerte y resolver dudas.', 'We write by email or WhatsApp to get to know you and answer questions.')),
                         (S('Acordamos fechas', 'We agree on dates'), S('Si hay lugar, definimos juntos cuándo llegas y en qué áreas ayudarás.', 'If there is room, we agree when you arrive and where you will help.'))], call=False, bg=ARENA) +
            quote(3, lang, '#ffffff') + row(p(SIGN[lang], INK, 16, 0), '#ffffff', '8px 48px 8px') + question(lang))

        # 06 Newsletter welcome (marketing: unsubscribe link).
        key = f'06-bienvenida-{lang}'
        subjects[key] = S('Te damos la bienvenida a la Finca', 'Welcome to the Finca')
        r = site['reviews']
        up = upcoming(lang)  # arena block; the quote after it goes on white so two arena blocks never touch
        out[key] = email(lang, subjects[key], S('Eventos, retiros y novedades de la Finca, en tu correo.', 'Events, retreats and news from the Finca, in your inbox.'),
            hero('bienvenida', S('El lago de la Finca con la palapa al fondo', 'The Finca lake with the palapa behind it'), 'Newsletter',
                 S('Gracias por suscribirte', 'Thank you for subscribing')) +
            row(p(S('Hola:', 'Hello,')) +
                p(S('La Finca El Péndulo es un espacio en Tepatitlán de Morelos, Jalisco, para retiros, bienestar, eventos y hospedaje en la naturaleza. Te escribiremos con los próximos eventos, retiros y lo que va pasando en la Finca.',
                    'Finca El Péndulo is a place in Tepatitlán de Morelos, Jalisco, for retreats, wellbeing, events and stays in nature. We will write with upcoming events, retreats and what is happening at the Finca.')) +
                p(S(f'Calificación de {r["rating"]} en Google, de {r["count"]} opiniones.', f'Rated {r["rating"]} on Google from {r["count"]} reviews.'), MUTED, 14, 0)) +
            tiles(lang) + up + quote(2, lang, '#ffffff' if up else ARENA) +
            deep_panel(S('Retiros', 'Retreats'), S('¿Facilitas retiros?', 'Do you lead retreats?'), retiros['includes'][lang],
                       button(S('Cotiza tu retiro', 'Get a retreat quote'), url('/retiros', lang), 'light') + button(S('Agenda una llamada', 'Book a call'), CALL, 'outline-light')) +
            question(lang, '40px 48px 40px'), marketing=True)

        # 07 Follow-up: sent by the workflow when the opportunity is still in "Nuevo lead" after 3 days.
        key = f'07-seguimiento-{lang}'
        subjects[key] = S('¿Seguimos platicando, {{contact.first_name}}?', 'Shall we keep talking, {{contact.first_name}}?')
        out[key] = email(lang, subjects[key], S('Si aún te interesa, responde a este correo y lo vemos juntos.', 'If you are still interested, reply to this email and we will look at it together.'),
            hero('seguimiento', S('Cabaña con ventanal frente al agavero', 'A cabin with a large window facing the agave'), 'Finca El Péndulo',
                 S('Seguimos aquí para ayudarte', 'We are still here to help')) +
            row(p(HI[lang]) +
                p(S('Hace unos días nos escribiste desde el sitio. Queremos saber si sigues pensando en venir a la Finca y si te falta algún dato para decidir.',
                    'A few days ago you wrote to us from the website. We would like to know if you are still thinking of coming to the Finca and whether you need anything else to decide.')) +
                p(S('Lo más fácil es una llamada corta: elige día y hora en el calendario y lo vemos juntos. También puedes responder a este correo o escribirnos por WhatsApp.',
                    'The easiest way is a short call: pick a day and time in the calendar and we will go through it together. You can also reply to this email or message us on WhatsApp.'), INK, 16, 24) +
                button(S('Agenda una llamada', 'Book a call'), CALL) +
                button(S('Escríbenos por WhatsApp', 'Message us on WhatsApp'), wa_link(lang), 'outline')) +
            quote(0, lang) + tiles(lang) +
            row(p(SIGN[lang], INK, 16, 0), '#ffffff', '8px 48px 40px'), marketing=True)

    # 00 Internal notification for the Finca team (Spanish only).
    key = '00-aviso-interno'
    subjects[key] = 'Nueva solicitud web: {{contact.name}}'
    out[key] = email('es', subjects[key], 'Nueva solicitud desde el sitio. Responde en las primeras 24 horas.',
        row(label('Solicitud desde el sitio') + h2('{{contact.name}}') +
            facts([('Correo', '{{contact.email}}'), ('WhatsApp', '{{contact.phone}}'), ('Interés', '{{contact.interest}}'),
                   ('Fechas', DATES), ('Personas', PEOPLE), ('Mensaje', MESSAGE)]) +
            p('Ya está en el pipeline <b>Clientes Web</b> como “Nuevo lead”. Escríbele o invítalo a agendar una llamada en el <a href="' + CALL + '">calendario “Cotiza tu retiro”</a>, y mueve la oportunidad a “Contactado”. La nota del contacto tiene todos los datos del formulario.', INK, 15, 24) +
            button('Abrir el contacto', GHL_CONTACT), '#ffffff', '8px 48px 40px'))
    return out, subjects

if __name__ == '__main__':
    out, subjects = build()
    for name, html in out.items():
        open(os.path.join(HERE, name + '.html'), 'w', encoding='utf-8').write(html)
    open(os.path.join(HERE, 'subjects.json'), 'w', encoding='utf-8').write(json.dumps(subjects, indent=1, ensure_ascii=False) + '\n')
    print(len(out), 'emails ->', HERE)
