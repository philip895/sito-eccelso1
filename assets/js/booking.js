/* ECCELSO — reservation request flow */
(() => {
  'use strict';
  const form = document.querySelector('[data-booking]');
  if (!form) return;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const D = window.EccelsoDates, store = window.EccelsoStore, CFG = window.ECCELSO || {};
  const { validateAll } = window.EccelsoForms;
  const { T, guestsText } = window.EccelsoT;
  const MAX = CFG.maxGuests || 8;
  const KEY = 'eccelso-stay';

  // ---- state: session → URL params override ----
  const saved = store.get(KEY) || {};
  const q = new URLSearchParams(location.search);
  const state = {
    start: D.parse(q.get('in') || saved.in),
    end: D.parse(q.get('out') || saved.out),
    adults: clamp(parseInt(q.get('adults') || saved.adults || 2, 10), 1, MAX),
    children: clamp(parseInt(q.get('children') || saved.children || 0, 10), 0, MAX - 1),
    room: q.get('room') || saved.room || '',
    details: saved.details || {},
    step: 1,
  };
  if (state.start && state.start < D.today()) state.start = state.end = null;
  if (state.start && state.end && state.end <= state.start) state.end = null;
  if (state.room && state.room !== 'any' && !CFG.rooms.some((r) => r.slug === state.room)) state.room = '';

  function clamp(n, a, b) { return Math.min(b, Math.max(a, isNaN(n) ? a : n)); }
  const persist = () => store.set(KEY, { in: state.start && D.iso(state.start), out: state.end && D.iso(state.end), adults: state.adults, children: state.children, room: state.room, details: state.details });
  const guestsLabel = () => guestsText(state.adults, state.children);
  const roomObj = () => CFG.rooms.find((r) => r.slug === state.room);
  const roomName = () => (state.room === 'any' ? T('noPref') : roomObj()?.name || '—');
  const long = (d) => D.fmt(d, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  // ---- step 1: calendar + guests ----
  const calMonths = () => (innerWidth < 760 ? 1 : 2);
  const cal = new window.EccelsoCalendar($('[data-cal]', form), {
    months: calMonths(), start: state.start, end: state.end, minNights: CFG.minNights || 1,
    onChange: (c) => { state.start = c.start; state.end = c.end; err(1, ''); sync(); },
  });
  addEventListener('resize', () => cal.setMonths(calMonths()));

  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step-btn]'); if (!b) return;
    const [k, d] = b.dataset.stepBtn.split(':');
    const next = state[k] + Number(d);
    if (next < (k === 'adults' ? 1 : 0) || (Number(d) > 0 && state.adults + state.children >= MAX)) return;
    state[k] = next; err(1, ''); sync();
  });

  // ---- step 2: rooms ----
  $$('input[name="room"]', form).forEach((r) => {
    if (r.value === state.room) r.checked = true;
    r.addEventListener('change', () => { state.room = r.value; err(2, ''); sync(); });
  });

  // ---- step 3: details (restore + save) ----
  const detailIds = ['b-first', 'b-last', 'b-email', 'b-phone', 'b-country', 'b-arrival', 'b-requests'];
  detailIds.forEach((id) => {
    const el = document.getElementById(id);
    if (state.details[id]) el.value = state.details[id];
    el.addEventListener('input', () => { state.details[id] = el.value; persist(); });
  });

  // ---- summary + step chrome ----
  function sync() {
    const n = state.start && state.end ? D.nights(state.start, state.end) : null;
    $('[data-sum-in]').textContent = state.start ? D.fmt(state.start) : T('select');
    $('[data-sum-in]').classList.toggle('is-empty', !state.start);
    $('[data-sum-out]').textContent = state.end ? D.fmt(state.end) : T('select');
    $('[data-sum-out]').classList.toggle('is-empty', !state.end);
    $('[data-sum-n]').textContent = n ?? '—';
    $('[data-val="adults"]', form).textContent = state.adults;
    $('[data-val="children"]', form).textContent = state.children;
    $('[data-step-btn="adults:-1"]').disabled = state.adults <= 1;
    $('[data-step-btn="children:-1"]').disabled = state.children <= 0;
    $('[data-step-btn="adults:1"]').disabled = $('[data-step-btn="children:1"]').disabled = state.adults + state.children >= MAX;

    // room capacity (when configured)
    const total = state.adults + state.children;
    $$('[data-room-opt]').forEach((l) => {
      const r = CFG.rooms.find((x) => x.slug === l.dataset.roomOpt);
      const tooSmall = r && r.maxGuests && total > r.maxGuests;
      l.classList.toggle('is-unavailable', !!tooSmall);
      if (tooSmall && state.room === r.slug) { state.room = ''; $('input', l).checked = false; }
    });

    const r = roomObj();
    $('[data-sum-room]').textContent = state.room ? roomName() : `${CFG.name}, ${CFG.city}`;
    const img = $('[data-sum-img]');
    const want = r ? r.img : CFG.fallbackImg;
    if (!img.src.endsWith(want)) img.src = want;
    $('[data-s-in]').textContent = state.start ? long(state.start) : '—';
    $('[data-s-out]').textContent = state.end ? long(state.end) : '—';
    $('[data-s-n]').textContent = n ?? '—';
    $('[data-s-g]').textContent = guestsLabel();
    persist();
  }

  const steps = $$('[data-steps] li');
  function show(n, focus = true) {
    state.step = n;
    $$('.step', form).forEach((s) => s.classList.toggle('is-active', Number(s.dataset.step) === n));
    steps.forEach((li, i) => { li.classList.toggle('is-current', i + 1 === n); li.classList.toggle('is-done', i + 1 < n); li.setAttribute('aria-current', i + 1 === n ? 'step' : 'false'); });
    $('[data-steps]').style.visibility = n === 5 ? 'hidden' : '';
    if (n === 4) review();
    if (focus) {
      const top = $('.booking').getBoundingClientRect().top + scrollY - 20;
      if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
      const h = $(`.step[data-step="${n}"] h2`, form); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
    }
  }

  function err(n, msg) { const e = $(`[data-err="${n}"]`, form); if (e) e.textContent = msg; }

  function check(n) {
    if (n === 1) {
      if (!state.start) return err(1, T('errIn')), false;
      if (!state.end) return err(1, T('errOut')), false;
      if (D.nights(state.start, state.end) < (CFG.minNights || 1)) return err(1, T('errMin', { n: CFG.minNights })), false;
      return true;
    }
    if (n === 2) { if (!state.room) return err(2, T('errRoom')), false; return true; }
    if (n === 3) return validateAll($('.step[data-step="3"]', form));
    return true;
  }

  function review() {
    const v = (id) => (document.getElementById(id).value || '').trim();
    const rows = [
      [T('rCheckIn'), long(state.start), 1], [T('rCheckOut'), long(state.end), 1],
      [T('rNights'), D.nights(state.start, state.end), 1], [T('rGuests'), guestsLabel(), 1],
      [T('rRoom'), roomName(), 2], [T('rName'), `${v('b-first')} ${v('b-last')}`, 3],
      [T('rEmail'), v('b-email'), 3], [T('rPhone'), v('b-phone'), 3],
    ];
    if (v('b-country')) rows.push([T('rCountry'), v('b-country'), 3]);
    if (v('b-arrival')) rows.push([T('rArrival'), v('b-arrival'), 3]);
    if (v('b-requests')) rows.push([T('rRequests'), v('b-requests'), 3, true]);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    $('[data-review]').innerHTML = rows.map(([k, val, step, wide]) => `<div${wide ? ' class="span-2"' : ''}><dt>${k}<button type="button" class="review__edit" data-goto="${step}">${T('edit')}</button></dt><dd>${esc(val)}</dd></div>`).join('');
  }

  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) { if (check(state.step)) show(state.step + 1); }
    else if (e.target.closest('[data-back]')) show(state.step - 1);
    else if (e.target.closest('[data-goto]')) show(Number(e.target.closest('[data-goto]').dataset.goto));
  });
  steps.forEach((li, i) => li.addEventListener('click', () => { if (i + 1 < state.step) show(i + 1); }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.step !== 4) { if (check(state.step)) show(state.step + 1); return; }
    for (const n of [1, 2]) if (!check(n)) return show(n);
    if (!validateAll($('.step[data-step="3"]', form))) return show(3);
    if (!validateAll($('.step[data-step="4"]', form))) return;
    const btn = $('[data-submit]', form); btn.disabled = true; btn.textContent = T('sending'); err(4, '');
    const v = (id) => (document.getElementById(id).value || '').trim();
    const ref = `ECC-${D.iso(state.start).slice(2).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const payload = {
      type: 'booking-request', reference: ref, sentAt: new Date().toISOString(),
      checkIn: D.iso(state.start), checkOut: D.iso(state.end), nights: D.nights(state.start, state.end),
      adults: state.adults, children: state.children, room: roomName(), roomSlug: state.room,
      firstName: v('b-first'), lastName: v('b-last'), email: v('b-email'), phone: v('b-phone'),
      country: v('b-country'), arrival: v('b-arrival'), requests: v('b-requests'), consent: true,
    };
    try {
      const r = await window.EccelsoSend(CFG.bookingEndpoint, payload);
      $('[data-c-name]').textContent = payload.firstName;
      $('[data-c-email]').textContent = payload.email;
      $('[data-c-ref]').textContent = ref;
      $('[data-demo]').hidden = !r.demo;
      try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
      show(5);
    } catch {
      err(4, T('errBooking'));
    } finally { btn.disabled = false; btn.textContent = T('sendReq'); }
  });

  $('[data-sum-toggle]').addEventListener('click', (e) => {
    const s = $('[data-summary]'); const on = s.classList.toggle('is-expanded');
    e.currentTarget.setAttribute('aria-expanded', on); e.currentTarget.textContent = on ? T('hideDetails') : T('details');
  });

  sync();
  // deep-link: dates already chosen on the home page → go straight to room choice
  if (state.start && state.end && q.get('in')) show(state.room ? 3 : 2, false);
  else if (state.room && q.get('room')) show(1, false);
  else show(1, false);
})();
