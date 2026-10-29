// Receives the website forms, checks them again on the server (fields, honeypot,
// time to submit, Cloudflare Turnstile) and saves the lead in GoHighLevel through
// its API. POST /           registration / contact form (Turnstile required)
//      POST /subscribe  newsletter-style sign-ups (email only, no captcha)
// Each lead is upserted, its custom fields filled, then tagged; the tag starts a
// GHL workflow (Contact Tag trigger is free). Secrets live in Cloudflare only.

const GHL = 'https://services.leadconnectorhq.com';
const GHL_HEADERS = (token) => ({
  Authorization: `Bearer ${token}`,
  Version: '2021-07-28',
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s().-]{7,20}$/;
const MIN_SECONDS = 3;
// Each website form tags the contact web-<form>; that tag starts the form's workflow in GHL
// (Contact Tag trigger). Forms not listed here are refused.
const FORMS = {
  retiro: 'web-retiro', // /retiros, Informes
  evento: 'web-evento', // /eventos and each event page (campamentos, conciertos, cenas, festivales)
  boda: 'web-boda', // /bodas
  contacto: 'web-contacto', // /contacto
  voluntariado: 'web-voluntariado', // /voluntariado, application
};

// Contact custom fields, found by name or created if missing, cached while the Worker is warm.
// Add one entry per value the GHL emails need ({{contact.<field_key>}}).
const FIELDS = {
  interest: { name: 'Interest', dataType: 'TEXT' },
  message: { name: 'Website message', dataType: 'LARGE_TEXT' },
  // Retreat, event, wedding and contact forms.
  dates: { name: 'Requested dates', dataType: 'TEXT' },
  people: { name: 'Number of people', dataType: 'NUMERICAL' },
  // Volunteer application (/voluntariado).
  age: { name: 'Volunteer age', dataType: 'NUMERICAL' },
  city: { name: 'Volunteer city and country', dataType: 'TEXT' },
  languages: { name: 'Volunteer languages', dataType: 'TEXT' },
  arrival: { name: 'Volunteer arrival date', dataType: 'TEXT' },
  duration: { name: 'Volunteer stay length', dataType: 'TEXT' },
  areas: { name: 'Volunteer areas', dataType: 'LARGE_TEXT' },
  skills: { name: 'Volunteer skills', dataType: 'LARGE_TEXT' },
  motivation: { name: 'Volunteer motivation', dataType: 'LARGE_TEXT' },
  heard: { name: 'How they heard about us', dataType: 'TEXT' },
};

// Sign-up lists for /subscribe: form field list=<key>.
const LISTS = {
  newsletter: { tag: 'newsletter', source: 'website newsletter' },
};

let fieldIds = null;
async function ensureFields(env) {
  if (fieldIds) return fieldIds;
  const base = `${GHL}/locations/${env.GHL_LOCATION_ID}/customFields`;
  const list = await fetch(base, { headers: GHL_HEADERS(env.GHL_TOKEN) }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!list) return null;
  const ids = {};
  for (const [key, def] of Object.entries(FIELDS)) {
    const found = (list.customFields || []).find((f) => f.name.toLowerCase() === def.name.toLowerCase());
    if (found) { ids[key] = found.id; continue; }
    const made = await fetch(base, { method: 'POST', headers: GHL_HEADERS(env.GHL_TOKEN), body: JSON.stringify({ ...def, model: 'contact' }) })
      .then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if (made?.customField?.id) ids[key] = made.customField.id;
  }
  // Only remember a complete set, so a field that failed is tried again next time.
  if (Object.keys(ids).length === Object.keys(FIELDS).length) fieldIds = ids;
  return ids;
}

// Upsert replaces every tag on the contact, so tags always go through their own endpoint.
function tags(env, contactId, method, list) {
  return fetch(`${GHL}/contacts/${contactId}/tags`, { method, headers: GHL_HEADERS(env.GHL_TOKEN), body: JSON.stringify({ tags: list }) })
    .then((r) => r.ok)
    .catch(() => false);
}

function upsert(env, body) {
  return fetch(`${GHL}/contacts/upsert`, {
    method: 'POST',
    headers: GHL_HEADERS(env.GHL_TOKEN),
    body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, ...body }),
  }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
}

const isBot = (form) => {
  const started = Number(form.get('_started') || 0);
  return String(form.get('website') || '') || !started || Date.now() - started < MIN_SECONDS * 1000;
};

async function subscribe(form, env, headers) {
  // Bots get "ok" so they learn nothing.
  if (isBot(form)) return reply({ ok: true }, 200, headers);
  const email = String(form.get('email') || '').trim().slice(0, 160);
  const list = LISTS[String(form.get('list') || '')];
  if (!list) return reply({ ok: false, error: 'list' }, 400, headers);
  if (!EMAIL_RE.test(email)) return reply({ ok: false, errors: { email: 'invalid' } }, 422, headers);
  const name = String(form.get('name') || '').trim().slice(0, 120);
  const [firstName, ...rest] = name ? name.split(/\s+/) : [];
  const res = await upsert(env, { email, ...(firstName ? { firstName, lastName: rest.join(' ') } : {}), source: `${env.SOURCE} ${list.source}` });
  const contactId = res?.contact?.id;
  if (!contactId) return reply({ ok: false, error: 'crm' }, 502, headers);
  const language = String(form.get('language') || '').slice(0, 5);
  // lang-es / lang-en picks the email language in the GHL workflow.
  await tags(env, contactId, 'POST', [list.tag, ...(['es', 'en'].includes(language) ? [`lang-${language}`] : [])]);
  return reply({ ok: true }, 200, headers);
}

function cors(origin, allowed) {
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function reply(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
    const origin = request.headers.get('Origin') || '';
    const headers = cors(origin, allowed);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return reply({ ok: false, error: 'method' }, 405, headers);
    if (origin && !allowed.includes(origin)) return reply({ ok: false, error: 'origin' }, 403, headers);

    let form;
    try { form = await request.formData(); } catch { return reply({ ok: false, error: 'body' }, 400, headers); }

    if (new URL(request.url).pathname === '/subscribe') return subscribe(form, env, headers);
    if (isBot(form)) return reply({ ok: true }, 200, headers);

    const get = (k, max) => String(form.get(k) || '').trim().slice(0, max);
    const lead = {
      name: get('name', 120),
      email: get('email', 160),
      phone: get('phone', 24),
      interest: get('interest', 120),
      message: get('message', 2000),
      language: get('language', 5),
      form: get('form', 20),
      dates: get('dates', 120),
      people: get('people', 4),
      age: get('age', 3),
      city: get('city', 120),
      languages: get('languages', 120),
      arrival: get('arrival', 20),
      duration: get('duration', 20),
      areas: form.getAll('areas').map((v) => String(v).slice(0, 60)).slice(0, 12).join(', '),
      skills: get('skills', 2000),
      motivation: get('motivation', 2000),
      heard: get('heard', 60),
      terms: get('terms', 5),
    };
    const errors = {};
    if (lead.name.length < 2) errors.name = 'required';
    if (!EMAIL_RE.test(lead.email)) errors.email = 'invalid';
    if (!PHONE_RE.test(lead.phone)) errors.phone = 'invalid';
    if (!FORMS[lead.form]) errors.form = 'unknown';
    if (lead.form === 'voluntariado') {
      if (!(Number(lead.age) >= 18)) errors.age = 'invalid';
      for (const k of ['city', 'arrival', 'duration', 'skills', 'motivation']) if (!lead[k]) errors[k] = 'required';
      if (lead.terms !== 'yes') errors.terms = 'required';
    }
    if (Object.keys(errors).length) return reply({ ok: false, errors }, 422, headers);

    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: get('cf-turnstile-response', 2048), remoteip: request.headers.get('CF-Connecting-IP') || '' }),
    }).then((r) => r.json()).catch(() => ({ success: false }));
    if (!check.success) return reply({ ok: false, error: 'captcha' }, 403, headers);

    const [firstName, ...rest] = lead.name.split(/\s+/);
    const ids = (await ensureFields(env)) || {};
    const values = { interest: lead.interest, message: lead.message, dates: lead.dates, people: lead.people && Number(lead.people), age: lead.age && Number(lead.age), city: lead.city, languages: lead.languages, arrival: lead.arrival, duration: lead.duration, areas: lead.areas, skills: lead.skills, motivation: lead.motivation, heard: lead.heard };
    const customFields = Object.entries(values)
      .filter(([key, value]) => ids[key] && value !== '' && value != null)
      .map(([key, value]) => ({ id: ids[key], field_value: value }));
    const saved = await upsert(env, {
      firstName,
      lastName: rest.join(' '),
      name: lead.name,
      email: lead.email,
      ...(lead.phone ? { phone: lead.phone } : {}),
      source: `${env.SOURCE} ${lead.form} form`,
      ...(customFields.length ? { customFields } : {}),
    });
    const contactId = saved?.contact?.id;
    if (!contactId) return reply({ ok: false, error: 'crm' }, 502, headers);

    // Fields first, then tags. Removing the trigger tag before adding it again makes
    // the workflow start for repeat requests too.
    const trigger = FORMS[lead.form];
    await tags(env, contactId, 'DELETE', [trigger]);
    const extra = [...(lead.interest ? [`interest: ${lead.interest}`] : []), ...(lead.language ? [`lang-${lead.language}`] : [])];
    if (extra.length) await tags(env, contactId, 'POST', extra);
    await tags(env, contactId, 'POST', [trigger]);

    const note = [
      `Website form: ${lead.form} (${new Date().toISOString().slice(0, 10)})`,
      `Interest: ${lead.interest || 'not chosen'}`,
      `Phone: ${lead.phone}`,
      ...(lead.dates || lead.people ? [`Dates: ${lead.dates || '?'} · People: ${lead.people || '?'}`] : []),
      ...(lead.form === 'voluntariado' ? [
        `Age: ${lead.age} · Lives in: ${lead.city} · Languages: ${lead.languages || '?'}`,
        `Arrival: ${lead.arrival} · Stay: ${lead.duration} month(s)`,
        `Areas: ${lead.areas || 'none chosen'}`,
        `Heard about us: ${lead.heard || '?'}`,
        '', 'Skills:', lead.skills, '', 'Why the Finca:', lead.motivation,
        '', 'Accepted the conditions (1 month min., 5 h/day, 6 days/week, $2,000 MXN/month, insurance).',
      ] : []),
      '',
      lead.message || (lead.form === 'voluntariado' ? '' : '(no message)'),
    ].join('\n');
    // The contact is already saved; a failed note should not show the visitor an error.
    await fetch(`${GHL}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: GHL_HEADERS(env.GHL_TOKEN),
      body: JSON.stringify({ body: note }),
    }).catch(() => null);

    return reply({ ok: true }, 200, headers);
  },
};
