// Site behaviour, no dependencies: external links, mobile menu, cookie consent,
// GA4 events, YouTube facade, reveal on scroll, sign-up and registration forms.
// Every block checks that its markup exists, so pages only pay for what they use.
(function () {
  'use strict';

  var body = document.body;
  var ES = document.documentElement.lang === 'es';
  function T(en, es) { return ES ? es : en; }
  var CONSENT_KEY = 'finca-el-pendulo-consent-v1'; // same key as boot.js
  var OWN_HOST = 'fincaelpendulo.com.mx';

  function readConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); } catch (e) { return null; }
  }
  function writeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  /* ---------- Links to other websites open in a new tab ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="http"]'), function (a) {
    var host;
    try { host = new URL(a.href).hostname; } catch (e) { return; }
    if (host === window.location.hostname || host === OWN_HOST) return;
    a.target = '_blank';
    var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
    if (rel.indexOf('noopener') < 0) rel.push('noopener');
    a.setAttribute('rel', rel.join(' '));
  });

  /* ---------- Header: dropdowns and the full-screen menu below 1360px ---------- */
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  var mobileQuery = window.matchMedia('(max-width: 1359px)');
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('[data-dropdown]'));
  function setDropdown(li, open) {
    li.classList.toggle('is-open', open);
    li.querySelector('button').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeDropdowns(except) { dropdowns.forEach(function (li) { if (li !== except) setDropdown(li, false); }); }
  dropdowns.forEach(function (li) {
    var btn = li.querySelector('button');
    btn.addEventListener('click', function () {
      var open = !li.classList.contains('is-open');
      if (!mobileQuery.matches) closeDropdowns(li);
      setDropdown(li, open);
    });
    li.addEventListener('keydown', function (e) { if (e.key === 'Escape' && li.classList.contains('is-open')) { setDropdown(li, false); btn.focus(); } });
    li.addEventListener('mouseleave', function () { if (!mobileQuery.matches) setDropdown(li, false); });
  });
  document.addEventListener('click', function (e) { if (!mobileQuery.matches && !e.target.closest('[data-dropdown]')) closeDropdowns(); });
  function setMenu(open, returnFocus) {
    header.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    var label = toggle.querySelector('.menu-toggle__label');
    if (label) label.textContent = open ? toggle.getAttribute('data-close') : toggle.getAttribute('data-open');
    if (open) {
      header.style.setProperty('--menu-top', header.getBoundingClientRect().bottom + 'px');
      var first = menu.querySelector('a, button'); if (first) first.focus();
    } else { closeDropdowns(); if (returnFocus) toggle.focus(); }
  }
  if (header && toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (!header.classList.contains('is-open')) return;
      if (e.key === 'Escape') { setMenu(false, true); return; }
      if (e.key !== 'Tab') return;
      var items = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])')))
        .filter(function (el) { return el.offsetParent !== null; });
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    mobileQuery.addEventListener('change', function () { setMenu(false); });
  }

  /* ---------- GA4 events (the tag loads in <head>, see boot.js) ---------- */
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var kind = a.getAttribute('data-track');
    var url = a.href;
    if (kind) track(kind + '_click', { link_url: url });
    else if (/wa\.me\//.test(url)) track('whatsapp_click', { link_url: url });
    else if (/instagram\.com/.test(url)) track('outbound_instagram', { link_url: url });
  });

  /* ---------- Cookie consent (pairs with CookieBanner.astro) ---------- */
  var banner = document.querySelector('[data-cookie-banner]');
  var options = document.querySelector('[data-cookie-options]');
  var consent = readConsent();
  function applyConsent(c) {
    window.gtag('consent', 'update', { analytics_storage: c.analytics ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  }
  function setCustomize(open) {
    options.hidden = !open;
    banner.querySelector('[data-cookie="customize"]').setAttribute('aria-expanded', open ? 'true' : 'false');
    banner.querySelector('[data-cookie="customize"]').hidden = open;
    banner.querySelector('[data-cookie="save"]').hidden = !open;
    if (open) options.analytics.focus();
  }
  function showBanner(customize) {
    banner.hidden = false;
    body.classList.add('banner-open');
    var c = consent || { analytics: false, media: false };
    options.analytics.checked = !!c.analytics;
    options.media.checked = !!c.media;
    setCustomize(!!customize);
  }
  function choose(c) {
    consent = { analytics: !!c.analytics, media: !!c.media, at: new Date().toISOString() };
    writeConsent(consent);
    applyConsent(consent);
    banner.hidden = true;
    body.classList.remove('banner-open');
  }
  if (banner && options) {
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cookie]');
      if (!btn) return;
      var action = btn.getAttribute('data-cookie');
      if (action === 'accept') choose({ analytics: true, media: true });
      else if (action === 'reject') choose({ analytics: false, media: false });
      else if (action === 'customize') setCustomize(true);
      else if (action === 'save') choose({ analytics: options.analytics.checked, media: options.media.checked });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cookie-settings]'), function (b) {
      b.addEventListener('click', function () { showBanner(true); });
    });
    if (consent) applyConsent(consent); else showBanner(false);
  }

  /* ---------- YouTube facade: youtube-nocookie iframe only after a click ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-youtube]');
    if (!el) return;
    if (!(consent && consent.media)) { if (banner) showBanner(true); return; }
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + el.getAttribute('data-youtube') + '?autoplay=1&rel=0';
    f.title = el.getAttribute('data-title') || 'Video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture';
    f.allowFullscreen = true;
    el.replaceWith(f);
    track('video_play', { video_id: el.getAttribute('data-youtube') });
  });


  /* ---------- Background video (Hero / PageHeader): pause button; still poster with reduced motion ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Gallery strip: the arrow buttons scroll by most of a screen and disable at the ends.
  Array.prototype.forEach.call(document.querySelectorAll('[data-gallery]'), function (g) {
    var track = g.querySelector('[data-gallery-track]');
    var prev = g.querySelector('[data-gallery-prev]');
    var next = g.querySelector('[data-gallery-next]');
    if (!track || !prev || !next) return;
    var smooth = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    function update() {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -track.clientWidth * 0.8, behavior: smooth }); });
    next.addEventListener('click', function () { track.scrollBy({ left: track.clientWidth * 0.8, behavior: smooth }); });
    track.addEventListener('scroll', update, { passive: true });
    update();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-bg-video]'), function (v) {
    var btn = v.parentNode.querySelector('[data-media-toggle]');
    function sync() { if (btn) { btn.setAttribute('aria-label', v.paused ? T('Play video', 'Reproducir video') : T('Pause video', 'Pausar video')); btn.setAttribute('data-paused', v.paused ? 'true' : 'false'); } }
    if (reduceMotion.matches) v.pause(); else { var p = v.play(); if (p && p.catch) p.catch(sync); }
    v.addEventListener('play', sync); v.addEventListener('pause', sync); sync();
    if (btn) btn.addEventListener('click', function () { if (v.paused) v.play(); else v.pause(); });
  });

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function post(endpoint, data) {
    return fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && j.ok !== false; }); })
      .catch(function () { return false; });
  }

  /* ---------- Request form → WhatsApp: <form data-wa-form data-wa="NUMBER"> ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-wa-form]'), function (f) {
    var es = f.getAttribute('data-lang') !== 'en';
    var sel = f.querySelector('[name="interest"]');
    try {
      var wanted = new URLSearchParams(window.location.search).get('interes');
      if (wanted && sel && sel.querySelector('option[value="' + wanted.replace(/[^a-z]/g, '') + '"]')) sel.value = wanted;
    } catch (e) {}
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      Array.prototype.forEach.call(f.querySelectorAll('[required]'), function (el) {
        var err = document.getElementById(el.id + '-error');
        var bad = !el.value.trim();
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (err) err.textContent = bad ? (es ? 'Este dato es necesario.' : 'This is required.') : '';
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) return;
      var v = function (n) { var el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      var topic = sel && sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : '';
      var lines = [
        (es ? 'Hola, soy ' : 'Hi, I am ') + v('name') + '.',
        (es ? 'Me interesa: ' : 'I am interested in: ') + topic,
      ];
      if (v('dates')) lines.push((es ? 'Fechas: ' : 'Dates: ') + v('dates'));
      if (v('people')) lines.push((es ? 'Personas: ' : 'People: ') + v('people'));
      if (v('message')) lines.push(v('message'));
      track('generate_lead', { method: 'whatsapp', interest: sel ? sel.value : '' });
      window.open('https://wa.me/' + f.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  });

  /* ---------- Newsletter: <form data-newsletter data-endpoint="WORKER" data-wa="NUMBER"> ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-newsletter]'), function (f) {
    var es = f.getAttribute('data-lang') !== 'en';
    var out = f.querySelector('[data-newsletter-status]');
    var nlStarted = f.querySelector('[name="_started"]');
    if (nlStarted) nlStarted.value = String(Date.now());
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = f.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { f.email.setAttribute('aria-invalid', 'true'); out.textContent = es ? 'Escribe un correo válido.' : 'Please enter a valid email.'; f.email.focus(); return; }
      f.email.setAttribute('aria-invalid', 'false');
      if (f.website && f.website.value) return;
      var endpoint = f.getAttribute('data-endpoint');
      track('sign_up', { method: endpoint ? 'form' : 'whatsapp' });
      try { localStorage.setItem('fp-newsletter-subscribed', String(Date.now() + 3650 * 864e5)); } catch (err) {}
      if (!endpoint) {
        window.open('https://wa.me/' + f.getAttribute('data-wa') + '?text=' + encodeURIComponent((es ? 'Hola, quiero recibir el newsletter de la Finca. Mi correo: ' : 'Hi, I would like to get the Finca newsletter. My email: ') + email), '_blank', 'noopener');
        out.textContent = es ? 'Gracias. Envía el mensaje de WhatsApp para confirmar.' : 'Thank you. Send the WhatsApp message to confirm.';
        return;
      }
      out.textContent = es ? 'Enviando…' : 'Sending…';
      fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(); out.textContent = es ? 'Gracias, ya estás en la lista.' : 'Thank you, you are on the list.'; f.reset(); })
        .catch(function () { out.textContent = es ? 'No se pudo enviar. Inténtalo de nuevo.' : 'It could not be sent. Please try again.'; });
    });
  });

  /* ---------- Newsletter pop-up: once per visit (after 25 s or half the page); never after signing up ---------- */
  var popup = document.querySelector('[data-newsletter-popup]');
  if (popup && typeof popup.showModal === 'function') {
    var subscribed = 0, seenThisVisit = false;
    try { subscribed = Number(localStorage.getItem('fp-newsletter-subscribed') || 0); } catch (err) {}
    try { seenThisVisit = sessionStorage.getItem('fp-newsletter-popup') === '1'; } catch (err) {}
    if (Date.now() > subscribed && !seenThisVisit) {
      var shown = false;
      var show = function () {
        if (shown || body.classList.contains('banner-open') || body.classList.contains('menu-open') || document.querySelector('dialog[open]')) return;
        shown = true;
        try { sessionStorage.setItem('fp-newsletter-popup', '1'); } catch (err) {}
        popup.showModal();
        track('newsletter_popup_view');
      };
      setTimeout(show, 25000);
      window.addEventListener('scroll', function onS() {
        if (window.scrollY > (document.documentElement.scrollHeight - window.innerHeight) * 0.5) { window.removeEventListener('scroll', onS); show(); }
      }, { passive: true });
      popup.querySelector('[data-newsletter-close]').addEventListener('click', function () { popup.close(); });
      popup.addEventListener('click', function (e) { if (e.target === popup) popup.close(); });
    }
  }

  /* ---------- CRM forms: <form data-crm-form="retiro|evento|boda|contacto|voluntariado" action="WORKER"> ----------
     Posts to the Worker (→ GHL, tag web-<form>). Without an action (Worker not connected yet) the answers
     go out by WhatsApp instead, so no request is lost. */
  var turnstileLoaded = false;
  function loadTurnstile() {
    if (turnstileLoaded || !document.querySelector('form[data-crm-form] .cf-turnstile')) return;
    turnstileLoaded = true;
    window.onTurnstileLoad = function () {
      Array.prototype.forEach.call(document.querySelectorAll('form[data-crm-form] .cf-turnstile'), function (box) {
        if (!box.hasChildNodes()) box.setAttribute('data-widget', window.turnstile.render(box, { sitekey: box.getAttribute('data-sitekey'), size: 'flexible', theme: 'light', language: ES ? 'es' : 'auto' }));
      });
    };
    var ts = document.createElement('script');
    ts.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
    ts.async = true;
    document.head.appendChild(ts);
  }
  Array.prototype.forEach.call(document.querySelectorAll('form[data-crm-form]'), function (form) {
    var status = form.querySelector('[data-form-status]');
    var started = form.querySelector('[name="_started"]');
    if (started) started.value = String(Date.now());
    var interest = form.querySelector('select[name="interest"]');
    try {
      var wanted = new URLSearchParams(window.location.search).get('interes');
      if (wanted && interest && interest.querySelector('option[value="' + wanted.replace(/[^a-z]/g, '') + '"]')) interest.value = wanted;
    } catch (e) { /* old browser */ }
    if ('IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (en) { if (en.some(function (x) { return x.isIntersecting; })) { loadTurnstile(); tio.disconnect(); } }, { rootMargin: '600px' });
      tio.observe(form);
    }
    form.addEventListener('focusin', loadTurnstile);

    function fieldError(input) {
      var v = (input.value || '').trim();
      if (input.type === 'checkbox') return input.required && !input.checked ? T('Please confirm to continue.', 'Confirma para continuar.') : '';
      if (input.required && !v) return T('This is required.', 'Este dato es necesario.');
      if (input.name === 'name' && v.length < 2) return T('Please write your full name.', 'Escribe tu nombre completo.');
      if (input.name === 'email' && !EMAIL_RE.test(v)) return T('Please write an email address like name@example.com.', 'Escribe un correo como nombre@ejemplo.com.');
      if (input.name === 'phone' && v && !/^\+?[0-9\s().-]{7,20}$/.test(v)) return T('Please write your number with the country code.', 'Escribe tu número con código de país.');
      if (input.name === 'age' && v && Number(v) < 18) return T('You must be 18 or older.', 'Debes ser mayor de edad.');
      return '';
    }
    function showError(input, msg) {
      var err = document.getElementById(input.id + '-error');
      if (err) err.textContent = msg;
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    function setStatus(state, html) { status.setAttribute('data-state', state); status.innerHTML = html; }
    var fields = Array.prototype.slice.call(form.querySelectorAll('[required], [name="email"], [name="phone"]'));
    fields.forEach(function (input) {
      input.addEventListener('blur', function () { if (input.value) showError(input, fieldError(input)); });
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) showError(input, fieldError(input)); });
    });
    function labelOf(el) {
      var l = el.id && form.querySelector('label[for="' + el.id + '"]');
      return l ? l.textContent.replace(/\s*\*$/, '').trim() : el.name;
    }
    function asWhatsApp() {
      var lines = [T('Hi, this is my request from the website:', 'Hola, esta es mi solicitud desde el sitio web:')];
      var seen = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'hidden' || el.name === 'website' || el.name === 'terms' || el.type === 'submit') return;
        if (el.type === 'checkbox') {
          if (!el.checked || seen[el.name]) return;
          seen[el.name] = true;
          var vals = Array.prototype.map.call(form.querySelectorAll('[name="' + el.name + '"]:checked'), function (x) { return x.value; });
          lines.push(T('Areas: ', 'Áreas: ') + vals.join(', '));
          return;
        }
        var v = el.tagName === 'SELECT' ? (el.selectedIndex > 0 ? el.options[el.selectedIndex].text : '') : el.value.trim();
        if (v) lines.push(labelOf(el) + ': ' + v);
      });
      return 'https://wa.me/' + form.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.website && form.website.value) return;
      var firstBad = null;
      fields.forEach(function (input) { var m = fieldError(input); showError(input, m); if (m && !firstBad) firstBad = input; });
      if (firstBad) { setStatus('error', T('<p>Some details need a second look.</p>', '<p>Algunos datos necesitan revisión.</p>')); firstBad.focus(); return; }
      var kind = form.getAttribute('data-crm-form');
      var endpoint = form.getAttribute('action');
      if (!endpoint) {
        track('generate_lead', { method: 'whatsapp', form: kind });
        window.open(asWhatsApp(), '_blank', 'noopener');
        setStatus('ok', T('<p>WhatsApp opened with your answers. Send the message and we will reply soon.</p>', '<p>Se abrió WhatsApp con tus respuestas. Envía el mensaje y te responderemos pronto.</p>'));
        return;
      }
      var data = new FormData(form);
      if (interest && interest.value) data.set('interest', interest.options[interest.selectedIndex].text);
      data.set('language', ES ? 'es' : 'en');
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      setStatus('sending', T('<p>Sending…</p>', '<p>Enviando…</p>'));
      post(endpoint, data).then(function (ok) {
        if (ok) {
          track('generate_lead', { method: 'form', form: kind });
          window.location.href = (body.getAttribute('data-base') || '') + (ES ? '/gracias' : '/en/thank-you') + '?f=' + encodeURIComponent(kind);
          form.reset();
          if (started) started.value = String(Date.now());
          setStatus('ok', kind === 'voluntariado'
            ? T('<p>Thank you. We have your application and will write to you soon.</p>', '<p>Gracias. Recibimos tu aplicación y te escribiremos pronto.</p>')
            : T('<p>Thank you. We have your request and will write back soon.</p>', '<p>Gracias. Recibimos tu solicitud y te escribiremos pronto.</p>'));
        } else {
          setStatus('error', T('<p>We could not send your request just now. <a href="' + asWhatsApp() + '">Send it on WhatsApp</a>.</p>', '<p>No pudimos enviar tu solicitud. <a href="' + asWhatsApp() + '">Envíala por WhatsApp</a>.</p>'));
        }
        btn.disabled = false;
        var box = form.querySelector('.cf-turnstile');
        if (window.turnstile && box) try { window.turnstile.reset(box.getAttribute('data-widget') || undefined); } catch (err) { /* ignore */ }
        status.focus();
      });
    });
  });

  /* ---------- Thank-you page: show the line for the form that sent the visitor here ---------- */
  var thanksKey = new URLSearchParams(window.location.search).get('f');
  var thanks = thanksKey && document.querySelector('[data-thanks="' + thanksKey.replace(/[^a-z]/g, '') + '"]');
  if (thanks) { thanks.hidden = false; document.querySelector('[data-thanks-default]').hidden = true; }

  /* ---------- Photo viewer: links with [data-lightbox] open full screen, grouped by its value ---------- */
  var lbLinks = document.querySelectorAll('a[data-lightbox]');
  if (lbLinks.length) {
    var lb = document.createElement('dialog');
    lb.className = 'lightbox';
    lb.setAttribute('aria-label', T('Photo viewer', 'Visor de fotos'));
    lb.innerHTML = '<figure class="lightbox__fig"><img class="lightbox__img" alt=""><figcaption class="lightbox__cap"></figcaption></figure>' +
      '<button type="button" class="lightbox__btn lightbox__close" aria-label="' + T('Close', 'Cerrar') + '">×</button>' +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="' + T('Previous photo', 'Foto anterior') + '">‹</button>' +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="' + T('Next photo', 'Foto siguiente') + '">›</button>' +
      '<p class="lightbox__count" aria-live="polite"></p>';
    body.appendChild(lb);
    var lbImg = lb.querySelector('.lightbox__img'), lbCap = lb.querySelector('.lightbox__cap'), lbCount = lb.querySelector('.lightbox__count');
    var lbGroup = [], lbIndex = 0, lbOpener = null;
    function lbShow(i) {
      lbIndex = (i + lbGroup.length) % lbGroup.length;
      var a = lbGroup[lbIndex];
      lbImg.src = a.href;
      lbImg.alt = a.getAttribute('data-caption') || '';
      lbCap.textContent = a.getAttribute('data-caption') || '';
      lbCount.textContent = lbGroup.length > 1 ? (lbIndex + 1) + ' / ' + lbGroup.length : '';
      lb.classList.toggle('lightbox--single', lbGroup.length < 2);
      var nxt = lbGroup[(lbIndex + 1) % lbGroup.length];
      if (nxt && nxt !== a) { var pre = new Image(); pre.src = nxt.href; }
    }
    Array.prototype.forEach.call(lbLinks, function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        var name = a.getAttribute('data-lightbox');
        lbGroup = Array.prototype.filter.call(document.querySelectorAll('a[data-lightbox]'), function (x) { return x.getAttribute('data-lightbox') === name; });
        lbOpener = a;
        lbShow(lbGroup.indexOf(a));
        if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
        body.classList.add('lightbox-open');
      });
    });
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { lbShow(lbIndex - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { lbShow(lbIndex + 1); });
    lb.querySelector('.lightbox__close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__fig')) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
      if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
    });
    var touchX = null;
    lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 40) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    });
    lb.addEventListener('close', function () { body.classList.remove('lightbox-open'); lbImg.removeAttribute('src'); if (lbOpener) lbOpener.focus(); });
  }

  /* ---------- Sections and cards fade up as they come into view (not for reduced motion) ---------- */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var revealSel = 'main > section > .wrap, main > section > .grid, main > nav > .wrap, main > .photo-row > *, .card, .tile, .fp-space, .exp-item, .space-detail, .stay, .photo-wall li, .fp-exp__col, .ms-guide__text, .loc > *, .nl-banner__inner > *';
    var revealEls = Array.prototype.filter.call(document.querySelectorAll(revealSel), function (el) {
      // Tall blocks (taller than the screen) stay put; their cards animate instead.
      var r = el.getBoundingClientRect();
      return !el.closest('.ms-hero') && r.height < window.innerHeight && r.top > window.innerHeight * 0.9;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    revealEls.forEach(function (el) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--reveal-delay', Math.min(sib % 4, 3) * 90 + 'ms');
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();
