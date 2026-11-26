# Builds the thank-you newsletter for the people who came to the Suprahumano event at the Finca: 15% off lodging
# booked in 2026 (applied on WhatsApp), the two New Year options, a Google review request and retreats.
# Same look and helpers as build.py; photos come from suprahumano-images.mjs. New Year prices: Carlos
# (flyers in the design canvas "Flyer Año Nuevo"; $700 per person for the celebration without lodging). No medicines named.
# Run: python3 worker/emails/suprahumano.py   → worker/emails/suprahumano/gracias.html + subjects.json
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build import (AGAVE_DEEP, ARENA, CALL, CORN, IMG, INK, LINE, MUTED, SERIF, button, email, h2, hero, label, p,
                   proximos, question, row, site, url, wa_link)

OUT = os.path.join(HERE, 'suprahumano')
LANG = 'es'
HI = 'Hola, {{contact.first_name}}:'
SIGN = 'Con cariño,<br>Finca El Péndulo'
REVIEW = 'https://search.google.com/local/writereview?placeid=ChIJl-SHxpfZKIQR9TSdabRfndk'  # opens the review form
NEW_YEAR = next(e for e in proximos if e['date'] == '2026-12-31')
# Price per person by room and people in it, from Carlos's New Year flyers (design canvas "Flyer Año Nuevo").
ONE_NIGHT = [('Deluxe', [3940, 2320]), ('Privada', [3340, 2020]), ('Aldea', [3460, 2080, 1820, 1690]), ('Hostal', [1650])]
money = lambda n: f'${n:,.0f}'

def photo(name, alt):
    # Full-width photo between blocks.
    return f'<tr><td style="padding:0;"><img src="{IMG}{name}.jpg" width="600" alt="{alt}" style="width:100%;max-width:600px;height:auto;"></td></tr>\n'

def grid(items, width):
    # Photos side by side (stack on phones via .col): [(img, alt, caption or '')].
    n = len(items)
    cell = lambda i, img, alt, cap: (
        f'<td class="col" width="{100 // n}%" valign="top" style="padding:0 {0 if i == n - 1 else 6}px 0 {0 if i == 0 else 6}px;">'
        f'<img src="{IMG}{img}.jpg" width="{width}" alt="{alt}" style="width:100%;height:auto;margin:0 0 {10 if cap else 0}px;">'
        + (f'<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:{MUTED};">{cap}</p>' if cap else '') + '</td>')
    return (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;margin:8px 0 0;"><tr>'
            + ''.join(cell(i, *x) for i, x in enumerate(items)) + '</tr></table>\n')

def package(img, alt, kicker, name, price, unit, text):
    return (f'<img src="{IMG}{img}.jpg" width="244" alt="{alt}" style="width:100%;height:auto;margin:0 0 16px;">'
            f'<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:{MUTED};">{kicker}</p>'
            f'<p style="margin:0 0 6px;{SERIF}font-size:24px;line-height:1.15;color:{INK};">{name}</p>'
            f'<p style="margin:0 0 2px;{SERIF}font-size:30px;line-height:1.1;color:{INK};">{price}</p>'
            f'<p style="margin:0 0 10px;font-size:13px;color:{MUTED};">{unit}</p>'
            f'<p style="margin:0;font-size:15px;line-height:1.55;color:{MUTED};">{text}</p>')

def matrix(rows):
    # Price per person by room and number of people in the room: [(room, [1p, 2p, 3p, 4p] with None for n/a)].
    th = lambda t, a='right': (f'<td align="{a}" style="padding:0 0 10px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;'
                              f'color:{MUTED};text-align:{a};">{t}</td>')
    td = lambda n: (f'<td align="right" style="padding:12px 0 12px 6px;border-top:1px solid {LINE};text-align:right;white-space:nowrap;'
                    f'{SERIF}font-size:17px;color:{INK if n else MUTED};">{money(n) if n else "—"}</td>')
    head = '<tr>' + th('Habitación', 'left') + ''.join(th(f'{i} pers.') for i in range(1, 5)) + '</tr>'
    body = ''.join(f'<tr><td style="padding:12px 0;border-top:1px solid {LINE};{SERIF}font-size:17px;color:{INK};">{room}</td>'
                   + ''.join(td(n) for n in (ps + [None] * 4)[:4]) + '</tr>' for room, ps in rows)
    return (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
            f'style="margin:0 0 12px;border-bottom:1px solid {LINE};">{head}{body}</table>\n')

def two_packages(a, b):
    return (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;margin:8px 0 28px;"><tr>'
            f'<td class="col" width="50%" valign="top" style="padding:0 10px 24px 0;">{a}</td>'
            f'<td class="col" width="50%" valign="top" style="padding:0 0 24px 10px;">{b}</td></tr></table>\n')

discount = row(
    label('Solo para quienes vinieron', '#f1d9b9') +
    f'<p style="margin:0 0 4px;{SERIF}font-size:96px;line-height:1;color:#ffffff;">15%</p>\n' +
    h2('de descuento en hospedaje', '#ffffff') +
    p('Quédate una noche o un fin de semana en la Finca. El descuento aplica en tus reservas de hospedaje durante 2026, también en Año Nuevo: '
      'escríbenos por WhatsApp, cuéntanos que estuviste en Suprahumano y te lo aplicamos.', '#ffffff', 16, 28) +
    button('Reserva por WhatsApp', wa_link(LANG), 'light'), AGAVE_DEEP, '44px 48px')

small = lambda t: p(t, MUTED, 14, 28)
new_year = row(
    label('31 de diciembre de 2026') + h2('Celebra Año Nuevo en la Finca') +
    p('Despide el año entre agaves, con una cena especial y fogata bajo las estrellas. Ven a la cena y la celebración, '
      'o quédate a dormir y amanece el 1 de enero en la Finca. Tu 15% de descuento también aplica aquí.', mb=16) +
    two_packages(
        package('an-salon', 'Sala con techo de palapa en la Finca', '1 noche · 31 dic–1 ene', 'Año Nuevo con hospedaje',
                money(1650), 'desde, por persona',
                'Cena de año nuevo, celebración con fogata, concierto "Mitos y mantras" y una noche en la Finca, con alimentos.'),
        package('an-cena-velas', 'Cena a la luz de las velas en la Finca', 'Sin hospedaje', 'Solo el festejo',
                money(700), 'por persona', 'Cena y celebración de Año Nuevo el 31 de diciembre, a partir de las 6:00 pm, sin quedarte a dormir.')) +
    grid([('an-circulo-fuego', 'Círculo de fuego al anochecer', 'Celebración con fogata'),
          ('an-concierto', 'Público en un concierto de noche', 'Mitos y mantras')], 244) +
    '<div style="height:28px;line-height:28px;font-size:0;">&nbsp;</div>' +
    label('1 noche · precio por persona') + matrix(ONE_NIGHT) +
    small('Según la habitación y cuántas personas la comparten. ¿Te quedas más? Agrega una noche extra desde $950 por persona, también con alimentos.') +
    button('Aparta tu lugar', NEW_YEAR['link']), ARENA, '40px 48px')

rating = site['reviews']
review = row(
    label('Tu opinión') +
    f'<p style="margin:0 0 6px;font-size:28px;letter-spacing:4px;color:{CORN};">★★★★★</p>\n' +
    p(f'{rating["rating"]} de 5 en Google, de {rating["count"]} opiniones', MUTED, 14, 20) +
    h2('¿Nos dejas una reseña en Google?') +
    p('Si disfrutaste Suprahumano, cuéntalo en Google. Toma un minuto y ayuda a que más personas encuentren la Finca.', mb=24) +
    button('Escribe tu reseña', REVIEW), '#ffffff', '40px 48px')

retreats = row(
    label('Retiros') + h2('¿Y si tu próximo retiro es en la Finca?') +
    p('Si facilitas o quieres organizar un retiro, la Finca es para tu grupo: hospedaje, tres alimentos al día, coffee break y uso de los espacios, '
      'a una hora de Guadalajara. Nos encargamos de los detalles para que tú te enfoques en tu grupo.', mb=16) +
    grid([('ret-osho', 'Círculo de un grupo en el Osho Hut', 'Osho Hut'),
          ('ret-agora', 'Salón Ágora Gnosis con mesa para el grupo', 'Ágora Gnosis'),
          ('ret-cena', 'Cena de un grupo de retiro a la luz de las velas', 'Cenas de grupo')], 160) +
    '<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>' +
    button('Cotiza tu retiro', CALL) + button('Ver los espacios', url('/espacios', LANG), 'outline'), ARENA, '40px 48px')

SUBJECT = 'Gracias por venir a Suprahumano'
PREVIEW = '15% de descuento en hospedaje, Año Nuevo en la Finca y algo más.'
BODY = (
    hero('supra-hero', 'Danza de listones frente a la palapa durante Suprahumano', 'Suprahumano · Gracias', 'Gracias por venir a la Finca') +
    row(p(HI) +
        p('Gracias por ser parte de Suprahumano. Fue un gusto recibirte en Finca El Péndulo: las conferencias, meditaciones, el árbol de la vida, '
          'danzas de paz universal, ceremonia de cacao, constelaciones con caballos y todo lo que compartimos juntos.') +
        p('Queremos que vuelvas, así que te dejamos algo especial.', mb=8) +
        grid([('supra-ceremonia', 'Ceremonia de apertura al atardecer', ''),
              ('supra-listones', 'Listones de colores del árbol de la vida', ''),
              ('supra-relajacion', 'Meditación recostados en el pasto', '')], 160)) +
    photo('hosp-cabana', 'Cabaña con techo de palapa y ventanal frente al agavero') + discount +
    photo('an-fuego', 'Espectáculo de fuego de noche en la Finca') + new_year +
    review +
    photo('supra-caballos', 'Asistentes de Suprahumano junto al corral de los caballos') + retreats +
    row(p(SIGN, size=16, mb=0), '#ffffff', '36px 48px 8px') + question(LANG))

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'gracias.html'), 'w', encoding='utf-8').write(email(LANG, SUBJECT, PREVIEW, BODY, marketing=True))
    open(os.path.join(OUT, 'subjects.json'), 'w', encoding='utf-8').write(json.dumps({'gracias': SUBJECT}, indent=1, ensure_ascii=False) + '\n')
    print(SUBJECT)
