// Builds the static site from src/content.mjs, in two languages:
//   Italian (default) → site root  (index.html, rooms.html, …)
//   English           → /en/       (en/index.html, en/rooms.html, …)
//
//   node tools/images.mjs   — first time / when photos change
//   node tools/build.mjs    — whenever content changes
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, images, rooms, gallery, reviews, nearby, amenities, suitesIntro, it as IT } from '../src/content.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// ?v=<content hash> so browsers fetch CSS/JS again after every change
const ver = (p) => `${p}?v=${createHash('md5').update(readFileSync(join(root, p))).digest('hex').slice(0, 8)}`;
const manifest = JSON.parse(readFileSync(join(root, 'assets/images/manifest.json'), 'utf8'));
const YEAR = 2026;
const LANGS = ['it', 'en'];

// ── language state ─────────────────────────────────────────────────────────
let LANG = 'it';
let B = '';                                   // path prefix to the site root ('' or '../')
const t = (en, it) => (LANG === 'it' ? it : en);
const loc = (v) => (v && typeof v === 'object' ? v[LANG] ?? '' : v ?? '');
const need = (v, what) => { if (v === undefined || v === null || v === '') throw new Error(`Missing Italian translation: ${what}`); return v; };
const alt = (key) => { const a = LANG === 'it' ? need(IT.alts[key], `it.alts.${key}`) : images[key].alt; return a; };
const roomT = (r0) => {
  const r = LANG === 'it' ? { ...r0, ...need(IT.rooms[r0.slug], `it.rooms.${r0.slug}`) } : { ...r0 };
  return { ...r, cardName: r.cardName || r.name, pageTitle: r.pageTitle || r.name, bookingName: r.bookingName || r.name };
};
const nearbyT = () => (LANG === 'it' ? nearby.map((n, i) => need(IT.nearby[i], `it.nearby[${i}]`)) : nearby);
const reviewMeta = (r) => (LANG === 'it' ? need(IT.reviewMeta[r.name], `it.reviewMeta.${r.name}`) : r.meta);

// ── helpers ────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isPh = (s) => typeof s === 'string' && s.trim().startsWith('[');
const has = (v) => { const x = loc(v); return typeof x === 'string' && x.trim() !== '' && !isPh(x); };
const pad = (n) => String(n).padStart(2, '0');

function src(key, w = 960) {
  const m = manifest[key];
  if (!m) throw new Error(`Unknown image ${key}`);
  return B + (m.files.find((f) => f.w >= w) || m.files.at(-1)).path;
}
const srcset = (key) => manifest[key].files.map((f) => `${B}${f.path} ${f.w}w`).join(', ');
// sizes for full-viewport "cover" images: when the screen is narrower than the photo's proportions
// (e.g. a landscape photo on a phone) the browser needs width = viewport height × aspect ratio.
const coverSizes = (key) => { const m = manifest[key]; return `(max-aspect-ratio: ${m.w}/${m.h}) ${Math.ceil((100 * m.w) / m.h)}vh, 100vw`; };
const isAi = (key) => !!images[key]?.ai;
const aiLabel = () => '';
const aiBadge = (...keys) => (site.production && aiLabel() && keys.some(isAi) ? `<span class="ai-badge">${aiLabel()}</span>` : ''); // no empty badge box
// blurred placeholder shown by .media until the real image has loaded
const lq = (key) => (manifest[key]?.lqip ? `--lqip:url(${manifest[key].lqip})` : '');

function img(key, { sizes = '100vw', eager = false, alt: a, cls = '', priority = false } = {}) {
  const m = manifest[key];
  if (!m) throw new Error(`Unknown image ${key}`);
  return `<img src="${src(key, 960)}" srcset="${srcset(key)}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(a ?? alt(key))}"${cls ? ` class="${cls}"` : ''} ${eager ? 'loading="eager"' : 'loading="lazy"'} decoding="async"${priority ? ' fetchpriority="high"' : ''}>`;
}

function media(key, { ratio = '', arch = false, parallax = false, reveal = true, sizes, eager, d = 0, extra = '' } = {}) {
  const cls = ['media', ratio, arch && 'media--arch', parallax && 'media--parallax'].filter(Boolean).join(' ');
  const style = [d && `--d:${d}s`, lq(key)].filter(Boolean).join(';');
  const attrs = [reveal && 'data-reveal', parallax && 'data-parallax', style && `style="${style}"`, extra].filter(Boolean).join(' ');
  return `<div class="${cls}" ${attrs}>${img(key, { sizes, eager })}${aiBadge(key)}</div>`;
}

const lines = (arr, d = 0) => arr.map((l, i) => `<span class="line"><span style="--i:${i}${d ? `;--d:${d}s` : ''}">${l}</span></span>`).join('');
const eyebrow = (num, text) => `<p class="eyebrow">${num ? `<span class="eyebrow__num">${num}</span><span class="eyebrow__rule"></span>` : ''}<span>${text}</span></p>`;

const icon = {
  arrow: '<svg class="arrow" viewBox="0 0 26 10" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M0 5h25M21 1l4 4-4 4"/></svg>',
  prev: '<svg viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M18 6H1M6 1L1 6l5 5"/></svg>',
  next: '<svg viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M0 6h17M12 1l5 5-5 5"/></svg>',
  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M1 1l14 14M15 1L1 15"/></svg>',
  check: '<svg viewBox="0 0 12 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 5l3.5 3.5L11 1"/></svg>',
  tick: '<svg viewBox="0 0 26 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 10l8 8L25 1"/></svg>',
};
const link = (href, text) => `<a class="link" href="${href}"><span>${text}</span>${icon.arrow}</a>`;

const mapsUrl = site.googleUrl || `https://www.google.com/maps/search/?api=1&query=${site.map.lat},${site.map.lng}`;
const phoneLink = (cls = '') => (!has(site.phone) ? '' : site.phoneHref ? `<a class="${cls}" href="tel:${site.phoneHref}">${esc(site.phone)}</a>` : `<span class="${cls}">${esc(site.phone)}</span>`);
const emailLink = (cls = '') => (!has(site.email) ? '' : `<a class="${cls}" href="mailto:${esc(site.emailHref || site.email)}">${esc(site.email)}</a>`);
const mobileLink = (cls = '') => (!has(site.mobile) ? '' : `<a class="${cls}" href="tel:${site.mobileHref || site.mobile.replace(/[^\d+]/g, '')}">${esc(site.mobile)}</a>`);
const waLink = (cls = '') => (!has(site.whatsapp) ? '' : `<a class="${cls}" href="https://wa.me/${site.whatsapp.replace(/[^\d]/g, '')}" rel="noopener" target="_blank">${esc(site.whatsapp)}</a>`);
const reply = (pre = ' ') => (has(site.replyTime) ? `${pre}${esc(loc(site.replyTime))}` : '');
const li = (...parts) => parts.filter(Boolean).map((p) => `<li>${p}</li>`).join('');

// ── chrome ─────────────────────────────────────────────────────────────────
const NAV = () => [
  { href: 'index.html', label: 'Home', id: 'home', img: 'chatLobby' },
  { href: 'rooms.html', label: t('Apartments & Suites', 'Appartamenti & Suite'), id: 'rooms', img: 'biBlu1' },
  { href: 'wellness.html', label: t('Wellness', 'Benessere'), id: 'wellness', img: 'chatTubSteps' },
  { href: 'about.html', label: t('About us', 'Chi siamo'), id: 'about', img: 'chatSofa' },
  { href: 'location.html', label: t('Location', 'Dove siamo'), id: 'location', img: 'chatCourtyard' },
  { href: 'gallery.html', label: t('Gallery', 'Galleria'), id: 'gallery', img: 'chatG8' },
  { href: 'contact.html', label: t('Contact', 'Contatti'), id: 'contact', img: 'receptionDesk' },
];
const cur = (page, id) => (page === id ? ' aria-current="page"' : '');

const wordmark = () => `<span class="wordmark"><span class="wordmark__name">${esc(site.name.toUpperCase())}</span><span class="wordmark__sub"><span class="wordmark__desc">${esc(site.descriptor)} · </span>${esc(site.city)}</span></span>`;

// language switch: same page in the other language
const otherHref = (file) => (LANG === 'it' ? `en/${file}` : `../${file}`);
function langSwitch(file, cls) {
  if (cls === 'lang--compact') {   // phones/tablets: show the current language, tap to switch
    const [cur, other, name] = LANG === 'it' ? ['IT', 'en', 'English'] : ['EN', 'it', 'Italiano'];
    return `<span class="lang ${cls}"><a href="${otherHref(file)}" hreflang="${other}" data-lang="${other}" title="${name}" aria-label="${t('Language: English. Switch to Italian', 'Lingua: italiano. Passa all’inglese')}">${cur}</a></span>`;
  }
  const it = LANG === 'it' ? `<span class="lang__cur" aria-current="true">IT</span>` : `<a href="${otherHref(file)}" hreflang="it" lang="it" data-lang="it" title="Italiano">IT</a>`;
  const en = LANG === 'en' ? `<span class="lang__cur" aria-current="true">EN</span>` : `<a href="${otherHref(file)}" hreflang="en" lang="en" data-lang="en" title="English">EN</a>`;
  return `<span class="lang ${cls}" role="group" aria-label="${t('Language', 'Lingua')}">${it}<span class="lang__sep" aria-hidden="true">/</span>${en}</span>`;
}

function header(page, file) {
  const nav = NAV();
  const navItem = (id) => { const n = nav.find((x) => x.id === id); return `<a href="${n.href}"${cur(page, id)}>${n.label}</a>`; };
  return `
<a class="skip-link" href="#main">${t('Skip to content', 'Vai al contenuto')}</a>
<header class="site-header" id="top">
  <div class="container site-header__inner">
    <div class="nav nav--left-wrap">
      <button class="menu-toggle" aria-expanded="false" aria-controls="menu"><span class="menu-toggle__bars"></span><span class="menu-toggle__txt">Menu</span></button>
      ${langSwitch(file, 'lang--compact')}
      <nav class="nav nav--left" aria-label="${t('Primary', 'Principale')}">${navItem('rooms')}${navItem('wellness')}${navItem('about')}${navItem('location')}</nav>
    </div>
    <a href="index.html" aria-label="${esc(site.name)} — home">${wordmark()}</a>
    <nav class="nav nav--right" aria-label="${t('Secondary', 'Secondaria')}">${navItem('gallery')}${navItem('contact')}${langSwitch(file, 'lang--full')}<a class="btn btn--sm" href="booking.html">${t('Book<span class="btn__more"> now</span>', 'Prenota')}</a></nav>
  </div>
</header>
<div class="menu" id="menu" aria-hidden="true">
  <nav class="menu__nav" aria-label="Menu">
    <ul class="menu__list">
      ${nav.map((n, i) => `<li><a href="${n.href}" data-i="${i}"${cur(page, n.id)}>${n.label}</a></li>`).join('\n      ')}
      <li><a href="booking.html" data-i="0">${t('Book your stay', 'Prenota il soggiorno')}</a></li>
    </ul>
    <div class="menu__lang">${LANG === 'it' ? `<span aria-current="true">Italiano</span><a href="${otherHref(file)}" hreflang="en" lang="en" data-lang="en">English</a>` : `<a href="${otherHref(file)}" hreflang="it" lang="it" data-lang="it">Italiano</a><span aria-current="true">English</span>`}</div>
    <div class="menu__meta"><span>${esc(site.address)}, ${esc(site.postcode)}</span><span>${[phoneLink(), mobileLink(), emailLink()].filter(Boolean).join(' · ')}</span></div>
  </nav>
  <div class="menu__visual" aria-hidden="true">
    ${nav.map((n, i) => img(n.img, { sizes: '50vw', alt: '', cls: i === 0 ? 'is-active' : '' })).join('\n    ')}
  </div>
</div>`;
}

function footer() {
  const social = [site.instagram && `<a href="${site.instagram}" rel="noopener" target="_blank">Instagram</a>`, site.facebook && `<a href="${site.facebook}" rel="noopener" target="_blank">Facebook</a>`].filter(Boolean);
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">${wordmark()}<p>${t('A relaxing retreat in the beating heart of Palermo.', 'Un rifugio di relax nel cuore pulsante di Palermo.')}</p>${social.length ? `<div class="footer__social">${social.join('')}</div>` : ''}</div>
      <div class="footer__col footer__col--visit"><h3>${t('Visit', 'Indirizzo')}</h3><ul><li>${esc(site.address)}</li><li>${esc(site.postcode)}</li><li><a href="location.html#find-us">${t('Directions', 'Indicazioni')}</a></li></ul></div>
      <div class="footer__col footer__col--wide"><h3>${t('Contact', 'Contatti')}</h3><ul>${li(has(site.phone) && `${t('Tel.', 'Tel.')} ${phoneLink()}`, has(site.mobile) && `${t('Mob.', 'Cell.')} ${mobileLink()}`, emailLink(), has(site.whatsapp) && `WhatsApp ${waLink()}`)}</ul></div>
      <div class="footer__col"><h3>${t('Explore', 'Esplora')}</h3><ul>${NAV().slice(1).map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}</ul></div>
    </div>
  </div>
  <div class="footer__big" aria-hidden="true"><span>${esc(site.name.toUpperCase())}</span></div>
  <div class="container footer__bottom">
    <span>${[`© ${YEAR} ${esc(site.fullName)}`, has(site.cin) && `CIN ${esc(site.cin)}`, has(site.vat) && esc(site.vat)].filter(Boolean).join(' · ')}</span>
    <nav aria-label="${t('Legal', 'Note legali')}"><a href="privacy.html">Privacy</a><a href="privacy.html#cookies">Cookie</a></nav>
  </div>
</footer>`;
}

const mobileBook = () => `<div class="mobile-book" aria-hidden="true"><span class="mobile-book__txt">${t(`Your stay in ${esc(site.city)}`, `Il tuo soggiorno a ${esc(site.city)}`)}</span><a class="btn btn--solid btn--sm" href="booking.html" tabindex="-1">${t('Book now', 'Prenota')}</a></div>`;

// strings used by assets/js/main.js and booking.js
const I18N = {
  en: {
    locale: 'en-GB', dows: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    prevMonth: 'Previous month', nextMonth: 'Next month', clear: 'Clear dates',
    pickIn: 'Select your arrival date', pickOut: 'Now select your departure',
    night: 'night', nights: 'nights', adult: 'adult', adults: 'adults', child: 'child', children: 'children',
    menu: 'Menu', close: 'Close', selectDate: 'Select date', select: 'Select',
    errReq: 'This field is required.', errConsent: 'Please accept to continue.',
    errEmail: 'Please enter a valid email address.', errPhone: 'Please enter a valid phone number.',
    sending: 'Sending…', sendMsg: 'Send message', thanks: 'Thank you. We’ll be in touch soon.',
    demoContact: '(Demo mode: set contactEndpoint to send messages.)',
    errSend: 'Sorry, your message could not be sent. Please try again or contact us by phone.',
    noPref: 'No preference', errIn: 'Please choose your check-in date.', errOut: 'Please choose your check-out date.',
    errMin: 'The minimum stay is {n} nights.', errRoom: 'Please choose an apartment, or select “No preference”.',
    rCheckIn: 'Check-in', rCheckOut: 'Check-out', rNights: 'Nights', rGuests: 'Guests', rRoom: 'Apartment', rName: 'Name',
    rEmail: 'Email', rPhone: 'Telephone', rCountry: 'Country', rArrival: 'Estimated arrival', rRequests: 'Special requests',
    edit: 'Edit', sendReq: 'Send request', errBooking: 'Sorry, we could not send your request. Please try again, or contact us directly.',
    details: 'Details', hideDetails: 'Hide details',
  },
  it: {
    locale: 'it-IT', dows: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'],
    prevMonth: 'Mese precedente', nextMonth: 'Mese successivo', clear: 'Cancella date',
    pickIn: 'Seleziona la data di arrivo', pickOut: 'Ora seleziona la data di partenza',
    night: 'notte', nights: 'notti', adult: 'adulto', adults: 'adulti', child: 'bambino', children: 'bambini',
    menu: 'Menu', close: 'Chiudi', selectDate: 'Seleziona', select: 'Seleziona',
    errReq: 'Campo obbligatorio.', errConsent: 'Per continuare è necessario accettare.',
    errEmail: 'Inserisci un indirizzo email valido.', errPhone: 'Inserisci un numero di telefono valido.',
    sending: 'Invio in corso…', sendMsg: 'Invia messaggio', thanks: 'Grazie. Ti risponderemo al più presto.',
    demoContact: '(Modalità demo: imposta contactEndpoint per inviare i messaggi.)',
    errSend: 'Spiacenti, non è stato possibile inviare il messaggio. Riprova o contattaci per telefono.',
    noPref: 'Nessuna preferenza', errIn: 'Scegli la data di arrivo.', errOut: 'Scegli la data di partenza.',
    errMin: 'Il soggiorno minimo è di {n} notti.', errRoom: 'Scegli un appartamento, oppure seleziona “Nessuna preferenza”.',
    rCheckIn: 'Arrivo', rCheckOut: 'Partenza', rNights: 'Notti', rGuests: 'Ospiti', rRoom: 'Appartamento', rName: 'Nome',
    rEmail: 'Email', rPhone: 'Telefono', rCountry: 'Paese', rArrival: 'Orario di arrivo previsto', rRequests: 'Richieste particolari',
    edit: 'Modifica', sendReq: 'Invia richiesta', errBooking: 'Spiacenti, non è stato possibile inviare la richiesta. Riprova o contattaci direttamente.',
    details: 'Dettagli', hideDetails: 'Nascondi dettagli',
  },
};
for (const k of Object.keys(I18N.en)) if (!(k in I18N.it)) throw new Error(`Missing Italian UI string: ${k}`);

function clientConfig() {
  const cfg = {
    name: site.name, city: site.city, lang: LANG, bookingEndpoint: site.bookingEndpoint, contactEndpoint: site.contactEndpoint,
    minNights: site.minNights, maxGuests: site.maxGuests,
    rooms: rooms.map((r0) => { const r = roomT(r0); return { slug: r.slug, name: r.bookingName, line: r.line, img: src(r.image, 960), ai: site.production && isAi(r.image), maxGuests: r.maxGuests }; }),
    fallbackImg: src('chatLobby', 960), i18n: I18N[LANG],
  };
  return `<script>window.ECCELSO=${JSON.stringify(cfg)};</script>`;
}

const jsonLd = () => `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: site.fullName,
  address: { '@type': 'PostalAddress', streetAddress: site.address, postalCode: '90134', addressLocality: 'Palermo', addressRegion: 'PA', addressCountry: 'IT' },
  telephone: site.phone, geo: { '@type': 'GeoCoordinates', latitude: site.map.lat, longitude: site.map.lng },
  checkinTime: site.checkInTime, checkoutTime: site.checkOutTime,
})}</script>`;

function layout({ page, file, title, description, hero = false, body, scripts = [], ogImage = 'chatLobby', bookBar = true }) {
  const itHref = LANG === 'it' ? file : `../${file}`, enHref = LANG === 'it' ? `en/${file}` : file;
  return `<!doctype html>
<html lang="${LANG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#232f29">${site.production ? '' : '\n<meta name="robots" content="noindex, nofollow">'}
<meta property="og:type" content="website">
<meta property="og:locale" content="${t('en_GB', 'it_IT')}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${src(ogImage, 1600)}">
<link rel="alternate" hreflang="it" href="${itHref}">
<link rel="alternate" hreflang="en" href="${enHref}">
<link rel="alternate" hreflang="x-default" href="${itHref}">
<link rel="icon" href="${B}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400..600&family=Jost:wght@400;500&display=swap">
<link rel="stylesheet" href="${B}${ver('assets/css/styles.css')}">
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="page-${page}${hero ? ' has-hero' : ''}">
${header(page, file)}
<main id="main">
${body}
</main>
${footer()}
${bookBar ? mobileBook() : ''}
${clientConfig()}
${page === 'home' || page === 'contact' ? jsonLd() : ''}
<script src="${B}${ver('assets/js/main.js')}" defer></script>
${scripts.map((s) => `<script src="${B}${ver(s)}" defer></script>`).join('\n')}
</body>
</html>
`;
}

// Small, understated rating badge for the booking CTA (owner-supplied Google rating).
const trustBadge = () => `<p class="trust"><a href="${site.googleUrl}" target="_blank" rel="noopener" aria-label="${t(`Rated ${site.rating.score} out of 5 from ${site.rating.count} Google reviews`, `Valutazione ${site.rating.score.replace('.', ',')} su 5 da ${site.rating.count} recensioni Google`)}"><span aria-hidden="true">${t(site.rating.score, site.rating.score.replace('.', ','))}</span><svg class="trust__star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.75 6.06 6.62.7-4.95 4.46 1.38 6.52L12 17.02l-5.8 3.32 1.38-6.52L2.63 9.36l6.62-.7z"/></svg><span class="trust__sep" aria-hidden="true">·</span><span aria-hidden="true">${t(`${site.rating.count} Google reviews`, `${site.rating.count} recensioni Google`)}</span></a></p>`;

const closingCta = (title) => `
<section class="section closing" aria-labelledby="closing-title">
  <div class="container closing__inner">
    <div class="closing__title">
      ${eyebrow('', t('Reservations', 'Prenotazioni'))}
      <h2 class="h1" id="closing-title" style="margin-top:1.75rem" data-split>${lines(title || t(['Your stay in Palermo', '<em>begins with a date.</em>'], ['Il tuo soggiorno a Palermo', '<em>inizia da una data.</em>']))}</h2>
    </div>
    <div class="closing__side" data-reveal>
      <p class="body">${t(`Send us your dates and we'll reply${reply()} with availability and our best rate. No payment is taken at this stage.`, `Inviaci le tue date: ti risponderemo${reply()} con la disponibilità e la nostra migliore tariffa. In questa fase non è richiesto alcun pagamento.`)}</p>
      ${trustBadge()}
      <a class="btn btn--solid" href="booking.html">${t('Check availability', 'Verifica disponibilità')}</a>
      ${link('contact.html', t('Or write to us', 'Oppure scrivici'))}
    </div>
  </div>
</section>`;

// focusX: horizontal crop position for photos whose symmetry axis is off-centre, so the subject lines up with the centred logo
function pageHero({ key, eyebrowText, title, lede, full = false, framed = false, focusX = '' }) {
  if (full) {
    return `
<section class="page-hero page-hero--full on-image">
  <div class="page-hero__media"><div class="media" data-parallax data-speed="0.18" style="${lq(key)}">${img(key, { eager: true, priority: true, sizes: coverSizes(key) })}</div></div>
  <div class="page-hero__text">
    ${eyebrow('', eyebrowText)}
    <h1 class="h1 page-hero__title" data-split>${lines(title, 0.2)}</h1>
    <p class="page-hero__lede" data-reveal style="--d:.6s">${lede}</p>
  </div>
</section>`;
  }
  return `
<section class="page-hero${framed ? ' page-hero--framed' : ''}">
  <div class="page-hero__text">
    <div data-reveal>${eyebrow('', eyebrowText)}</div>
    <h1 class="h1 page-hero__title" data-split>${lines(title, 0.15)}</h1>
    <p class="body page-hero__lede" data-reveal style="--d:.55s">${lede}</p>
  </div>
  <div class="page-hero__media"><div class="media"${framed ? '' : ' data-parallax data-speed="0.14"'} style="${lq(key)}${focusX ? `;--fx:${focusX}` : ''}">${img(key, { eager: true, priority: true, sizes: '(max-width: 900px) 100vw, 55vw' })}</div></div>
  <span class="page-hero__scroll" aria-hidden="true"></span>
</section>`;
}

const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.75 6.06 6.62.7-4.95 4.46 1.38 6.52L12 17.02l-5.8 3.32 1.38-6.52L2.63 9.36l6.62-.7z"/></svg>';
const stars = () => `<span class="stars" aria-hidden="true">${star.repeat(5)}</span>`;
// Review text is always shown verbatim in its published language.
const quote = (r, cls = '') => `<figure class="quote ${cls}"><blockquote lang="en"><p>${esc(r.text)}</p></blockquote><figcaption><span class="quote__name">${esc(r.name)}</span><span class="quote__meta">${esc(reviewMeta(r))}</span></figcaption></figure>`;

function reviewsSection(num = '06') {
  const feat = reviews.find((r) => r.featured), rest = reviews.filter((r) => !r.featured);
  return `
<section class="section reviews" aria-labelledby="reviews-title">
  <div class="container">
    <div class="grid reviews__top">
      <div class="reviews__score" data-reveal>
        ${eyebrow(num, t('Guests', 'Ospiti'))}
        <h2 class="sr-only" id="reviews-title">${t('Guest reviews', 'Recensioni degli ospiti')}</h2>
        <p class="reviews__num"><span>${t(site.rating.score, site.rating.score.replace('.', ','))}</span><small>/5</small></p>
        ${stars()}
        <p class="reviews__src"><a href="${site.googleUrl}" target="_blank" rel="noopener">${t(`${site.rating.source} rating · ${site.rating.count} reviews`, `Valutazione ${site.rating.source} · ${site.rating.count} recensioni`)}</a></p>
      </div>
      <div class="reviews__feat" data-reveal style="--d:.15s">${quote(feat, 'quote--feat')}</div>
    </div>
    <div class="grid reviews__list">
      ${rest.map((r, i) => `<div data-reveal style="--d:${i * 0.1}s">${quote(r)}</div>`).join('\n      ')}
    </div>
    <p class="reviews__note">${t('Unedited excerpts from published guest reviews.', 'Estratti non modificati da recensioni pubblicate dagli ospiti, riportati in inglese come sono stati pubblicati.')}</p>
  </div>
</section>`;
}

// form helpers
const field = (id, label, { type = 'text', req = false, auto = '', ph: p = '', span = false, tag = 'input', opts = [] } = {}) => {
  const a = `id="${id}" name="${id}" class="input"${req ? ' required aria-required="true"' : ''}${auto ? ` autocomplete="${auto}"` : ''}${p ? ` placeholder="${p}"` : ''} aria-describedby="${id}-err"`;
  const ctrl = tag === 'textarea' ? `<textarea ${a} rows="4"></textarea>` : tag === 'select' ? `<select ${a}>${opts.map((o, i) => `<option${i === 0 ? ' value=""' : ''}>${o}</option>`).join('')}</select>` : `<input type="${type}" ${a}>`;
  return `<div class="field${span ? ' span-2' : ''}"><label for="${id}">${label}${req ? '<span class="req" aria-hidden="true">*</span>' : ''}</label>${ctrl}<span class="field__bar"></span><span class="field__error" id="${id}-err" aria-live="polite"></span></div>`;
};
const consent = (id) => `<div class="field"><label class="check" for="${id}"><input type="checkbox" id="${id}" name="${id}" required aria-describedby="${id}-err"><span class="check__box">${icon.check}</span><span>${t('I have read the <a href="privacy.html" target="_blank">privacy policy</a> and agree to my data being used to answer this request.', 'Ho letto l’<a href="privacy.html" target="_blank">informativa sulla privacy</a> e acconsento al trattamento dei miei dati per rispondere a questa richiesta.')}<span class="req" aria-hidden="true">*</span></span></label><span class="field__error" id="${id}-err" aria-live="polite"></span></div>`;

// ── pages ──────────────────────────────────────────────────────────────────
function buildPages() {
  const pages = {};
  const R = rooms.map(roomT);

  // HOME ------------------------------------------------------------------
  // Every photo appears once on the homepage (client: "cambiare foto che si ripetono").
  const heroSlides = ['chatLobby', 'chatTubSteps', 'suiteBlu3', 'homeGreenRoom'];   // client images (Oct 2026); slide 4 = client's extra photo
  const heroMobile = ['chatReception', 'chatProsecco', 'suiteBlu3', 'homeGreenRoom']; // portrait-friendly sources for phones
  const heroLight = [1, 3];                                                              // bright slides: extra scrim behind the title
  const moments = [
    ['receptionDesk', t('The lobby', 'La hall'), t('A welcoming space to make your arrival comfortable.', 'Un ambiente accogliente renderà il tuo arrivo confortevole.')],
    ['aiTerraceLoungers', t('The terrace', 'La terrazza'), t('Patterned blue tiles, sun loungers and the rooftops of Palermo.', 'Piastrelle blu decorate, lettini e i tetti di Palermo.')], // TODO AI
    ['chatSpaRobes', t('The wellness area', 'L’area benessere'), t('A hot tub, a sauna and a Turkish bath for moments of pure relaxation.', 'Vasca idromassaggio, sauna e bagno turco per concederti momenti di puro relax.')],
  ];
  pages['index.html'] = layout({
    page: 'home', file: 'index.html', hero: true,
    title: t(`${site.name} — ${site.descriptor} in ${site.city}`, `${site.name} — ${site.descriptor} a ${site.city}`),
    description: t(`${site.name}: apartments and suites, a wellness retreat and a sunlit terrace in the heart of ${site.city}. Request your stay directly.`, `${site.name}: appartamenti e suite, un’area benessere e una terrazza assolata nel cuore di ${site.city}. Richiedi il tuo soggiorno direttamente.`),
    body: `
<section class="hero" aria-label="${t('Welcome', 'Benvenuti')}">
  <div class="hero__media"><div class="hero__parallax" data-parallax data-speed="0.25">
    <div class="hero__slides">
      ${heroSlides.map((k, i) => `<div class="hero__slide${i === 0 ? ' is-active' : ''}${heroLight.includes(i) ? ' hero__slide--light' : ''}"><picture><source media="(max-width: 700px)" srcset="${srcset(heroMobile[i])}" sizes="${coverSizes(heroMobile[i])}">${img(k, { eager: i === 0, priority: i === 0, sizes: coverSizes(k) })}</picture>${aiBadge(k, heroMobile[i])}</div>`).join('\n      ')}
    </div>
  </div></div>
  <div class="hero__content on-image">
    <div class="container">
      <div class="hero__row">
        <div>
          <div data-reveal style="--d:.2s">${eyebrow('', `${site.descriptor} — ${site.city}`)}</div>
          <h1 class="display hero__title" data-split>${lines(t([`${site.city},`, '<em>softly.</em>'], [`${site.city},`, '<em>dolcemente.</em>']), 0.35)}</h1>
        </div>
        <div class="hero__aside" data-reveal style="--d:.9s">
          <p class="hero__lede">${t('Apartments and suites, a wellness retreat and a sunlit terrace in the heart of the old town, three minutes on foot from Palermo Cathedral.', 'Appartamenti e suite, un’area benessere e una terrazza assolata nel cuore del centro storico, a tre minuti a piedi dalla Cattedrale di Palermo.')}</p>
          <div class="hero__counter" aria-hidden="true"><span data-hero-index>01</span><span class="hero__progress"><span></span></span><span>${pad(heroSlides.length)}</span></div>
        </div>
      </div>
      <form class="bookbar" action="booking.html" data-bookbar data-reveal style="--d:1.1s" aria-label="${t('Check availability', 'Verifica disponibilità')}">
        <button type="button" class="bookbar__field" data-open="dates"><span class="bookbar__label">${t('Check-in', 'Arrivo')}</span><span class="bookbar__value is-empty" data-in>${t('Select date', 'Seleziona')}</span></button>
        <button type="button" class="bookbar__field" data-open="dates"><span class="bookbar__label">${t('Check-out', 'Partenza')}</span><span class="bookbar__value is-empty" data-out>${t('Select date', 'Seleziona')}</span></button>
        <button type="button" class="bookbar__field" data-open="guests"><span class="bookbar__label">${t('Guests', 'Ospiti')}</span><span class="bookbar__value" data-guests>${t('2 adults', '2 adulti')}</span></button>
        <button type="submit" class="btn btn--light">${t('Check availability', 'Verifica disponibilità')}</button>
        <div class="popover popover--up" data-pop="dates" style="left:0"><div class="cal" data-cal></div></div>
        <div class="popover popover--up" data-pop="guests" style="left:66%;min-width:20rem">
          <div class="stepper"><span class="stepper__label">${t('Adults', 'Adulti')}<small>${t('Ages 13+', 'Dai 13 anni')}</small></span><span class="stepper__ctrl"><button type="button" class="stepper__btn" data-step="adults:-1" aria-label="${t('Fewer adults', 'Meno adulti')}">−</button><span class="stepper__val" data-val="adults">2</span><button type="button" class="stepper__btn" data-step="adults:1" aria-label="${t('More adults', 'Più adulti')}">+</button></span></div>
          <div class="stepper"><span class="stepper__label">${t('Children', 'Bambini')}<small>${t('Ages 0–12', '0–12 anni')}</small></span><span class="stepper__ctrl"><button type="button" class="stepper__btn" data-step="children:-1" aria-label="${t('Fewer children', 'Meno bambini')}">−</button><span class="stepper__val" data-val="children">0</span><button type="button" class="stepper__btn" data-step="children:1" aria-label="${t('More children', 'Più bambini')}">+</button></span></div>
        </div>
      </form>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="house-title">
  <div class="container grid intro">
    <div class="intro__a"><figure>${media('chatReception', { ratio: 'ratio-23', sizes: '(max-width: 900px) 82vw, 40vw' })}<figcaption class="caption">${t('Reception', 'La reception')}</figcaption></figure>
      <p class="intro__quote" data-reveal>${t('<em>Eccelso</em> · Italian for lofty, sublime; from the Latin <em>excelsus</em>.', '<em>Eccelso</em> · elevato, sublime; dal latino <em>excelsus</em>.')}</p></div>
    <div class="intro__text stack stack--lg">
      <div data-reveal>${eyebrow('01', 'Aparthotel')}</div>
      <h2 class="h2 h2--long" id="house-title" data-split>${lines(t(['Eccelso · Suites &amp; Spa', '<em>welcomes you into a unique and unforgettable stay experience.</em>'], ['Eccelso · Suites &amp; Spa', '<em>ti accoglie in un’esperienza di soggiorno unica ed emozionante.</em>']))}</h2>
      <p class="body" data-reveal>${t('The timeless charm of the historic centre meets contemporary design and modern comfort, giving life to an elegant property made for those who want to experience Palermo in style. Amid historic markets, iconic landmarks, authentic restaurants and exclusive venues, Eccelso is the ideal choice for unforgettable holidays or business stays.', 'L’antico fascino del centro storico incontra il design contemporaneo e il comfort moderno, dando vita a una struttura elegante pensata per chi desidera vivere Palermo con stile. Tra mercati storici, monumenti iconici, ristoranti tipici e locali esclusivi, Eccelso è la scelta ideale per vacanze indimenticabili o soggiorni business.')}</p>
      <div data-reveal>${link('about.html', t('Our story', 'La nostra storia'))}</div>
    </div>
    <figure class="intro__b">${media('chatSofa', { ratio: 'ratio-34', parallax: true, sizes: '(max-width: 900px) 70vw, 38vw', extra: 'data-speed="0.12"' })}<figcaption class="caption">${t('A suite living room', 'Il soggiorno di una suite')}</figcaption></figure>
    <figure class="intro__c">${media('introBedroom', { ratio: 'ratio-45', sizes: '(max-width: 900px) 60vw, 24vw', d: 0.15 })}<figcaption class="caption">${t('One of our bedrooms', 'Una delle nostre camere')}</figcaption></figure>
  </div>
</section>

<section class="section section--paper" aria-labelledby="rituals-title">
  <div class="container grid rituals">
    <div class="rituals__text stack stack--lg">
      <div data-reveal>${eyebrow('02', t('Rituals', 'Rituali'))}</div>
      <h2 class="h2" id="rituals-title" data-split>${lines(t(['An oasis of calm', '<em>in the heart of the old town.</em>'], ['Un’oasi di pace', '<em>nel cuore del centro storico.</em>']))}</h2>
      <p class="body" data-reveal>${t('Inside Eccelso you’ll find a refined spa where you can give yourself moments of pure wellbeing.', 'All’interno di Eccelso troverai una raffinata SPA dove concederti momenti di puro benessere.')}</p>
      <div data-reveal>${link('wellness.html', t('Discover the wellness area', 'Scopri l’area benessere'))}</div>
    </div>
    <figure class="rituals__a">${media('chatSaunaLight', { ratio: 'ratio-45', sizes: '(max-width: 900px) 68vw, 24vw' })}<figcaption class="caption">${t('The sauna', 'La sauna')}</figcaption></figure>
    <figure class="rituals__b">${media('chatHammam', { ratio: 'ratio-45', sizes: '(max-width: 900px) 78vw, 32vw', d: 0.15 })}<figcaption class="caption">${t('The Turkish bath', 'Il bagno turco')}</figcaption></figure>
  </div>
</section>

<section class="section section--dark section--rooms" aria-labelledby="rooms-title">
  <div class="container rooms-head">
    <div class="rooms-head__title stack stack--lg">
      <div data-reveal>${eyebrow('03', t('Apartments &amp; suites', 'Appartamenti &amp; suite'))}</div>
      <h2 class="h1" id="rooms-title" data-split>${lines(t(['Choose the solution', '<em>that’s right for you.</em>'], ['Scegli la soluzione', '<em>adatta a te.</em>']))}</h2>
    </div>
    <div class="rooms-head__side" data-reveal>
      <p class="body">${t('The property is home to 25 luxury apartments in Palermo, designed to guarantee comfort, functionality and elegance.', 'La struttura ospita 25 appartamenti di lusso a Palermo, progettati per garantire comfort, funzionalità ed eleganza.')}</p>
      <div class="rooms-head__controls">
        ${link('rooms.html', t('All apartments &amp; suites', 'Tutti gli appartamenti &amp; suite'))}
        <div class="slider-btns"><button class="slider-btn" data-track-prev aria-label="${t('Previous apartments', 'Appartamenti precedenti')}">${icon.prev}</button><button class="slider-btn" data-track-next aria-label="${t('Next apartments', 'Appartamenti successivi')}">${icon.next}</button></div>
      </div>
    </div>
  </div>
  <div class="track" data-track tabindex="0" aria-label="${t('Apartments and suites', 'Appartamenti e suite')}">
    ${R.map((r, i) => `<a class="room-card" href="rooms.html#${r.slug}" data-reveal style="--d:${Math.min(i, 3) * 0.1}s">
      <div class="media${r.slug === 'suite' ? ' media--suite-cover' : ''}" style="${lq(r.image)}">${img(r.image, { sizes: '(max-width: 900px) 82vw, 40vw' })}${aiBadge(r.image)}</div>
      <div class="room-card__meta"><span class="room-card__num">${pad(i + 1)}</span><h3 class="h3">${r.cardName}</h3><span class="room-card__go" aria-hidden="true">${icon.next}</span><p class="room-card__line">${r.line}</p></div>
    </a>`).join('\n    ')}
  </div>
  <div class="container"><div class="track-progress" aria-hidden="true"><span data-track-bar></span></div></div>
</section>

<section class="city" aria-labelledby="city-title">
  <figure class="city__media">${media('chatCathedral', { parallax: true, sizes: '(max-width: 900px) 100vw, 50vw', extra: 'data-speed="0.1"' })}</figure>
  <div class="city__body stack stack--lg">
    <div data-reveal>${eyebrow('04', site.city)}</div>
    <h2 class="h2" id="city-title" data-split>${lines(t(['The city, just', '<em>beyond the balustrade.</em>'], ['La città, appena', '<em>oltre la balaustra.</em>']))}</h2>
    <p class="body" data-reveal>${t('Arab-Norman domes and baroque churches, markets loud with colour, granita in the afternoon. When you want the sea, the La Cala waterfront is just a few minutes on foot.', 'Cupole arabo-normanne e chiese barocche, mercati pieni di colori, una granita nel pomeriggio. E quando hai voglia di mare, il lungomare della Cala è a pochi minuti a piedi.')}</p>
    <div data-reveal>${link('location.html', t('The location', 'Dove siamo'))}</div>
  </div>
</section>

<section class="section section--paper moments" aria-labelledby="moments-title" data-moments>
  <div class="container">
    <div class="section-head">
      <div class="section-head__title stack stack--lg">
        <div data-reveal>${eyebrow('05', t('Moments', 'Momenti'))}</div>
        <h2 class="h2" id="moments-title" data-split>${lines(t(['A few corners', '<em>we love.</em>'], ['Gli angoli', '<em>che amiamo.</em>']))}</h2>
      </div>
    </div>
    <div class="moments__layout">
    <div class="moments__stage" data-reveal="fade">
      ${moments.map(([k], i) => `<div class="moments__slide${i === 0 ? ' is-active' : ''}" style="${lq(k)}">${img(k, { sizes: '(max-width: 900px) 100vw, 68vw' })}${aiBadge(k)}</div>`).join('\n      ')}
    </div>
    <div class="moments__bar">
      <div class="moments__caps" aria-live="polite">
        ${moments.map(([, ti, c], i) => `<div class="moments__cap${i === 0 ? ' is-active' : ''}"><span class="moments__count">${pad(i + 1)} / ${pad(moments.length)}</span><h3 class="h4">${ti}</h3><p class="body small">${c}</p></div>`).join('\n        ')}
      </div>
      <div class="moments__ctrl">
        <div class="moments__dots">${moments.map((m, i) => `<button class="moments__dot${i === 0 ? ' is-active' : ''}" data-go="${i}" aria-label="${t('Show', 'Mostra')} ${m[1]}"></button>`).join('')}</div>
        <div class="slider-btns"><button class="slider-btn" data-mprev aria-label="${t('Previous', 'Precedente')}">${icon.prev}</button><button class="slider-btn" data-mnext aria-label="${t('Next', 'Successivo')}">${icon.next}</button></div>
      </div>
    </div>
    </div>
  </div>
</section>
${reviewsSection()}
${closingCta()}`,
  });

  // ROOMS -----------------------------------------------------------------
  const specs = (r) => [[t('Size', 'Superficie'), r.size], [t('Guests', 'Ospiti'), r.guests], [t('Bed', 'Letto'), r.bed]].filter(([, v]) => has(v));
  // colour-variant slideshow per apartment type — same markup/JS as the homepage "moments" slider
  const variantName = { blue: t('Blue variant', 'Variante blu'), green: t('Green variant', 'Variante verde'), red: t('Red variant', 'Variante rossa'), brick: t('Brick-red variant', 'Variante color mattone') };
  const roomSlides = (r) => `<div class="room__media room-slides" data-moments>
      <div class="moments__stage" data-reveal="fade">
        ${r.slides.map(([k], i) => `<div class="moments__slide${i === 0 ? ' is-active' : ''}${manifest[k].h > manifest[k].w ? ' moments__slide--portrait' : ''}" style="${lq(k)}">${img(k, { sizes: '(max-width: 900px) 100vw, 58vw' })}${aiBadge(k)}</div>`).join('\n        ')}
      </div>
      <div class="room-slides__bar">
        <div class="moments__caps" aria-live="polite">${r.slides.map(([, v], i) => `<p class="moments__cap room-slides__cap${i === 0 ? ' is-active' : ''}"><span class="moments__count">${pad(i + 1)} / ${pad(r.slides.length)}</span>${variantName[v]}</p>`).join('')}</div>
        <div class="moments__ctrl"><div class="moments__dots">${r.slides.map(([k], i) => `<button class="moments__dot${i === 0 ? ' is-active' : ''}" data-go="${i}" aria-label="${t('Show photo', 'Mostra la foto')} ${i + 1}: ${esc(alt(k))}"></button>`).join('')}</div>
          <div class="slider-btns"><button class="slider-btn" data-mprev aria-label="${t('Previous photo', 'Foto precedente')}">${icon.prev}</button><button class="slider-btn" data-mnext aria-label="${t('Next photo', 'Foto successiva')}">${icon.next}</button></div></div>
      </div>
    </div>`;
  pages['rooms.html'] = layout({
    page: 'rooms', file: 'rooms.html', ogImage: 'biBlu1',
    title: t(`Apartments & Suites — ${site.name}, ${site.city}`, `Appartamenti & Suite — ${site.name}, ${site.city}`),
    description: t(`Apartments and suites at ${site.name}, ${site.city}: studios, one-bedroom and family apartments, and suites in the historic centre. Request your stay directly.`, `Appartamenti e suite da ${site.name}, ${site.city}: monolocali, bilocali, trilocali e suite nel centro storico. Richiedi il tuo soggiorno direttamente.`),
    body: `
${pageHero({ key: 'chatG13', framed: true, eyebrowText: t('Apartments &amp; suites', 'Appartamenti &amp; suite'), title: t(['The comfort of home,', '<em>the luxury of an Aparthotel.</em>'], ['Il comfort di casa,', '<em>il lusso di un Aparthotel.</em>']), lede: t('Stay solutions for every need.', 'Soluzioni di soggiorno per tutte le esigenze.') })}
<section class="section" aria-label="${t('Introduction', 'Introduzione')}">
  <div class="container grid"><div class="statement" data-reveal><p class="lead">${t('Every space tells a story of <em>elegance, light and harmony</em>.', 'Ogni ambiente racconta una storia fatta di <em>eleganza, luce e armonia</em>.')}</p><p class="body" style="margin-top:2rem">${t('Recently renovated, from 32 to 60 m²: studios, one-bedroom and family apartments, and suites.', 'Appena ristrutturati, da 32 a 60 m²: monolocali, bilocali, trilocali e suite.')}</p></div></div>
</section>
<nav class="room-index" aria-label="${t('Apartment types', 'Tipologie di appartamento')}"><div class="container"><ul class="room-index__list">${R.map((r) => `<li><a href="#${r.slug}" data-spy="${r.slug}">${r.cardName}</a></li>`).join('')}</ul></div></nav>
${R.map((r, i) => `${r.kind === 'suite' && R[i - 1]?.kind !== 'suite' && suitesIntro.enabled ? `
<section class="suites-intro" aria-label="${esc(loc(suitesIntro).title)}"><div class="container grid"><div class="statement" data-reveal>${eyebrow('', esc(loc(suitesIntro).title))}<p class="lead" style="margin-top:1.5rem">${esc(loc(suitesIntro).text)}</p></div></div></section>` : ''}
<article class="room" id="${r.slug}" aria-labelledby="${r.slug}-t">
  <div class="container grid room__grid">
    ${r.slides ? roomSlides(r) : `<div class="room__media">${media(r.image, { sizes: '(max-width: 900px) 100vw, 58vw' })}</div>`}
    <div class="room__text">
      <p class="room__count" data-reveal>${pad(i + 1)} / ${pad(R.length)}</p>
      <h2 class="h2${r.kind === 'apartment' ? ' h2--long' : ''}" id="${r.slug}-t" data-split style="margin-top:1rem">${lines([r.pageTitle])}</h2>
      <p class="room__line" data-reveal>${r.kind === 'apartment' ? r.name : r.line}</p>
      <p class="body" data-reveal style="margin-top:1.5rem">${r.text}</p>
      ${specs(r).length ? `<dl class="specs" data-reveal>${specs(r).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(loc(v))}</dd></div>`).join('')}</dl>` : ''}
      <div class="room__actions" data-reveal><a class="btn btn--solid" href="booking.html?room=${r.slug}">${r.kind === 'suite' ? t('Request this suite', 'Richiedi questa suite') : t('Request this apartment', 'Richiedi questo appartamento')}</a>${link('gallery.html?f=rooms', t('Gallery', 'Galleria'))}</div>
    </div>
  </div>
</article>`).join('')}
<section class="section section--dark" id="amenities" aria-labelledby="every-title">
  <div class="container grid">
    <div style="grid-column:1/span 5" class="stack stack--lg">
      <div data-reveal>${eyebrow('', t('In every apartment', 'In ogni appartamento'))}</div>
      <h2 class="h2" id="every-title" data-split>${lines(t(['The things', '<em>you can count on.</em>'], ['Ciò su cui', '<em>puoi sempre contare.</em>']))}</h2>
      <p class="body" data-reveal>${t(`Every apartment at ${esc(site.name)} comes with:`, `Ogni appartamento di ${esc(site.name)} è dotato di:`)}</p>
    </div>
    <ul class="amenities" style="grid-column:7/span 6" data-reveal>
      ${loc(amenities).map((a) => `<li>${esc(a)}</li>`).join('')}
    </ul>
  </div>
</section>
${closingCta(t(['Found the one?', '<em>Choose your dates.</em>'], ['Hai scelto la tua?', '<em>Scegli le tue date.</em>']))}`,
  });

  // WELLNESS --------------------------------------------------------------
  const spaces = [
    { id: 'hot-tub', key: 'chatProsecco', portrait: true, name: t('The hot tub', 'La vasca idromassaggio'), line: t('The pleasure of letting yourself be enveloped.', 'Il piacere di lasciarsi avvolgere.'),
      text: t('Surrender to the regenerating power of water and let yourself be cradled by the gentle movement of the bubbles.', 'Abbandonati al potere rigenerante dell’acqua e lasciati cullare dal delicato movimento delle bolle.') },
    { id: 'sauna', key: 'chatSauna', portrait: false, name: t('The sauna', 'La sauna'), line: t('The heat that restores.', 'Il calore che rigenera.'),
      text: t('Rediscover balance through the enveloping warmth of the sauna.', 'Riscopri l’equilibrio attraverso il calore avvolgente della sauna.') },
    { id: 'steam-room', key: 'chatHammam', portrait: true, name: t('The Turkish bath', 'Il bagno turco'), line: t('The pleasure of deep relaxation.', 'Il piacere del relax profondo.'),
      text: t('Treat yourself to a restorative break in the warmth of the Turkish bath.', 'Concediti una pausa rigenerante nel tepore del bagno turco.') },
  ];
  pages['wellness.html'] = layout({
    page: 'wellness', file: 'wellness.html', hero: true, ogImage: 'chatTubSteps',
    title: t(`Wellness — ${site.name}, ${site.city}`, `Benessere — ${site.name}, ${site.city}`),
    description: t(`The wellness area at ${site.name}, ${site.city}: hot tub, sauna, Turkish bath and massages on request.`, `L’area benessere di ${site.name} a ${site.city}: vasca idromassaggio, sauna, bagno turco e massaggi su richiesta.`),
    body: `
${pageHero({ key: 'chatSpaTub', full: true, eyebrowText: t('Wellness', 'Benessere'), title: t(['Pure', '<em>wellbeing.</em>'], ['Puro', '<em>benessere.</em>']), lede: t(`A hot tub, a sauna and a Turkish bath, a few steps from your apartment in the heart of ${esc(site.city)}.`, `Vasca idromassaggio, sauna e bagno turco, a pochi passi dal tuo appartamento, nel cuore di ${esc(site.city)}.`) })}
<section class="section" aria-labelledby="well-title">
  <div class="container grid split">
    <div class="split__text stack stack--lg" style="grid-column:1/span 5">
      <div data-reveal>${eyebrow('01', t('The ritual', 'Il rituale'))}</div>
      <h2 class="h2" id="well-title" data-split>${lines(t(['Warmth', '<em>and stillness.</em>'], ['Calore', '<em>e quiete.</em>']))}</h2>
      <p class="body" data-reveal>${t('A regenerating experience for body and mind, ideal after a day exploring the city.', 'Un’esperienza rigenerante per il corpo e la mente, ideale dopo una giornata alla scoperta della città.')}</p>
      ${has(site.wellnessNote) ? `<p class="body small" data-reveal>${esc(loc(site.wellnessNote))}</p>` : ''}
    </div>
    <figure class="split__media" style="grid-column:7/span 6">${media('chatSpaRelax', { ratio: 'ratio-43', sizes: '(max-width: 900px) 90vw, 48vw' })}</figure>
  </div>
</section>
<section class="section section--dark section--flush-bottom" aria-labelledby="spaces-title">
  <div class="container section-head" style="margin-bottom:0">
    <div class="section-head__title stack stack--lg">
      <div data-reveal>${eyebrow('02', t('The spaces', 'Gli spazi'))}</div>
      <h2 class="h2" id="spaces-title" data-split>${lines(t(['Three ways', '<em>to unwind.</em>'], ['Tre modi', '<em>per rilassarsi.</em>']))}</h2>
    </div>
  </div>
${spaces.map((sp, i) => `
  <article class="space${sp.portrait ? ' space--portrait' : ''}" id="${sp.id}" aria-labelledby="${sp.id}-t">
    <div class="container grid space__grid">
      <figure class="space__media">${media(sp.key, { ratio: sp.portrait ? 'ratio-45' : 'ratio-32', sizes: sp.portrait ? '(max-width: 900px) 100vw, 34vw' : '(max-width: 900px) 100vw, 50vw' })}</figure>
      <div class="space__text">
        <p class="room__count" data-reveal>${pad(i + 1)} / ${pad(spaces.length)}</p>
        <h3 class="h2" id="${sp.id}-t" data-split style="margin-top:1rem">${lines([sp.name])}</h3>
        <p class="room__line" data-reveal>${sp.line}</p>
        <p class="body" data-reveal style="margin-top:1.5rem">${sp.text}</p>
      </div>
    </div>
  </article>`).join('')}
</section>
<section class="section" aria-labelledby="treat-title">
  <div class="container grid split split--rev">
    <figure class="split__media" style="grid-column:7/span 5">${media('chatMassage', { ratio: 'ratio-45', sizes: '(max-width: 900px) 90vw, 36vw' })}</figure>
    <div class="split__text stack stack--lg">
      <div data-reveal>${eyebrow('03', t('Treatments', 'Trattamenti'))}</div>
      <h2 class="h2" id="treat-title" data-split>${lines(t(['Massages,', '<em>on request.</em>'], ['Massaggi,', '<em>su richiesta.</em>']))}</h2>
      <p class="body" data-reveal>${t('Massages and beauty treatments can be arranged during your stay. Ask us when you book, or write to us before you arrive.', 'Massaggi e trattamenti di bellezza possono essere organizzati durante il soggiorno. Chiedicelo al momento della prenotazione, oppure scrivici prima del tuo arrivo.')}</p>
      <div class="room__actions" data-reveal><a class="btn btn--solid" href="contact.html">${t('Ask for information', 'Richiedi informazioni')}</a>${link('gallery.html?f=wellness', t('Gallery', 'Galleria'))}</div>
    </div>
  </div>
</section>
${closingCta(t(['Book your apartment', '<em>and get ready for a luxury stay.</em>'], ['Prenota il tuo appartamento', '<em>e preparati a vivere un soggiorno di lusso.</em>']))}`,
  });

  // ABOUT -----------------------------------------------------------------
  const pillars = [
    ['chatSofa', 'I', t('Light', 'Luce'), t('Apartments that face the light, finished in soft whites so the Sicilian sun can do the rest.', 'Appartamenti rivolti alla luce, rifiniti in bianchi morbidi perché il sole siciliano faccia il resto.')],
    ['chatNiche', 'II', t('Detail', 'Dettaglio'), t('Fine materials, refined atmospheres and carefully chosen details. A perfect balance of design, harmony and understated luxury.', 'Materiali pregiati, atmosfere raffinate e dettagli ricercati. Un equilibrio perfetto tra design, armonia e lusso discreto.')],
    ['chatKitchenette', 'III', t('Ease', 'Comodità'), t('Kitchenettes, room to unpack, a reception to help. Everything you need for a short stay or a long one.', 'Angoli cottura, spazio per disfare le valigie, una reception sempre pronta ad aiutare. Tutto ciò che serve per un soggiorno breve o lungo.')],
  ];
  const story = has(site.story) ? loc(site.story).split(/\n\s*\n/).map((para) => `<p class="body" data-reveal>${esc(para.trim())}</p>`).join('') : '';
  pages['about.html'] = layout({
    page: 'about', file: 'about.html', ogImage: 'chatAboutReception',
    title: t(`About us — ${site.name}, ${site.city}`, `Chi siamo — ${site.name}, ${site.city}`),
    description: t(`The story and the spirit of ${site.name}, apartments and suites in the historic centre of ${site.city}.`, `La storia e lo spirito di ${site.name}, appartamenti e suite nel centro storico di ${site.city}.`),
    body: `
${pageHero({ key: 'chatAboutReception', eyebrowText: t('About us', 'Chi siamo'), title: t(['Elegant', '<em>Apartments.</em>'], ['Eleganti', '<em>Appartamenti.</em>']), lede: t('Living in luxury. Bright spaces, quality materials and a welcoming atmosphere make Eccelso the perfect setting for your stay.', 'Dimorare nel lusso. Ambienti luminosi, materiali di qualità e un’atmosfera accogliente rendono Eccelso la cornice perfetta per il tuo soggiorno.') })}
<section class="section" aria-label="${t('Our philosophy', 'La nostra filosofia')}">
  <div class="container grid"><div class="statement" data-reveal><p class="lead">${t('Every space has been designed to make you <em>feel at home</em>, with the elegance and comforts of a luxury hotel in Palermo’s historic centre.', 'Ogni spazio è stato progettato per farti <em>sentire a casa</em>, con l’eleganza e i comfort di un hotel di lusso nel centro storico di Palermo.')}</p></div></div>
</section>
<section class="section section--flush-top" aria-label="${t('Hospitality', 'Ospitalità')}">
  <div class="container grid split">
    <div class="split__media" style="grid-column:2/span 4">${media('chatBreakfast', { ratio: 'ratio-23', sizes: '(max-width: 900px) 90vw, 30vw' })}</div>
    <div class="split__text stack stack--lg">
      <div data-reveal>${eyebrow('01', t('Hospitality', 'Ospitalità'))}</div>
      <p class="body" data-reveal>${t('The name Eccelso captures the essence of the property: a refined play on words that recalls Via del Celso, where the residence stands, and the idea of excellence that defines its service, design and finishes.', 'Il nome Eccelso racchiude l’essenza della struttura: un raffinato gioco di parole che richiama Via del Celso, dove sorge la residenza, e l’idea di eccellenza che caratterizza servizi, design e finiture.')}</p>
      ${story}
    </div>
  </div>
</section>
<section class="section section--paper" aria-labelledby="values-title">
  <div class="container">
    <div class="section-head">
      <div class="section-head__title stack stack--lg"><div data-reveal>${eyebrow('02', t('What matters to us', 'Ciò che conta per noi'))}</div><h2 class="h2" id="values-title" data-split>${lines(t(['Three quiet', '<em>principles.</em>'], ['Tre principi', '<em>silenziosi.</em>']))}</h2></div>
    </div>
    <div class="grid pillars">
      ${pillars.map(([k, n, ti, c], i) => `<article class="pillar">${media(k, { ratio: 'ratio-45', sizes: '(max-width: 900px) 85vw, 30vw', d: i * 0.12 })}<div class="pillar__body" data-reveal><span class="pillar__num">${n}</span><div><h3 class="h3">${ti}</h3><p class="body">${c}</p></div></div></article>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="section" aria-labelledby="around-title">
  <div class="container grid split split--rev">
    <figure class="split__media" style="grid-column:7/span 5">${media('chatCathedral', { ratio: 'ratio-45', parallax: true, sizes: '(max-width: 900px) 100vw, 40vw', extra: 'data-speed="0.1"' })}<figcaption class="caption">${t('Palermo Cathedral, three minutes on foot', 'La Cattedrale di Palermo, a tre minuti a piedi')}</figcaption></figure>
    <div class="split__text stack stack--lg">
      <div data-reveal>${eyebrow('03', t('Around us', 'Intorno a noi'))}</div>
      <h2 class="h2" id="around-title" data-split>${lines(t(['City and sea,', '<em>close by.</em>'], ['Città e mare,', '<em>a due passi.</em>']))}</h2>
      <p class="body" data-reveal>${t('Churches, palaces and markets are all around you, and the La Cala waterfront is just a few minutes on foot.', `Chiese, palazzi e mercati di ${esc(site.city)} sono tutti intorno, e il lungomare della Cala è a pochi minuti a piedi.`)}</p>
      <div data-reveal>${link('location.html', t('The location', 'Dove siamo'))}</div>
    </div>
  </div>
</section>
${closingCta()}`,
  });

  // GALLERY ---------------------------------------------------------------
  const cats = [['all', t('All', 'Tutte')], ['rooms', t('Apartments', 'Appartamenti')], ['spaces', t('Spaces', 'Spazi')], ['wellness', t('Wellness', 'Benessere')], ['details', t('Details', 'Dettagli')], ['palermo', site.city]];
  const count = (c) => (c === 'all' ? gallery.length : gallery.filter((g) => g[1] === c).length);
  pages['gallery.html'] = layout({
    page: 'gallery', file: 'gallery.html', ogImage: 'chatG8',
    title: t(`Gallery — ${site.name}, ${site.city}`, `Galleria — ${site.name}, ${site.city}`),
    description: t(`Photographs of ${site.name}: apartments, suites, wellness, details and ${site.city}.`, `Le foto di ${site.name}: appartamenti, suite, benessere, dettagli e ${site.city}.`),
    body: `
${pageHero({ key: 'chatG8', focusX: '58%', eyebrowText: t('Gallery', 'Galleria'), title: t(['Look', '<em>around.</em>'], ['Guardati', '<em>intorno.</em>']), lede: t('Apartments and suites, small details, the wellness area and the city around us.', 'Appartamenti e suite, piccoli dettagli, l’area benessere e la città che ci circonda.') })}
<section class="section" aria-label="${t('Photo gallery', 'Galleria fotografica')}">
  <div class="container">
    <div class="grid gallery-intro"><div class="statement" data-reveal><p class="lead">${t('The gallery will guide you through <em>refined spaces</em>, designed to make you feel special from the very first glance.', 'La gallery ti accompagnerà alla scoperta di <em>spazi raffinati</em>, pensati per farti sentire speciale fin dal primo sguardo.')}</p></div></div>
    <div class="filters" role="tablist" aria-label="${t('Filter photographs', 'Filtra le foto')}" data-reveal>
      ${cats.map(([c, l], i) => `<button class="filter${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-filter="${c}">${l}<sup>${pad(count(c))}</sup></button>`).join('')}
    </div>
    <div class="masonry" data-gallery>
      ${gallery.map(([k, c], i) => `<figure class="masonry__item" data-cat="${c}"><button type="button" data-lb="${i}" data-full="${src(k, 2400)}" aria-label="${t('Open photo', 'Apri la foto')}: ${esc(alt(k))}"><div class="media" data-reveal style="--d:${(i % 3) * 0.08}s;${lq(k)}">${img(k, { sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 32vw' })}${aiBadge(k)}</div></button><figcaption class="masonry__cap"><span>${esc(alt(k).split(',')[0])}</span><span>${cats.find((x) => x[0] === c)[1]}</span></figcaption></figure>`).join('\n      ')}
    </div>
  </div>
</section>
<div class="lightbox" role="dialog" aria-modal="true" aria-label="${t('Photo viewer', 'Visualizzatore foto')}" data-lightbox>
  <div class="lightbox__top"><span data-lb-count>01 / ${pad(gallery.length)}</span><button class="lightbox__close" data-lb-close>${t('Close', 'Chiudi')} ${icon.close}</button></div>
  <div class="lightbox__stage"><img alt="" data-lb-img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="><button class="slider-btn lightbox__prev" data-lb-prev aria-label="${t('Previous photo', 'Foto precedente')}">${icon.prev}</button><button class="slider-btn lightbox__next" data-lb-next aria-label="${t('Next photo', 'Foto successiva')}">${icon.next}</button></div>
  <div class="lightbox__bottom"><p class="lightbox__caption" data-lb-cap></p></div>
</div>
${closingCta()}`,
  });

  // LOCATION --------------------------------------------------------------
  const { lat, lng } = site.map;
  const bbox = [lng - 0.0065, lat - 0.0038, lng + 0.0065, lat + 0.0038].map((n) => n.toFixed(5)).join('%2C');
  pages['location.html'] = layout({
    page: 'location', file: 'location.html', ogImage: 'chatCourtyard',
    title: t(`Location — ${site.name}, ${site.city}`, `Dove siamo — ${site.name}, ${site.city}`),
    description: t(`${site.name} is in Via del Celso, in the historic centre of Palermo, three minutes on foot from the Cathedral. Nearby sights, map and directions.`, `${site.name} si trova in Via del Celso, nel centro storico di Palermo, a tre minuti a piedi dalla Cattedrale. Luoghi vicini, mappa e indicazioni.`),
    body: `
${pageHero({ key: 'chatCourtyard', eyebrowText: t('Location', 'Dove siamo'), title: t(['In the heart', '<em>of the old town.</em>'], ['Nel cuore', '<em>della città antica.</em>']), lede: t(`Via del Celso, three minutes on foot from the Cathedral: old ${esc(site.city)} begins just outside the door.`, `Via del Celso, a tre minuti a piedi dalla Cattedrale: la ${esc(site.city)} antica comincia appena fuori dalla porta.`) })}
<section class="section section--paper" aria-labelledby="city2-title">
  <div class="container grid places">
    <figure class="places__a">${media('chatCathedralArches', { ratio: 'ratio-34', sizes: '(max-width: 900px) 100vw, 40vw' })}<figcaption class="caption">${t('Palermo Cathedral, three minutes on foot', 'La Cattedrale di Palermo, a tre minuti a piedi')}</figcaption></figure>
    <div class="places__text stack stack--lg">
      <div data-reveal>${eyebrow('01', site.city)}</div>
      <h2 class="h2" id="city2-title" data-split>${lines(t([`${esc(site.city)},`, '<em>between history and wonder.</em>'], [`${esc(site.city)},`, '<em>tra storia e meraviglia.</em>']))}</h2>
      <p class="body" data-reveal>${t('Through timeless alleyways, Mediterranean scents and baroque splendour, Palermo reveals its most authentic soul. Just steps away, the charm of the markets and the majesty of the Cathedral invite you to lose yourself in the city’s beauty.', 'Tra vicoli senza tempo, profumi mediterranei e splendori barocchi, Palermo svela la sua anima più autentica. A pochi passi, il fascino dei mercati e la maestosità della Cattedrale invitano a perdersi nella bellezza della città.')}</p>
    </div>
    <figure class="places__b">${media('aiTerraceView', { ratio: 'ratio-43', sizes: '(max-width: 900px) 90vw, 34vw', d: 0.12 })}<figcaption class="caption">${t('Our terrace, among the rooftops of the old town', 'La nostra terrazza, tra i tetti del centro storico')}</figcaption></figure>
  </div>
</section>
<section class="section section--dark" aria-labelledby="near-title">
  <div class="container grid">
    <div style="grid-column:1/span 4" class="stack stack--lg">
      <div data-reveal>${eyebrow('02', t('On foot', 'A piedi'))}</div>
      <h2 class="h2" id="near-title" data-split>${lines(t(['The old city,', '<em>around the corner.</em>'], ['La città antica,', '<em>dietro l’angolo.</em>']))}</h2>
    </div>
    <ol class="nearby" style="grid-column:6/span 7" data-reveal>
      ${nearbyT().map(([n, note, d], i) => `<li><span class="nearby__i">${pad(i + 1)}</span><span class="nearby__name">${esc(n)}<small>${esc(note)}</small></span><span class="nearby__d">${esc(d)}</span></li>`).join('\n      ')}
    </ol>
  </div>
</section>
<section class="section" id="find-us" aria-labelledby="find-title">
  <div class="container grid map-block">
    <div class="map-block__info">
      <div data-reveal>${eyebrow('03', t('Find us', 'Come trovarci'))}</div>
      <h2 class="h2" id="find-title" style="margin-top:1.75rem" data-split>${lines(t(['Getting', '<em>here.</em>'], ['Come', '<em>arrivare.</em>']))}</h2>
      <p class="lead" style="margin-top:2rem;font-size:1.375rem" data-reveal>${esc(site.address)}<br>${esc(site.postcode)}</p>
      <ul class="dist" data-reveal>
        <li><span>${t('Palermo Cathedral', 'Cattedrale di Palermo')}</span><span>${t('about 3 min on foot', 'circa 3 min a piedi')}</span></li>
        <li><span>${t('Palermo Airport (Falcone–Borsellino)', 'Aeroporto di Palermo (Falcone–Borsellino)')}</span><span>${t('about 29 km', 'circa 29 km')}</span></li>
        <li><span>${t('Airport shuttle', 'Navetta aeroportuale')}</span><span>${t('on request, extra charge', 'su richiesta, a pagamento')}</span></li>
        ${has(site.stationTime) ? `<li><span>${t('Palermo Centrale station', 'Stazione di Palermo Centrale')}</span><span>${esc(loc(site.stationTime))}</span></li>` : ''}
        <li><span>${t('Parking', 'Parcheggio')}</span><span>${t('paid and attended, nearby', 'a pagamento e custoditi, nei dintorni')}</span></li>
      </ul>
      <div style="margin-top:2.25rem" data-reveal><a class="link" href="${mapsUrl}" target="_blank" rel="noopener"><span>${t('Open in Google Maps', 'Apri in Google Maps')}</span>${icon.arrow}</a></div>
    </div>
    <div class="map-block__map" data-reveal="fade">
      <iframe title="${t('Map of', 'Mappa di')} ${esc(site.name)}, ${esc(site.city)}" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&amp;layer=mapnik"></iframe>
      <span class="map-block__pin" aria-hidden="true"></span>
    </div>
  </div>
</section>
${closingCta()}`,
  });

  // CONTACT ---------------------------------------------------------------
  pages['contact.html'] = layout({
    page: 'contact', file: 'contact.html', ogImage: 'receptionDesk',
    title: t(`Contact — ${site.name}, ${site.city}`, `Contatti — ${site.name}, ${site.city}`),
    description: t(`Contact ${site.name} in ${site.city}: phone, mobile, email and address.`, `Contatta ${site.name} a ${site.city}: telefono, cellulare, email e indirizzo.`),
    body: `
${pageHero({ key: 'receptionDesk', focusX: '57%', eyebrowText: t('Contact', 'Contatti'), title: t(["We're here", '<em>for you.</em>'], ['Siamo qui', '<em>per te.</em>']), lede: t('Questions before you book, or something to arrange for your stay. Write, call or send us a message.', 'Domande prima di prenotare, o qualcosa da organizzare per il tuo soggiorno. Scrivici, chiamaci o mandaci un messaggio.') })}
<section class="section" aria-labelledby="c-title">
  <div class="container grid contact">
    <div class="contact__info">
      <div data-reveal>${eyebrow('', t('Get in touch', 'Scrivici'))}</div>
      <h2 class="h2" id="c-title" style="margin-top:1.75rem" data-split>${lines(t(['Write to us,', '<em>or call.</em>'], ['Scrivici,', '<em>o chiamaci.</em>']))}</h2>
      <ul class="contact-list" data-reveal>
        ${[
          [t('Address', 'Indirizzo'), `<span class="val">${esc(site.address)}<br>${esc(site.postcode)}</span>`, true],
          [t('Telephone', 'Telefono'), phoneLink('val'), has(site.phone)],
          [t('Mobile', 'Cellulare'), mobileLink('val'), has(site.mobile)],
          ['WhatsApp', waLink('val'), has(site.whatsapp)],
          ['Email', emailLink('val'), has(site.email)],
          ['Reception', `<span class="val">${esc(loc(site.reception))}</span>`, has(site.reception)],
          [t('Check-in', 'Arrivo'), `<span class="val">${t(`from ${site.checkInTime}`, `dalle ${site.checkInTime}`)}</span>`, has(site.checkInTime)],
          [t('Check-out', 'Partenza'), `<span class="val">${t(`by ${site.checkOutTime}`, `entro le ${site.checkOutTime}`)}</span>`, has(site.checkOutTime)],
        ].filter(([, , ok]) => ok).map(([l, v]) => `<li><span class="label">${l}</span>${v}</li>`).join('\n        ')}
      </ul>
      <div style="margin-top:2rem" data-reveal>${link('location.html#find-us', t('Map &amp; directions', 'Mappa e indicazioni'))}</div>
      <div class="good" data-reveal>
        <p class="eyebrow">${t('Good to know', 'Buono a sapersi')}</p>
        <ul class="features">
          ${t('<li>Late check-in is guaranteed for a small additional charge</li><li>Luggage storage available</li><li>Airport shuttle on request, at extra charge</li><li>Paid, attended parking available nearby</li><li>To ensure peace and quiet for our guests, pets are not allowed</li>', '<li>Garantiamo il late check-in con un piccolo supplemento aggiuntivo</li><li>Deposito bagagli disponibile</li><li>Navetta aeroportuale su richiesta, a pagamento</li><li>Parcheggi a pagamento custoditi nei dintorni</li><li>Per garantire la quiete dei nostri clienti non sono ammessi animali</li>')}
        </ul>
      </div>
    </div>
    <div class="contact__form" data-reveal>
      <form class="form-grid" data-contact novalidate>
        ${field('c-name', t('Full name', 'Nome e cognome'), { req: true, auto: 'name' })}
        ${field('c-email', 'Email', { type: 'email', req: true, auto: 'email' })}
        ${field('c-phone', t('Telephone', 'Telefono'), { type: 'tel', auto: 'tel', p: t('Optional', 'Facoltativo') })}
        ${field('c-subject', t('Subject', 'Oggetto'), { tag: 'select', opts: t(['Choose a subject', 'Booking enquiry', 'An existing reservation', 'A special occasion', 'Something else'], ['Scegli un oggetto', 'Richiesta di prenotazione', 'Una prenotazione esistente', 'Un’occasione speciale', 'Altro']) })}
        ${field('c-message', t('Your message', 'Il tuo messaggio'), { tag: 'textarea', req: true, span: true })}
        <div class="span-2">${consent('c-consent')}</div>
        <div class="span-2" style="display:flex;flex-wrap:wrap;align-items:center;gap:1.5rem 2rem"><button class="btn btn--solid" type="submit">${t('Send message', 'Invia messaggio')}</button><p class="form-status" data-status role="status"></p></div>
      </form>
    </div>
  </div>
</section>`,
  });

  // BOOKING ---------------------------------------------------------------
  const stepper = (k, label, small, less, more, val) => `<div class="stepper"><span class="stepper__label">${label}<small>${small}</small></span><span class="stepper__ctrl"><button type="button" class="stepper__btn" data-step-btn="${k}:-1" aria-label="${less}">−</button><span class="stepper__val" data-val="${k}" aria-live="polite">${val}</span><button type="button" class="stepper__btn" data-step-btn="${k}:1" aria-label="${more}">+</button></span></div>`;
  const back = () => `<button type="button" class="step__back" data-back>${icon.arrow}${t('Back', 'Indietro')}</button>`;
  pages['booking.html'] = layout({
    page: 'booking', file: 'booking.html', bookBar: false, ogImage: 'biBlu1',
    title: t(`Book your stay — ${site.name}, ${site.city}`, `Prenota il soggiorno — ${site.name}, ${site.city}`),
    description: t(`Request your stay at ${site.name}, ${site.city}: choose your dates, guests and apartment.`, `Richiedi il tuo soggiorno da ${site.name}, ${site.city}: scegli date, ospiti e appartamento.`),
    scripts: ['assets/js/booking.js'],
    body: `
<div class="booking container">
  <div class="booking__head">
    <div><p class="eyebrow">${t('Reservation request', 'Richiesta di prenotazione')}</p><h1 class="h1" style="margin-top:1rem">${t('Plan <em>your stay.</em>', 'Organizza <em>il tuo soggiorno.</em>')}</h1></div>
    <ol class="steps" aria-label="${t('Booking steps', 'Passaggi della prenotazione')}" data-steps><li class="is-current"><span>${t('Dates', 'Date')}</span></li><li><span>${t('Apartment', 'Appartamento')}</span></li><li><span>${t('Details', 'Dati')}</span></li><li><span>${t('Review', 'Riepilogo')}</span></li></ol>
  </div>
  <div class="grid booking__layout">
    <div class="booking__main">
      <form data-booking novalidate>
        <section class="step is-active" data-step="1" aria-labelledby="s1">
          <h2 class="h3 step__title" id="s1">${t('When would you like to come?', 'Quando vorresti venire?')}</h2>
          <p class="body step__intro">${t('Choose your arrival and departure dates.', 'Scegli le date di arrivo e di partenza.')}</p>
          <div class="date-sum"><div><span class="bookbar__label">${t('Check-in', 'Arrivo')}</span><div class="val is-empty" data-sum-in>${t('Select', 'Seleziona')}</div></div><div><span class="bookbar__label">${t('Check-out', 'Partenza')}</span><div class="val is-empty" data-sum-out>${t('Select', 'Seleziona')}</div></div><div><span class="bookbar__label">${t('Nights', 'Notti')}</span><div class="val" data-sum-n>—</div></div></div>
          <div class="cal" data-cal></div>
          <div class="guests-block">
            <p class="eyebrow" style="margin-bottom:.5rem">${t('Guests', 'Ospiti')}</p>
            ${stepper('adults', t('Adults', 'Adulti'), t('Ages 13+', 'Dai 13 anni'), t('Fewer adults', 'Meno adulti'), t('More adults', 'Più adulti'), 2)}
            ${stepper('children', t('Children', 'Bambini'), t('Ages 0–12', '0–12 anni'), t('Fewer children', 'Meno bambini'), t('More children', 'Più bambini'), 0)}
          </div>
          <p class="step__error" data-err="1" role="alert"></p>
          <div class="step__nav"><span></span><button type="button" class="btn btn--solid" data-next>${t('Continue', 'Continua')}</button></div>
        </section>

        <section class="step" data-step="2" aria-labelledby="s2">
          <h2 class="h3 step__title" id="s2">${t('Choose your apartment', 'Scegli l’appartamento')}</h2>
          <p class="body step__intro">${t('Pick an apartment type, or let us suggest the best one for your dates.', 'Scegli una tipologia, oppure lascia che ti suggeriamo la migliore per le tue date.')}</p>
          <div class="room-opts" role="radiogroup" aria-label="${t('Apartment type', 'Tipologia di appartamento')}">
            ${R.map((r) => `<label class="room-opt" data-room-opt="${r.slug}"><input type="radio" name="room" value="${r.slug}"><div class="media" style="${lq(r.image)}">${img(r.image, { sizes: '11rem', alt: '' })}${aiBadge(r.image)}</div><div><div class="room-opt__name">${r.bookingName}</div><p class="room-opt__line">${r.line}</p></div><span class="room-opt__radio" aria-hidden="true"></span></label>`).join('\n            ')}
            <label class="room-opt room-opt--none"><input type="radio" name="room" value="any"><div><div class="room-opt__name"><em>${t('No preference', 'Nessuna preferenza')}</em></div><p class="room-opt__line">${t('Suggest the best available apartment for our dates.', 'Suggeritemi il miglior appartamento disponibile per le mie date.')}</p></div><span class="room-opt__radio" aria-hidden="true"></span></label>
          </div>
          <p class="step__error" data-err="2" role="alert"></p>
          <div class="step__nav">${back()}<button type="button" class="btn btn--solid" data-next>${t('Continue', 'Continua')}</button></div>
        </section>

        <section class="step" data-step="3" aria-labelledby="s3">
          <h2 class="h3 step__title" id="s3">${t('Your details', 'I tuoi dati')}</h2>
          <p class="body step__intro">${t("We'll use these only to reply to your request.", 'Li useremo solo per rispondere alla tua richiesta.')}</p>
          <div class="form-grid">
            ${field('b-first', t('First name', 'Nome'), { req: true, auto: 'given-name' })}
            ${field('b-last', t('Last name', 'Cognome'), { req: true, auto: 'family-name' })}
            ${field('b-email', 'Email', { type: 'email', req: true, auto: 'email' })}
            ${field('b-phone', t('Telephone', 'Telefono'), { type: 'tel', req: true, auto: 'tel', p: '+39 …' })}
            ${field('b-country', t('Country', 'Paese'), { auto: 'country-name', p: t('Optional', 'Facoltativo') })}
            ${field('b-arrival', t('Estimated arrival', 'Orario di arrivo previsto'), { tag: 'select', opts: t(['Not sure yet', 'Morning (before 12:00)', 'Afternoon (12:00–17:00)', 'Evening (17:00–21:00)', 'Late (after 21:00)'], ['Non so ancora', 'Mattina (prima delle 12:00)', 'Pomeriggio (12:00–17:00)', 'Sera (17:00–21:00)', 'Tardi (dopo le 21:00)']) })}
            ${field('b-requests', t('Special requests', 'Richieste particolari'), { tag: 'textarea', span: true, p: t('A celebration, a cot, dietary needs, transfers…', 'Una ricorrenza, una culla, esigenze alimentari, transfer…') })}
          </div>
          <div class="step__nav">${back()}<button type="button" class="btn btn--solid" data-next>${t('Review request', 'Vai al riepilogo')}</button></div>
        </section>

        <section class="step" data-step="4" aria-labelledby="s4">
          <h2 class="h3 step__title" id="s4">${t('Review your request', 'Controlla la tua richiesta')}</h2>
          <p class="body step__intro">${t('Please check everything before sending.', 'Verifica che sia tutto corretto prima di inviare.')}</p>
          <dl class="review" data-review></dl>
          <div style="margin-top:2rem">${consent('b-consent')}</div>
          <p class="body small" style="margin-top:1rem">${t(`This is a reservation <strong>request</strong>, not a confirmed booking, and no payment is taken now. We'll reply${reply()} to confirm availability and the rate for your stay.`, `Questa è una <strong>richiesta</strong> di prenotazione, non una prenotazione confermata, e non viene richiesto alcun pagamento. Ti risponderemo${reply()} per confermare la disponibilità e la tariffa del tuo soggiorno.`)}</p>
          <p class="step__error" data-err="4" role="alert"></p>
          <div class="step__nav">${back()}<button type="submit" class="btn btn--solid" data-submit>${t('Send request', 'Invia richiesta')}</button></div>
        </section>

        <section class="step confirm" data-step="5" aria-labelledby="s5" tabindex="-1">
          <div class="confirm__mark">${icon.tick}</div>
          <p class="eyebrow">${t('Request received', 'Richiesta ricevuta')}</p>
          <h2 class="h1" id="s5" style="margin-top:1.25rem">Grazie, <em data-c-name></em>.</h2>
          <p class="body" style="margin-top:1.75rem">${t(`Your request is with us. We'll check availability and reply to <strong data-c-email></strong>${reply()}.`, `Abbiamo ricevuto la tua richiesta. Verificheremo la disponibilità e ti risponderemo all’indirizzo <strong data-c-email></strong>${reply()}.`)}</p>
          <div class="confirm__ref"><span class="bookbar__label">${t('Reference', 'Riferimento')}</span><strong data-c-ref></strong></div>
          <p class="demo-flag" data-demo hidden style="margin-top:1.5rem">${t('Demo mode: no booking endpoint is configured yet, so this request was not sent anywhere. Set <code>bookingEndpoint</code> in src/content.mjs.', 'Modalità demo: non è ancora configurato un indirizzo di invio, quindi questa richiesta non è stata inviata. Imposta <code>bookingEndpoint</code> in src/content.mjs.')}</p>
          <div style="display:flex;flex-wrap:wrap;gap:1.5rem 2.5rem;margin-top:3rem;align-items:center"><a class="btn btn--solid" href="index.html">${t('Back to home', 'Torna alla home')}</a>${link('location.html', t('Plan your visit', 'Organizza la visita'))}</div>
        </section>
      </form>
    </div>
    <aside class="booking__aside" aria-label="${t('Your stay', 'Il tuo soggiorno')}">
      <div class="summary" data-summary>
        <div class="media"><img src="${src('chatLobby', 960)}" alt="" data-sum-img width="${manifest.chatLobby.w}" height="${manifest.chatLobby.h}">${aiLabel() ? `<span class="ai-badge" data-sum-ai hidden>${aiLabel()}</span>` : ''}</div>
        <div class="summary__body">
          <p class="eyebrow">${t('Your stay', 'Il tuo soggiorno')}</p>
          <p class="summary__room" data-sum-room>${esc(site.name)}, ${esc(site.city)}</p>
          <button type="button" class="summary-toggle" data-sum-toggle aria-expanded="false">${t('Details', 'Dettagli')}</button>
          <dl>
            <div><dt>${t('Check-in', 'Arrivo')}</dt><dd data-s-in>—</dd></div>
            <div><dt>${t('Check-out', 'Partenza')}</dt><dd data-s-out>—</dd></div>
            <div><dt>${t('Nights', 'Notti')}</dt><dd data-s-n>—</dd></div>
            <div><dt>${t('Guests', 'Ospiti')}</dt><dd data-s-g>${t('2 adults', '2 adulti')}</dd></div>
          </dl>
          <p class="summary__note">${t(`Check-in from ${site.checkInTime} · Check-out by ${site.checkOutTime}<br>No payment required to send a request.`, `Arrivo dalle ${site.checkInTime} · Partenza entro le ${site.checkOutTime}<br>Nessun pagamento richiesto per inviare la richiesta.`)}</p>
        </div>
      </div>
    </aside>
  </div>
</div>`,
  });

  // PRIVACY ---------------------------------------------------------------
  pages['privacy.html'] = layout({
    page: 'privacy', file: 'privacy.html',
    title: t(`Privacy & cookies — ${site.name}`, `Privacy e cookie — ${site.name}`),
    description: t(`Privacy and cookie policy of ${site.name}.`, `Informativa privacy e cookie di ${site.name}.`),
    body: `
<section class="section" style="padding-top:calc(var(--header-h) + 5rem)">
  <div class="container--narrow stack stack--lg">
    <p class="eyebrow">${t('Legal', 'Note legali')}</p>
    <h1 class="h1">${t('Privacy <em>&amp; cookies.</em>', 'Privacy <em>e cookie.</em>')}</h1>
    <p class="body">${t(`Our full privacy policy is being finalised. ${esc(site.fullName)} uses the details you send through this website only to answer your request. For any question about your data, call us on ${phoneLink()}${has(site.email) ? ` or write to ${emailLink()}` : ''}.`, `La nostra informativa completa è in fase di definizione. ${esc(site.fullName)} utilizza i dati inviati tramite questo sito esclusivamente per rispondere alla tua richiesta. Per qualsiasi domanda sui tuoi dati, chiamaci al ${phoneLink()}${has(site.email) ? ` o scrivi a ${emailLink()}` : ''}.`)}</p>
    <h2 class="h3" id="cookies">Cookie</h2>
    <p class="body">${t('This website sets no advertising or tracking cookies. It loads typefaces from Google Fonts and, on the Location page, a map from OpenStreetMap.', 'Questo sito non utilizza cookie pubblicitari o di tracciamento. Carica i caratteri tipografici da Google Fonts e, nella pagina Dove siamo, una mappa da OpenStreetMap.')}</p>
  </div>
</section>`,
  });

  return pages;
}

// ── AI image report ────────────────────────────────────────────────────────
{
  const used = Object.keys(images).filter(isAi);
  console.log(`Pictures in use (${used.length}): ${used.join(', ')}`);
  console.log(site.production ? '→ production: AI labels ON, indexing allowed' : '→ STAGING: AI images unlabelled, pages set to noindex — see site.production in src/content.mjs before launch');
}

// ── write both languages ───────────────────────────────────────────────────
for (const lang of LANGS) {
  LANG = lang;
  B = lang === 'it' ? '' : '../';
  const outDir = lang === 'it' ? root : join(root, 'en');
  mkdirSync(outDir, { recursive: true });
  const pages = buildPages();
  for (const [file, html] of Object.entries(pages)) writeFileSync(join(outDir, file), html);
  console.log(`built ${lang}: ${Object.keys(pages).map((f) => (lang === 'it' ? f : `en/${f}`)).join(', ')}`);
}
