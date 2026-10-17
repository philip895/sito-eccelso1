# Eccelso — Case Vacanza · website

Static site: no framework, no runtime dependencies. Open `index.html` directly or serve the folder with any static host (Netlify, Vercel, an Aruba/SiteGround FTP, etc.).

## Structure
```
index.html  rooms.html  about.html  gallery.html  location.html  contact.html  booking.html  privacy.html
assets/css/styles.css      design system (tokens, type scale, spacing) and all components
assets/js/main.js          interactions: header, menu, reveals, sliders, gallery lightbox, calendar, forms
assets/js/booking.js       4-step reservation request flow
assets/images/<category>/  original photography (copied unchanged)
assets/images/<category>/web/   optimised responsive JPEGs (generated)
src/content.mjs            ALL text, contact details, rooms, reviews, nearby places
tools/images.mjs           regenerates optimised images (macOS, uses built-in `sips`)
tools/build.mjs            regenerates the HTML pages from src/content.mjs
```

## Languages
- **Italian is the default** and lives at the site root (`index.html`, `rooms.html`, …).
- **English** lives in `/en/` (`en/index.html`, …).
- The IT / EN switch (header, next to the menu icon on mobile, and inside the menu) opens the same page in the other language and keeps any chosen dates or room.
- All page text is in `tools/build.mjs` as `t('English', 'Italiano')` pairs. Room descriptions, photo descriptions, nearby places and review captions in Italian are in the `it` block at the bottom of `src/content.mjs`.
- The build **stops with an error** if an Italian translation is missing, so a half-translated page can't be published.
- Guest reviews are always shown verbatim in the language they were published in (English).

## Editing content
1. Edit `src/content.mjs`.
2. Run `node tools/build.mjs` (Node 18+).
3. If you add or replace photos, run `node tools/images.mjs` first.

Any value left empty (`''`) is simply not shown: its row or line is hidden until you fill it in. Fields that depend on language are written as `{ it: '…', en: '…' }`.

## Booking and contact forms
Both forms POST JSON to `bookingEndpoint` / `contactEndpoint` in `src/content.mjs`. Formspree, a Make or Zapier webhook, or your own script all work. While these are empty the forms run in **demo mode**: the full flow works but nothing is sent, and the confirmation screen says so.

## Before going live
- **AI-generated images (staging only):** 5 images in `assets/images/ai/` are AI-generated (ChatGPT) and marked `ai: true` + `TODO AI` in `src/content.mjs`. Before the public launch, replace each with a real photo of that room, or keep it only with the visible label. Setting `site.production = true` adds the "Immagine generata con IA" / "AI-generated image" label automatically and removes the staging `noindex`. Every build prints the list of AI images still in use.
- Fill the remaining empty fields: CIN, P.IVA, socials, apartment sizes and beds per type, reply time, reception hours, wellness hours and prices; WhatsApp only if the mobile number is on WhatsApp.
- Confirm the suites (see `suitesIntro` in `src/content.mjs`, currently switched off) and that photo `g8` really shows a Superior studio.
- Update the Google Business listing if its phone number should match the site (it still shows the old mobile).
- Privacy and cookie policy text (GDPR). Self-host the Google Fonts or add a consent banner.
- Configure the form endpoints.
- Supply higher-resolution versions of the 1024px photos (living wall, the Senior, Deluxe and Grand Suite images, lobby, terrace, page openers).

## Sources for facts and reviews (retrieved 9 Oct 2026)
- Owner-supplied: name, address, phone, Google rating 4.9 (50 reviews).
- Booking.com listing via casai.com (BC-14686361): check-in from 16:00 / out by 10:00, units 32–60 m², amenities, wellness (hot tub, sauna, steam room, massages), distances to the Cathedral, Fontana Pretoria, Teatro Massimo and the airport, house rules. Guest reviews from Connie, Ian and Ilanit.
- Tripadvisor (d33931724): review from Filippo D. (translated from Italian).
- OpenStreetMap / Nominatim: Via del Celso, Il Capo, 90134.
- Booking.com guest reviews: no parking on site (ZTL).
