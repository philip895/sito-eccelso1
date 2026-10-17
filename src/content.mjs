// ─────────────────────────────────────────────────────────────────────────────
//  ECCELSO — site content & configuration
//  Edit this file, then run:  node tools/build.mjs
//
//  Values left as '' (empty) are NOT shown on the site: the row, line or
//  phrase that would contain them is hidden until a real value is filled in.
//
//  The site is bilingual: Italian (default, site root) and English (/en/).
//  Fields written as { it: '…', en: '…' } need both languages.
//  Italian translations of rooms, photo descriptions etc. are in `it` at the
//  bottom of this file — the build stops with an error if one is missing.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  // ⚠️ STAGING vs PRODUCTION — read before launch.
  // false = staging/preview: pages carry <meta name="robots" content="noindex"> and AI images are unlabelled.
  // true  = public site: every image marked `ai: true` below automatically gets a visible
  //         "Immagine generata con IA" / "AI-generated image" label. Before going live, replace AI images
  //         with real photos of the actual rooms wherever possible (EU AI Act Art. 50 transparency,
  //         booking-platform photo policies, consumer law on misleading descriptions).
  production: false,

  // Name as shown on the illuminated sign in the property's own photography.
  name: 'Eccelso',
  descriptor: 'Case Vacanza',
  fullName: 'Eccelso - Case Vacanza',    // as supplied by the owner
  city: 'Palermo',
  quarter: 'Il Capo',                    // OpenStreetMap: Via del Celso, Il Capo, 90134
  address: 'Via del Celso, 101/119',
  postcode: '90134 Palermo (PA), Italia',
  // Contacts from the client's change notes (Oct 2026). NB the Google Business listing still shows
  // the old mobile +39 346 384 2111 — update it there too if it should match.
  phone: '+39 091 6254283',
  phoneHref: '+390916254283',
  mobile: '+39 375 1489153',             // shown as "Cellulare / Mobile" with a tel: link
  mobileHref: '+393751489153',
  whatsapp: '',                          // only if the mobile is confirmed on WhatsApp — empty = hidden
  email: 'eccelso.info@gmail.com',
  emailHref: '',
  cin: '',                               // CIN — legally required for Italian case vacanza
  vat: '',                               // e.g. 'P.IVA 01234567890'
  instagram: '',                         // full URL, '' hides the link
  facebook: '',
  reception: '',                         // e.g. '8:00 – 22:00'
  replyTime: { it: '', en: '' },         // e.g. { it: 'entro 24 ore', en: 'within 24 hours' }
  story: { it: '', en: '' },             // owners' story, About page (plain text; blank line = new paragraph)
  wellnessNote: { it: '', en: '' },      // e.g. { it: 'Aperto tutti i giorni 10:00 – 20:00', en: 'Open daily 10:00 – 20:00' }
  stationTime: { it: '', en: '' },       // e.g. { it: '10 min in taxi', en: '10 min by taxi' } (Palermo Centrale)
  // From the property's Booking.com listing (as syndicated on casai.com) — verify
  checkInTime: '16:00',
  checkOutTime: '10:00',
  // Map: exact position of the property from its Google Business listing.
  map: { lat: 38.1161605, lng: 13.3575479, zoom: 17, exact: true },
  // Google Business / Maps listing for "Eccelso - Case Vacanza" (4.9★, 50 reviews).
  googleUrl: 'https://www.google.com/maps?cid=7825399527972135495',

  // Google rating supplied by the owner.
  rating: { score: '4.9', count: 50, source: 'Google' },

  // Form endpoints. Any service that accepts a JSON POST works
  // (Formspree, Basin, Make/Zapier webhook, your own PHP/Node handler…).
  // Leave '' to run in demo mode: the full flow works, nothing is sent.
  bookingEndpoint: '',
  contactEndpoint: '',

  minNights: 1,
  maxGuests: 6,
};

// Image registry. src = original (copied) file inside assets/images/.
// The build generates optimised responsive JPEGs in assets/images/<cat>/web/.
export const images = {
  // home
  livingWall:     { src: 'home/1 foto home.jpg',                       alt: 'The Eccelso living wall with its illuminated sign, a hanging rattan chair and a terracotta pouf' },
  facade:         { src: 'home/2 foto home verticale a sinistra.JPG',  alt: 'The white façade of the building, with wrought-iron balconies and arched doorways' },
  corridor:       { src: 'home/3 foto home rettangolare a destra.jpg', alt: 'Reception and corridor with brass pendant lights and botanical murals' },
  linen:          { src: 'home/4 foto home sinistra.png',              alt: 'Folded white towels on a freshly made bed' },
  prosecco:       { src: 'home/5 foto home destra.png',                alt: 'Prosecco and two glasses beside the hot tub, with soft white bathrobes' },
  roomSuperior:   { src: 'home/superior2.jpg',                         alt: 'Superior apartment with a sage-green sideboard and oak-effect floor' },
  roomDeluxe:     { src: 'home/deluxe.jpg',                            alt: 'Deluxe apartment: bedroom under a beamed wooden ceiling' },
  roomJunior:     { src: 'home/junior suite.jpg',                      alt: 'Junior Suite living area with sofa, beamed ceiling and kitchenette' },
  roomSenior:     { src: 'home/9 senior suite.jpg',                    alt: 'Senior Suite: linen sofa, an agave and a terracotta side table' },
  roomDeluxeSuite:{ src: 'home/10 deluxe suite.jpg',                   alt: 'Deluxe Suite living room opening onto the bedroom' },
  roomGrand:      { src: 'home/11 grand suite.jpg',                    alt: 'Grand Suite bedroom with brass pendant lights and an abstract painting' },
  tub:            { src: 'home/12 slide show finale.jpg',              alt: 'The sage-green hot tub raised on steps, beside a painted botanical wall' },
  lobby:          { src: 'home/13 slide show finale.jpg',              alt: 'Brass pendant lights over the lobby, arched panels and pampas murals' },
  terrace:        { src: 'home/14 slide show finale.jpg',              alt: 'The terrace with patterned blue tiles, yellow chairs and loungers' },
  cathedral:      { src: 'home/al posto di londra.jpg',               alt: 'Palermo Cathedral framed between stone balusters' },
  // about us
  aboutOpening:   { src: 'about-us/foto orizzontale apertura about us.jpg', alt: 'A ceramic vase of dried flowers in the bright reception' },
  breakfast:      { src: 'about-us/foto verticale destra.png',         alt: 'A breakfast table set with white porcelain and a tulip' },
  suiteLiving:    { src: 'about-us/foto verticale destra 2.png',       alt: 'Suite living room with a cream sofa under a brass ring light' },
  niche:          { src: 'about-us/foto verticale destra 3.png',       alt: 'Softly lit wall niches with small plants' },
  kitchenette:    { src: 'about-us/foto verticale destra 4.png',       alt: 'Kitchenette under exposed wooden beams' },
  mondello:       { src: 'about-us/foto verticale sinistra.jpg',       alt: 'Mondello bay at dusk, below Monte Pellegrino' },
  // rooms
  // Superior lead image: a 3:2 crop of home/superior2.png (x 45%→100%, y 45%→100%) that leaves out
  // the TV. Replace with a new photo of the room (bed / whole room) when one is available.
  roomSuperiorDetail: { src: 'rooms/superior-detail.jpg', alt: 'Superior apartment detail: sage-green sideboard, oak-effect floor and floor-length curtains' },
  roomsOpening:   { src: 'rooms/foto orizzontale apertura.jpg',        alt: 'A bedroom with brass lamps, crimson and green cushions and an abstract canvas' },
  // gallery
  g1: { src: 'gallery/gallery 1.png',               alt: 'Botanical-print bed linen and a brass lamp' },
  g2: { src: 'gallery/gallery 2.jpg',               alt: 'A round mirror and luggage rack beneath the beams' },
  g3: { src: 'gallery/gallery 3.png',               alt: 'A brass ring light against a white ceiling' },
  g4: { src: 'gallery/gallery 4.jpg',               alt: 'Kitchenette with burgundy chairs' },
  g5: { src: 'gallery/gallery 5.png',               alt: 'A round dining table with dried flowers' },
  g6: { src: 'gallery/gallery 6.png',               alt: 'Arched illuminated mirror over a sculpted basin' },
  g7: { src: 'gallery/gallery 7.png',               alt: 'A slate-blue conical pendant lamp' },
  g8: { src: 'gallery/gallery 8.jpg',               alt: 'Bedroom with blue headboard, crimson cushions and an abstract canvas' },
  galleryOpening: { src: 'gallery/orizzontale apertura pag.jpg', alt: 'Bedroom with blue linen under a brass ring light' },
  // location (the venue's own spaces — wellness)
  locOpening:     { src: 'location/orizzontale apertura pagina.jpg', alt: 'The sage-green hot tub raised on steps, beside a painted botanical wall' },
  sauna:          { src: 'location/orizzontale ultima.JPG',          alt: 'The wooden sauna with its bucket and ladle' },
  hammam:         { src: 'location/verticale destra.JPG',            alt: 'The steam room, lit in deep blue' },
  robes:          { src: 'location/verticale sinistra1.JPG',         alt: 'Bathrobes, slippers and two glasses of prosecco' },
  // ── AI-GENERATED IMAGES (ChatGPT, C2PA "trainedAlgorithmicMedia") ─────────────────────────────
  // TODO(before launch): replace each with a REAL photo of that room, or keep it only with the visible
  // AI label (automatic when site.production = true). Source files: ~/Downloads/eccelso foto/.
  // Matched to room types by visual cues — CLIENT TO CONFIRM.
  aiTerraceArmchairs: { ai: true, src: 'ai/terrace-armchairs.png', alt: 'The terrace with blue-and-white patterned tiles, yellow armchairs and sun loungers' },   // TODO AI: from "Immagine ChatGPT 16 ott 2026, 17_12_47-2.png"
  aiTerraceLoungers:  { ai: true, src: 'ai/terrace-loungers.png',  alt: 'Two sun loungers on the terrace, framed by potted greenery' },                            // TODO AI: from "Immagine ChatGPT 16 ott 2026, 17_12_48-3.png"
  aiTerraceView:      { ai: true, src: 'ai/terrace-view.png',      alt: 'The terrace among the surrounding buildings of the old town' },                          // TODO AI: from "Immagine ChatGPT 14 ott 2026, 21_11_02-9.png"
  aiSeniorLounge:     { ai: true, src: 'ai/senior-suite-lounge.png', alt: 'Senior Suite: lounge corner with linen sofa, terracotta side table and dining area' },  // TODO AI: from "Immagine ChatGPT 16 ott 2026, 17_42_00-3.png"
  aiSuperiorOpen:     { ai: true, src: 'ai/superior-open-space.png', alt: 'Superior studio: open-plan space with sage-green sideboard, dining table and beamed ceiling' }, // TODO AI: from "Immagine ChatGPT 16 ott 2026, 17_36_36-2.png"
  // contact
  host:           { src: 'contact/orizzontale apertura pagina.jpg',  alt: 'Your host at the reception desk' },
};

// Apartment types. `name` = type (Superior…); `cardName` = homepage card; `pageTitle` = heading on
// rooms.html; `bookingName` = label in the booking flow. Defaults to `name` when omitted.
// Copy for the three apartment categories is the client's (change notes, Oct 2026); their amenities
// are listed once in `amenities` below ("Ogni appartamento è dotato di").
// size / guests / bed stay empty (hidden) until confirmed by the owner.
export const rooms = [
  {
    // TODO AI: image is AI-generated (aiSuperiorOpen) — swap for a real photo before launch.
    slug: 'superior', name: 'Superior', image: 'aiSuperiorOpen', kind: 'apartment',
    cardName: 'Superior Studios', pageTitle: 'Studios in Palermo', bookingName: 'Superior Studio',
    line: 'Elegant, functional open-plan spaces.',
    text: 'Elegant, functional open-plan spaces, ideal for couples, solo travellers and small families. Carefully finished interiors designed to offer you comfort and privacy.',
    size: '', guests: '', bed: '', maxGuests: null,
    // features: from the real Superior photo (superior2) + the client's "open space" description
    features: ['Open-plan layout', 'Oak-effect floor', 'Smart TV', 'Floor-length curtains'],
  },
  {
    slug: 'deluxe', name: 'Deluxe', image: 'roomDeluxe', kind: 'apartment',
    cardName: 'Deluxe One-Bedrooms', pageTitle: 'One-Bedroom Apartments in Palermo’s Historic Centre', bookingName: 'Deluxe One-Bedroom',
    line: 'Spacious layouts with a double bedroom and a full living area.',
    text: 'Spacious layouts with a double bedroom and a full living area. Perfect for couples or friends who want to experience Palermo in total relaxation.',
    size: '', guests: '', bed: '', maxGuests: null,
    // features: client's layout description + the real Deluxe photo (beams, luggage rack)
    features: ['Separate double bedroom', 'Full living area', 'Exposed wooden-beam ceiling', 'Luggage rack'],
  },
  {
    slug: 'junior-suite', name: 'Junior Suite', image: 'roomJunior', kind: 'apartment',
    cardName: 'Junior Suite Family Apartments', pageTitle: 'Apartments for Families and Groups', bookingName: 'Junior Suite Family Apartment',
    line: 'Generous layouts ideal for families and groups of friends.',
    text: 'Generous layouts ideal for families and groups of friends, with one or two double bedrooms and a fully equipped living area.',
    size: '', guests: '', bed: '', maxGuests: null,
    // features: client's layout description + the real Junior Suite photo (sofa, kitchenette, beams)
    features: ['One or two double bedrooms', 'Living area with sofa', 'Kitchenette', 'Exposed wooden-beam ceiling'],
  },
  {
    // TODO AI: image is AI-generated (aiSeniorLounge) — swap for a real photo before launch.
    slug: 'senior-suite', kind: 'suite', name: 'Senior Suite', image: 'aiSeniorLounge',
    line: 'Linen, terracotta and green.',
    text: 'Soft linen upholstery, a terracotta table, an agave in a white pot. A suite of quiet, well-chosen details where the afternoons pass slowly.',
    size: '', guests: '', bed: '', maxGuests: null,
    features: ['Separate lounge corner', 'Linen sofa', 'Oak-effect floor'],
  },
  {
    slug: 'deluxe-suite', kind: 'suite', name: 'Deluxe Suite', image: 'roomDeluxeSuite',
    line: 'Two rooms, one long view.',
    text: 'A living room that opens onto the bedroom, so the light carries through from one end to the other. Colour comes from the art on the walls.',
    size: '', guests: '', bed: '', maxGuests: null,
    features: ['Separate living room', 'Original artwork', 'Smart TV'],
  },
  {
    slug: 'grand-suite', kind: 'suite', name: 'Grand Suite', image: 'roomGrand',
    line: 'The house at its most generous.',
    text: 'Brass pendants hang over a wide, low bed. Rich colour on the walls and soft neutrals everywhere else make this a suite to come back to.',
    size: '', guests: '', bed: '', maxGuests: null,
    features: ['Brass pendant lighting', 'Original artwork', 'Upholstered headboard'],
  },
];

// "In every apartment" list (client, Oct 2026) — identical for all apartment categories.
export const amenities = {
  it: ['Pompe di calore inverter', 'Wi-Fi', 'Smart TV', 'Divano letto matrimoniale o poltrona letto singola',
    'Stoviglie (piatti, bicchieri, posate, pentole, scolapasta, taglieri, tovagliette ecc.)', 'Bollitore',
    'Macchina per il caffè (con capsule)', 'Corredo letto (lenzuola, federe, piumino e copripiumino)',
    'Corredo bagno (telo da bagno, tappetino)', 'Kit di cortesia (bagnodoccia e shampoo)', 'Phon',
    'Culla e seggiolone per bambini (su richiesta)'],
  en: ['Inverter heat pump (heating and air conditioning)', 'Wi-Fi', 'Smart TV', 'Double sofa bed or single armchair bed',
    'Tableware (plates, glasses, cutlery, pots, colander, chopping boards, placemats and more)', 'Kettle',
    'Coffee machine (with capsules)', 'Bed linen (sheets, pillowcases, duvet and duvet cover)',
    'Bath linen (bath towel, bath mat)', 'Courtesy kit (shower gel and shampoo)', 'Hairdryer',
    'Cot and high chair for children (on request)'],
};

// ⚠️ PENDING CLIENT CONFIRMATION — keep `enabled: false` until the client confirms how many suites
// have a private panoramic terrace (their notes say "two", the site has three suite types).
export const suitesIntro = {
  enabled: false,
  it: { title: 'Luxury Suite con terrazza panoramica', text: 'Eccelso dispone anche di due Suite esclusive con terrazza privata e vista sul centro storico di Palermo. Spazi unici dove vivere momenti romantici e suggestivi, ammirando la città dall’alto.' },
  en: { title: 'Luxury Suites with Panoramic Terrace', text: 'Eccelso also has two exclusive Suites with a private terrace and a view over Palermo’s historic centre. Unique spaces for romantic, memorable moments, taking in the city from above.' },
};

// Gallery — the full unique photo set, tagged by subject.
export const gallery = [
  ['livingWall', 'spaces'], ['facade', 'palermo'], ['roomDeluxe', 'rooms'], ['g6', 'details'],
  ['tub', 'wellness'], ['g1', 'rooms'], ['corridor', 'spaces'], ['roomJunior', 'rooms'],
  ['g3', 'details'], ['cathedral', 'palermo'], ['g8', 'rooms'], ['prosecco', 'wellness'],
  ['suiteLiving', 'rooms'], ['lobby', 'spaces'], ['g2', 'rooms'], ['breakfast', 'details'],
  ['hammam', 'wellness'], ['roomGrand', 'rooms'], ['g5', 'details'], ['terrace', 'spaces'],
  ['mondello', 'palermo'], ['roomSuperior', 'rooms'], ['g7', 'details'], ['sauna', 'wellness'],
  ['g4', 'rooms'], ['niche', 'details'], ['roomDeluxeSuite', 'rooms'], ['linen', 'details'],
  ['aboutOpening', 'spaces'], ['robes', 'wellness'], ['kitchenette', 'rooms'], ['aiSeniorLounge', 'rooms'],
  ['galleryOpening', 'rooms'], ['roomsOpening', 'rooms'], ['host', 'spaces'],
  // TODO AI: the five entries below are AI-generated
  ['aiTerraceArmchairs', 'spaces'], ['aiSuperiorOpen', 'rooms'], ['aiTerraceLoungers', 'spaces'], ['aiTerraceView', 'spaces'],
];

// Guest reviews — VERBATIM excerpts, first names only. Never edit the wording.
// Sources (retrieved 9 Oct 2026):
//  - casai.com/property/eccelso-case-vacanza/BC-14686361 (syndicates Booking.com guest reviews)
//  - tripadvisor.com … d33931724 (Filippo D., July 2026, translated from Italian by Tripadvisor)
// Replace or add Google reviews here once exported from Google Business Profile.
export const reviews = [
  { name: 'Connie', meta: 'Solo traveller · May 2026', text: 'The whole building was totally renovated to a very high standard. It felt new and is very clean and spotless.', featured: true },
  { name: 'Ian', meta: 'Couple · May 2026', text: 'New build, excellent condition and location is perfect for exploring the old city by foot' },
  { name: 'Ilanit', meta: 'Family · September 2026', text: 'Exceptional stay from start to finish! Everything was perfect and met all our expectations.' },
  { name: 'Filippo', meta: 'July 2026 · translated from Italian', text: 'The staff is friendly and full of useful information.' },
];

// Facts from public listings — verify before launch.
export const nearby = [
  // [name, note, distance]. First three: from the property's Booking.com listing.
  // Last three: OpenStreetMap foot routing (routing.openstreetmap.de) from the Cathedral end
  // of Via del Celso, at 4.8 km/h — consistent with the listing's Cathedral / Teatro Massimo times.
  ['Palermo Cathedral', 'The Arab-Norman cathedral, around the corner.', 'about 3 min on foot'],
  ['Fontana Pretoria', 'The great Renaissance fountain of the Piazza Pretoria.', 'about 500 m'],
  ['Teatro Massimo', 'Italy\'s largest opera house.', 'about 7 min on foot'],
  ['Mercato del Capo', 'The historic street market that gives the quarter its name.', 'about 5 min on foot'],
  ['Quattro Canti', 'The baroque crossroads at the heart of the old city.', 'about 6 min on foot'],
  ['Palazzo dei Normanni', 'The Norman palace and its golden Cappella Palatina.', 'about 10 min on foot'],
];

// ─────────────────────────────────────────────────────────────────────────────
//  ITALIANO — traduzioni (the build checks every key is present)
// ─────────────────────────────────────────────────────────────────────────────
export const it = {
  alts: {
    livingWall: 'La parete verde di Eccelso con l’insegna luminosa, una poltrona sospesa in rattan e un pouf color terracotta',
    facade: 'La facciata bianca dell’edificio, con balconi in ferro battuto e portali ad arco',
    corridor: 'Reception e corridoio con lampade a sospensione in ottone e murales botanici',
    linen: 'Asciugamani bianchi piegati su un letto appena rifatto',
    prosecco: 'Prosecco e due calici accanto alla vasca idromassaggio, con morbidi accappatoi bianchi',
    roomSuperior: 'Appartamento Superior con madia verde salvia e pavimento effetto rovere',
    roomDeluxe: 'Appartamento Deluxe: camera da letto sotto un soffitto con travi in legno',
    roomJunior: 'Zona giorno della Junior Suite con divano, travi a vista e angolo cottura',
    roomSenior: 'Senior Suite: divano in lino, un’agave e un tavolino color terracotta',
    roomDeluxeSuite: 'Il soggiorno della Deluxe Suite che si apre sulla camera da letto',
    roomGrand: 'Camera da letto della Grand Suite con lampade a sospensione in ottone e un quadro astratto',
    tub: 'La vasca idromassaggio verde salvia, rialzata su gradini, accanto a una parete dipinta a motivi botanici',
    lobby: 'Lampade in ottone nella hall, pannelli ad arco e murales di pampas',
    terrace: 'La terrazza con piastrelle blu decorate, sedie gialle e lettini',
    cathedral: 'La Cattedrale di Palermo incorniciata tra le balaustre in pietra',
    aboutOpening: 'Un vaso in ceramica con fiori secchi nella luminosa reception',
    breakfast: 'Una tavola per la colazione apparecchiata con porcellana bianca e un tulipano',
    suiteLiving: 'Soggiorno di una suite con divano color crema sotto una lampada ad anello in ottone',
    niche: 'Nicchie illuminate con piccole piante',
    kitchenette: 'Angolo cottura sotto le travi in legno a vista',
    mondello: 'La baia di Mondello al tramonto, ai piedi di Monte Pellegrino',
    roomSuperiorDetail: 'Dettaglio dell’appartamento Superior: madia verde salvia, pavimento effetto rovere e tende a tutta altezza',
    roomsOpening: 'Una camera da letto con lampade in ottone, cuscini cremisi e verdi e una tela astratta',
    g1: 'Biancheria da letto a motivi botanici e una lampada in ottone',
    g2: 'Uno specchio tondo e un portabagagli sotto le travi',
    g3: 'Una lampada ad anello in ottone sul soffitto bianco',
    g4: 'Angolo cottura con sedie bordeaux',
    g5: 'Un tavolo rotondo con fiori secchi',
    g6: 'Specchio ad arco illuminato sopra un lavabo scultoreo',
    g7: 'Una lampada a sospensione conica blu ardesia',
    g8: 'Camera da letto con testiera blu, cuscini cremisi e una tela astratta',
    galleryOpening: 'Camera da letto con biancheria blu sotto una lampada ad anello in ottone',
    locOpening: 'La vasca idromassaggio verde salvia, rialzata su gradini, accanto a una parete dipinta a motivi botanici',
    sauna: 'La sauna in legno con secchio e mestolo',
    hammam: 'Il bagno turco, illuminato di blu intenso',
    robes: 'Accappatoi, pantofole e due calici di prosecco',
    host: 'L’host alla reception',
    // AI-generated (see TODO in `images`)
    aiTerraceArmchairs: 'La terrazza con piastrelle a motivi bianchi e blu, poltroncine gialle e lettini',
    aiTerraceLoungers: 'Due lettini sulla terrazza, tra piante in vaso',
    aiTerraceView: 'La terrazza tra i palazzi del centro storico',
    aiSeniorLounge: 'Senior Suite: angolo salotto con divano in lino, tavolino color terracotta e zona pranzo',
    aiSuperiorOpen: 'Monolocale Superior: open space con madia verde salvia, tavolo da pranzo e travi a vista',
  },
  rooms: {
    'superior': { cardName: 'Monolocali Superior', pageTitle: 'Monolocali a Palermo', bookingName: 'Monolocale Superior', line: 'Open space eleganti e funzionali.', text: 'Open space eleganti e funzionali, ideali per coppie, viaggiatori singoli e piccoli nuclei familiari. Ambienti curati nei minimi dettagli, pensati per offrirti comfort e privacy.', features: ['Open space', 'Pavimento effetto rovere', 'Smart TV', 'Tende a tutta altezza'] },
    'deluxe': { cardName: 'Bilocali Deluxe', pageTitle: 'Bilocali nel Centro Storico di Palermo', bookingName: 'Bilocale Deluxe', line: 'Soluzioni spaziose con camera matrimoniale e zona living completa.', text: 'Soluzioni spaziose con camera matrimoniale e zona living completa. Perfette per coppie o amici che desiderano vivere Palermo in totale relax.', features: ['Camera matrimoniale separata', 'Zona living completa', 'Soffitto con travi in legno a vista', 'Portabagagli'] },
    'junior-suite': { cardName: 'Trilocali Junior Suite', pageTitle: 'Trilocali per Famiglie e Gruppi', bookingName: 'Trilocale Junior Suite', line: 'Ampie soluzioni ideali per famiglie e gruppi di amici.', text: 'Ampie soluzioni ideali per famiglie e gruppi di amici, con una o due camere matrimoniali e zona giorno completamente attrezzata.', features: ['Una o due camere matrimoniali', 'Zona giorno con divano', 'Angolo cottura', 'Soffitto con travi in legno a vista'] },
    'senior-suite': { line: 'Lino, terracotta e verde.', text: 'Imbottiture in lino, un tavolino color terracotta, un’agave in un vaso bianco. Una suite di dettagli scelti con cura, dove i pomeriggi scorrono lenti.', features: ['Angolo salotto separato', 'Divano in lino', 'Pavimento effetto rovere'] },
    'deluxe-suite': { line: 'Due ambienti, un’unica prospettiva.', text: 'Un soggiorno che si apre sulla camera da letto, così la luce attraversa la suite da un capo all’altro. Il colore arriva dalle opere alle pareti.', features: ['Soggiorno separato', 'Opere d’arte originali', 'Smart TV'] },
    'grand-suite': { line: 'La casa nella sua versione più generosa.', text: 'Lampade in ottone sospese sopra un letto ampio e basso. Colori intensi alle pareti e toni neutri tutto intorno: una suite in cui tornare.', features: ['Lampade a sospensione in ottone', 'Opere d’arte originali', 'Testiera imbottita'] },
  },
  nearby: [
    ['Cattedrale di Palermo', 'La cattedrale arabo-normanna, dietro l’angolo.', 'circa 3 min a piedi'],
    ['Fontana Pretoria', 'La grande fontana rinascimentale di Piazza Pretoria.', 'circa 500 m'],
    ['Teatro Massimo', 'Il più grande teatro lirico d’Italia.', 'circa 7 min a piedi'],
    ['Mercato del Capo', 'Lo storico mercato di strada che dà il nome al quartiere.', 'circa 5 min a piedi'],
    ['Quattro Canti', 'Il crocevia barocco nel cuore della città antica.', 'circa 6 min a piedi'],
    ['Palazzo dei Normanni', 'Il palazzo normanno e la sua Cappella Palatina dorata.', 'circa 10 min a piedi'],
  ],
  // Review texts stay verbatim (original wording); only the caption is translated.
  reviewMeta: {
    Connie: 'Viaggio in solitaria · maggio 2026',
    Ian: 'Coppia · maggio 2026',
    Ilanit: 'Famiglia · settembre 2026',
    Filippo: 'Luglio 2026 · traduzione di Tripadvisor',
  },
};
