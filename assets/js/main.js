/* ECCELSO — site interactions (no dependencies) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CFG = window.ECCELSO || {};
  const I18N = CFG.i18n || {};
  const T = (k, vars = {}) => { let v = I18N[k]; if (v === undefined) { console.warn('i18n missing:', k); v = k; } return v.replace(/\{(\w+)\}/g, (_, n) => vars[n]); };
  const LOCALE = I18N.locale || 'en-GB';
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const plural = (n, one, many) => `${n} ${n === 1 ? T(one) : T(many)}`;
  const guestsText = (a, c) => `${plural(a, 'adult', 'adults')}${c ? `, ${plural(c, 'child', 'children')}` : ''}`;
  window.EccelsoT = { T, plural, guestsText };
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };

  /* ---------- dates ---------- */
  const D = {
    iso: (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    parse: (s) => { if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null; const [y, m, d] = s.split('-').map(Number); const r = new Date(y, m - 1, d); return isNaN(r) ? null : r; },
    today: () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; },
    add: (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; },
    nights: (a, b) => Math.round((b - a) / 864e5),
    fmt: (d, o = { weekday: 'short', day: 'numeric', month: 'short' }) => cap(d.toLocaleDateString(LOCALE, o)),
  };

  /* ---------- range calendar ---------- */
  class Calendar {
    constructor(el, { months = 2, start = null, end = null, minNights = 1, onChange = () => {}, onComplete = () => {} } = {}) {
      Object.assign(this, { el, months, start, end, minNights, onChange, onComplete });
      this.min = D.today();
      this.max = D.add(this.min, 540);
      const base = start || this.min;
      this.view = new Date(base.getFullYear(), base.getMonth(), 1);
      this.hover = null;
      el.addEventListener('click', (e) => this.click(e));
      el.addEventListener('mouseover', (e) => { const b = e.target.closest('[data-d]'); if (b && this.start && !this.end) { this.hover = D.parse(b.dataset.d); this.paint(); } });
      el.addEventListener('keydown', (e) => this.key(e));
      this.render();
    }
    setMonths(n) { if (n !== this.months) { this.months = n; this.render(); } }
    click(e) {
      const nav = e.target.closest('[data-nav]');
      if (nav) { e.preventDefault(); this.view.setMonth(this.view.getMonth() + Number(nav.dataset.nav)); this.render(); return; }
      if (e.target.closest('[data-clear]')) { e.preventDefault(); this.start = this.end = null; this.render(); this.onChange(this); return; }
      const b = e.target.closest('[data-d]');
      if (!b || b.disabled) return;
      e.preventDefault();
      const d = D.parse(b.dataset.d);
      if (!this.start || this.end || d <= this.start) { this.start = d; this.end = null; }
      else if (D.nights(this.start, d) < this.minNights) { this.end = D.add(this.start, this.minNights); }
      else { this.end = d; }
      this.hover = null;
      this.paint();
      this.onChange(this);
      if (this.end) this.onComplete(this);
      const f = this.el.querySelector(`[data-d="${b.dataset.d}"]`); if (f) f.focus();
    }
    key(e) {
      const b = e.target.closest('[data-d]'); if (!b) return;
      const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!(e.key in map)) return;
      e.preventDefault();
      const next = D.add(D.parse(b.dataset.d), map[e.key]);
      if (next < this.min || next > this.max) return;
      let t = this.el.querySelector(`[data-d="${D.iso(next)}"]`);
      if (!t) { this.view.setMonth(this.view.getMonth() + (map[e.key] > 0 ? 1 : -1)); this.render(); t = this.el.querySelector(`[data-d="${D.iso(next)}"]`); }
      if (t) t.focus();
    }
    render() {
      const minView = new Date(this.min.getFullYear(), this.min.getMonth(), 1);
      if (this.view < minView) this.view = minView;
      const dows = I18N.dows || ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
      let html = `<div class="cal__head"><button type="button" class="cal__nav" data-nav="-1" aria-label="${T('prevMonth')}" ${this.view <= minView ? 'disabled' : ''}><svg viewBox="0 0 18 12" fill="none" stroke="currentColor"><path d="M18 6H1M6 1L1 6l5 5"/></svg></button><button type="button" class="cal__nav" data-nav="1" aria-label="${T('nextMonth')}"><svg viewBox="0 0 18 12" fill="none" stroke="currentColor"><path d="M0 6h17M12 1l5 5-5 5"/></svg></button></div><div class="cal__months" style="--months:${this.months}">`;
      for (let m = 0; m < this.months; m++) {
        const first = new Date(this.view.getFullYear(), this.view.getMonth() + m, 1);
        const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
        const lead = (first.getDay() + 6) % 7;
        html += `<div><p class="cal__title">${first.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })}</p><div class="cal__grid" role="grid">${dows.map((d) => `<span class="cal__dow" aria-hidden="true">${d}</span>`).join('')}`;
        for (let i = 0; i < lead; i++) html += '<span></span>';
        for (let d = 1; d <= days; d++) {
          const date = new Date(first.getFullYear(), first.getMonth(), d);
          const off = date < this.min || date > this.max;
          html += `<button type="button" class="cal__day" data-d="${D.iso(date)}" ${off ? 'disabled' : ''} aria-label="${D.fmt(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}"><span>${d}</span></button>`;
        }
        html += '</div></div>';
      }
      html += `</div><div class="cal__foot"><span data-cal-hint></span><button type="button" data-clear>${T('clear')}</button></div>`;
      this.el.innerHTML = html;
      this.paint();
    }
    paint() {
      const s = this.start, e = this.end || (this.start && this.hover > this.start ? this.hover : null);
      const today = D.iso(this.min);
      $$('[data-d]', this.el).forEach((b) => {
        const d = D.parse(b.dataset.d);
        const isS = s && +d === +s, isE = e && +d === +e;
        b.classList.toggle('is-start', !!isS);
        b.classList.toggle('has-end', !!(isS && e));
        b.classList.toggle('is-end', !!isE);
        b.classList.toggle('in-range', !!(s && e && d > s && d < e));
        b.classList.toggle('is-today', b.dataset.d === today);
        b.setAttribute('aria-pressed', isS || isE ? 'true' : 'false');
        b.tabIndex = -1;
      });
      const focusD = this.start ? D.iso(this.start) : today;
      const fb = this.el.querySelector(`[data-d="${focusD}"]`) || this.el.querySelector('[data-d]:not([disabled])');
      if (fb) fb.tabIndex = 0;
      const hint = $('[data-cal-hint]', this.el);
      if (hint) hint.textContent = !this.start ? T('pickIn') : !this.end ? T('pickOut') : plural(D.nights(this.start, this.end), 'night', 'nights');
    }
  }
  window.EccelsoCalendar = Calendar;
  window.EccelsoDates = D;
  window.EccelsoStore = store;

  /* ---------- header ---------- */
  const header = $('.site-header');
  const mobileBook = $('.mobile-book');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const menuOpen = document.body.classList.contains('menu-open');
    header.classList.toggle('is-solid', y > 40);
    const hide = !menuOpen && y > 420 && y > lastY + 2;
    const show = y < lastY - 2 || y < 420;
    if (hide) { header.classList.add('is-hidden'); document.body.classList.add('header-hidden'); }
    else if (show) { header.classList.remove('is-hidden'); document.body.classList.remove('header-hidden'); }
    if (mobileBook) mobileBook.classList.toggle('is-visible', y > innerHeight * 0.6 && innerHeight + y < document.documentElement.scrollHeight - 160);
    lastY = y;
    parallax();
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------- language switch ---------- */
  $$('[data-lang]').forEach((a) => {
    a.href = a.getAttribute('href') + location.search + location.hash;
    a.addEventListener('click', () => { try { localStorage.setItem('eccelso-lang', a.dataset.lang); } catch { /* ignore */ } });
  });

  /* ---------- menu ---------- */
  const toggle = $('.menu-toggle'), menu = $('#menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    $('.menu-toggle__txt', toggle).textContent = open ? T('close') : T('menu');
    if (open) $('.menu__list a', menu).focus({ preventScroll: true }); else toggle.focus({ preventScroll: true });
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });
  const visuals = $$('.menu__visual img', menu);
  $$('.menu__list a', menu).forEach((a) => a.addEventListener('mouseenter', () => visuals.forEach((v, i) => v.classList.toggle('is-active', i === Number(a.dataset.i)))));

  /* ---------- images: fade in only once actually loaded ---------- */
  const markLoaded = (img) => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  };
  $$('.media img').forEach(markLoaded);

  /* ---------- reveal ---------- */
  const revealEls = $$('[data-reveal], [data-split]');
  if ('IntersectionObserver' in window && !reduced) {
    // clip-path'd media report zero intersection in Chrome, so observe their wrapper instead
    const targets = new Map();
    revealEls.forEach((el) => { const t = el.matches('.media') ? el.parentElement : el; targets.set(t, [...(targets.get(t) || []), el]); });
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      targets.get(en.target).forEach((el) => el.classList.add('is-in'));
      io.unobserve(en.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    targets.forEach((_, t) => io.observe(t));
  } else revealEls.forEach((el) => el.classList.add('is-in'));

  // jumping to a section (#anchor link or URL hash) shows it at once instead of waiting for the scroll reveal
  const revealNow = (hash) => {
    let el = null;
    try { el = hash && hash.length > 1 ? document.querySelector(hash) : null; } catch { /* invalid selector */ }
    if (el) [el, ...el.querySelectorAll('[data-reveal], [data-split]')].forEach((e) => e.classList.add('is-in'));
  };
  revealNow(location.hash);
  addEventListener('hashchange', () => revealNow(location.hash));
  document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#"]'); if (a) revealNow(a.getAttribute('href')); });

  /* ---------- parallax ---------- */
  const pEls = reduced ? [] : $$('[data-parallax]');
  function parallax() {
    const vh = innerHeight;
    for (const el of pEls) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const speed = Number(el.dataset.speed || 0.12);
      const target = el.classList.contains('media--parallax') || el.closest('.page-hero__media') ? el.querySelector('img') : el;
      if (innerWidth <= 900) { target.style.transform = ''; continue; } // no parallax on phones/tablets: images stay still in their frames
      const isTop = el.closest('.hero, .page-hero');
      const offset = isTop ? -r.top * speed : ((r.top + r.height / 2) - vh / 2) * -speed;
      target.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
  }
  onScroll();

  /* ---------- hero slideshow ---------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero__slide', hero), idx = $('[data-hero-index]', hero), bar = $('.hero__progress span', hero);
    const MS = 7000; let i = 0, timer;
    hero.style.setProperty('--slide-ms', `${MS}ms`);
    const go = (n) => {
      slides[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      if (idx) idx.textContent = String(i + 1).padStart(2, '0');
      run();
    };
    const run = () => { if (!bar) return; bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run'); clearTimeout(timer); timer = setTimeout(() => go(i + 1), MS); };
    if (slides.length > 1 && !reduced) run();
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else if (!reduced) run(); });
  }

  /* ---------- horizontal track (rooms) ---------- */
  $$('[data-track]').forEach((track) => {
    const sec = track.closest('section');
    const prev = $('[data-track-prev]', sec), next = $('[data-track-next]', sec), bar = $('[data-track-bar]', sec);
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + parseFloat(getComputedStyle(track).columnGap || 0);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      if (bar) { const w = Math.max(track.clientWidth / track.scrollWidth, 0.12) * 100; bar.style.width = `${w}%`; bar.style.transform = `translateX(${(p * (100 - w) / w) * 100}%)`; }
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
    };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize', update);
    update();
    // mouse drag
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); } track.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('is-dragging'); if (moved) { const s = step(); track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' }); } });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
  });

  /* ---------- moments stage ---------- */
  $$('[data-moments]').forEach((m) => {
    const slides = $$('.moments__slide', m), caps = $$('.moments__cap', m), dots = $$('.moments__dot', m);
    let i = 0, timer;
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      [slides, caps, dots].forEach((set) => set.forEach((el, k) => el.classList.toggle('is-active', k === i)));
      auto();
    };
    const auto = () => { clearTimeout(timer); if (!reduced) timer = setTimeout(() => go(i + 1), 6500); };
    $('[data-mprev]', m).addEventListener('click', () => go(i - 1));
    $('[data-mnext]', m).addEventListener('click', () => go(i + 1));
    dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.go))));
    const stage = $('.moments__stage', m); let tx = null;
    stage.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); tx = null; });
    new IntersectionObserver(([en]) => { if (en.isIntersecting) auto(); else clearTimeout(timer); }).observe(m);
  });

  /* ---------- room index scroll-spy ---------- */
  const spies = $$('[data-spy]');
  if (spies.length && 'IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      spies.forEach((a) => {
        const on = a.dataset.spy === en.target.id;
        a.classList.toggle('is-active', on);
        if (on) a.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    }), { rootMargin: '-45% 0px -50% 0px' });
    spies.forEach((a) => { const t = document.getElementById(a.dataset.spy); if (t) so.observe(t); });
  }

  /* ---------- gallery + lightbox ---------- */
  const gal = $('[data-gallery]');
  if (gal) {
    const items = $$('.masonry__item', gal), filters = $$('[data-filter]');
    const apply = (f) => {
      filters.forEach((b) => { const on = b.dataset.filter === f; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
      items.forEach((it) => { it.hidden = f !== 'all' && it.dataset.cat !== f; });
      $$('.media[data-reveal]', gal).forEach((m) => m.classList.add('is-in'));
    };
    filters.forEach((b) => b.addEventListener('click', () => { apply(b.dataset.filter); history.replaceState(null, '', b.dataset.filter === 'all' ? location.pathname : `?f=${b.dataset.filter}`); }));
    const qf = new URLSearchParams(location.search).get('f');
    if (qf && filters.some((b) => b.dataset.filter === qf)) apply(qf);

    const lb = $('[data-lightbox]'), lbImg = $('[data-lb-img]', lb), cap = $('[data-lb-cap]', lb), cnt = $('[data-lb-count]', lb);
    let list = [], pos = 0, opener = null;
    const show = (p) => {
      pos = (p + list.length) % list.length;
      const btn = list[pos];
      lbImg.classList.add('is-loading');
      const im = new Image();
      im.onload = () => { lbImg.src = im.src; lbImg.alt = $('img', btn).alt; lbImg.classList.remove('is-loading'); };
      im.src = btn.dataset.full;
      cap.textContent = $('img', btn).alt;
      cnt.textContent = `${String(pos + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
      // preload neighbour
      const n = list[(pos + 1) % list.length]; if (n) new Image().src = n.dataset.full;
    };
    const open = (btn) => {
      list = items.filter((it) => !it.hidden).map((it) => $('button', it));
      opener = btn; lb.classList.add('is-open'); document.body.style.overflow = 'hidden';
      show(list.indexOf(btn)); $('[data-lb-close]', lb).focus();
    };
    const close = () => { lb.classList.remove('is-open'); document.body.style.overflow = ''; opener?.focus(); };
    gal.addEventListener('click', (e) => { const b = e.target.closest('[data-lb]'); if (b) open(b); });
    $('[data-lb-close]', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', () => show(pos - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(pos + 1));
    lb.addEventListener('click', (e) => { if (e.target.classList.contains('lightbox__stage')) close(); });
    addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(pos - 1);
      if (e.key === 'ArrowRight') show(pos + 1);
      if (e.key === 'Tab') { const f = $$('button', lb); const first = f[0], last = f.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
    let sx = null;
    lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(pos + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* ---------- home booking bar ---------- */
  const bb = $('[data-bookbar]');
  if (bb) {
    const saved = store.get('eccelso-stay') || {};
    const state = { start: D.parse(saved.in), end: D.parse(saved.out), adults: saved.adults || 2, children: saved.children || 0 };
    if (state.start && state.start < D.today()) state.start = state.end = null;
    const pops = $$('[data-pop]', bb);
    const close = () => pops.forEach((p) => p.classList.remove('is-open'));
    const label = () => {
      const i = $('[data-in]', bb), o = $('[data-out]', bb);
      i.textContent = state.start ? D.fmt(state.start) : T('selectDate'); i.classList.toggle('is-empty', !state.start);
      o.textContent = state.end ? D.fmt(state.end) : T('selectDate'); o.classList.toggle('is-empty', !state.end);
      $('[data-guests]', bb).textContent = guestsText(state.adults, state.children);
      $('[data-val="adults"]', bb).textContent = state.adults; $('[data-val="children"]', bb).textContent = state.children;
      $('[data-step="adults:-1"]', bb).disabled = state.adults <= 1;
      $('[data-step="adults:1"]', bb).disabled = $('[data-step="children:1"]', bb).disabled = state.adults + state.children >= (CFG.maxGuests || 8);
      $('[data-step="children:-1"]', bb).disabled = state.children <= 0;
      store.set('eccelso-stay', { ...saved, in: state.start && D.iso(state.start), out: state.end && D.iso(state.end), adults: state.adults, children: state.children });
    };
    const cal = new Calendar($('[data-cal]', bb), {
      months: innerWidth < 1100 ? 1 : 2, start: state.start, end: state.end, minNights: CFG.minNights || 1,
      onChange: (c) => { state.start = c.start; state.end = c.end; label(); },
      onComplete: () => setTimeout(() => open($('[data-pop="guests"]', bb)), 350),
    });
    // open above the bar when it fits below the fixed header, otherwise below it (and scroll it into view)
    const place = (p) => {
      p.classList.remove('popover--down');
      const bar = bb.getBoundingClientRect(), headH = header ? header.getBoundingClientRect().bottom : 0;
      if (bar.top - 12 - p.offsetHeight < Math.max(headH, 0) + 8) {
        p.classList.add('popover--down');
        requestAnimationFrame(() => {
          const r = p.getBoundingClientRect();
          if (r.bottom > innerHeight - 12) scrollBy({ top: r.bottom - innerHeight + 24, behavior: reduced ? 'auto' : 'smooth' });
        });
      }
    };
    const open = (p) => { close(); place(p); p.classList.add('is-open'); };
    $$('[data-open]', bb).forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const p = $(`[data-pop="${b.dataset.open}"]`, bb), was = p.classList.contains('is-open');
      if (was) close(); else open(p);
    }));
    bb.addEventListener('click', (e) => {
      const s = e.target.closest('[data-step]'); if (!s) return;
      const [k, d] = s.dataset.step.split(':'); state[k] = Math.max(k === 'adults' ? 1 : 0, state[k] + Number(d)); label();
    });
    // close when clicking outside the bar (composedPath survives calendar re-renders)
    document.addEventListener('click', (e) => { if (!e.composedPath().includes(bb)) close(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    addEventListener('resize', () => cal.setMonths(innerWidth < 1100 ? 1 : 2));
    bb.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = new URLSearchParams();
      if (state.start) q.set('in', D.iso(state.start));
      if (state.end) q.set('out', D.iso(state.end));
      q.set('adults', state.adults); if (state.children) q.set('children', state.children);
      location.href = `booking.html?${q}`;
    });
    label();
  }

  /* ---------- Bedzzle booking engine ---------- */
  // The widgets are created by initBedzzle() (inline, per page). If the Bedzzle library could not load,
  // the buttons still lead somewhere: the /prenota page, or from there the reservation request form.
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[id^="be-submit-"]');
    if (!b || typeof window.bzlwgtbe !== 'undefined') return;
    location.href = document.body.classList.contains('page-prenota') ? 'booking.html' : 'prenota.html';
  });

  /* ---------- forms ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE = /^\+?[\d\s().-]{6,20}$/;
  function validateField(input) {
    const f = input.closest('.field'); if (!f) return true;
    const err = $('.field__error', f);
    const v = input.type === 'checkbox' ? input.checked : input.value.trim();
    let msg = '';
    if (input.required && !v) msg = input.type === 'checkbox' ? T('errConsent') : T('errReq');
    else if (v && input.type === 'email' && !EMAIL.test(v)) msg = T('errEmail');
    else if (v && input.type === 'tel' && !PHONE.test(v)) msg = T('errPhone');
    f.classList.toggle('is-invalid', !!msg);
    input.setAttribute('aria-invalid', !!msg);
    if (err) err.textContent = msg;
    return !msg;
  }
  function validateAll(scope) {
    const inputs = $$('input, textarea, select', scope).filter((i) => i.closest('.field'));
    const ok = inputs.map(validateField).every(Boolean);
    if (!ok) inputs.find((i) => i.getAttribute('aria-invalid') === 'true')?.focus();
    return ok;
  }
  document.addEventListener('focusout', (e) => { if (e.target.matches?.('.input') && e.target.value) validateField(e.target); });
  document.addEventListener('input', (e) => { const f = e.target.closest?.('.field.is-invalid'); if (f) validateField(e.target); });
  document.addEventListener('change', (e) => { if (e.target.type === 'checkbox' && e.target.closest('.field')) validateField(e.target); });
  window.EccelsoForms = { validateField, validateAll };

  async function send(endpoint, payload) {
    if (!endpoint) { await new Promise((r) => setTimeout(r, 900)); return { demo: true }; }
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { demo: false };
  }
  window.EccelsoSend = send;

  const cf = $('[data-contact]');
  if (cf) cf.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('[data-status]', cf);
    if (!validateAll(cf)) { status.textContent = ''; return; }
    const btn = $('button[type="submit"]', cf); btn.disabled = true; btn.textContent = T('sending');
    const data = Object.fromEntries(new FormData(cf)); data.type = 'contact'; data.sentAt = new Date().toISOString();
    try {
      const r = await send(CFG.contactEndpoint, data);
      cf.reset();
      status.innerHTML = `<span class="italic" style="font-size:1.125rem;color:var(--c-ink)">${T('thanks')}</span>${r.demo ? ` <span class="demo-flag">${T('demoContact')}</span>` : ''}`;
    } catch {
      status.innerHTML = `<span style="color:var(--c-error)">${T('errSend')}</span>`;
    } finally { btn.disabled = false; btn.textContent = T('sendMsg'); }
  });
})();
