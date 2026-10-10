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
  // Name as shown on the illuminated sign in the property's own photography.
  name: 'Eccelso',
  descriptor: 'Case Vacanza',
  fullName: 'Eccelso - Case Vacanza',    // as supplied by the owner
  city: 'Palermo',
  quarter: 'Il Capo',                    // OpenStreetMap: Via del Celso, Il Capo, 90134
  address: 'Via del Celso, 101/119',
  postcode: '90134 Palermo (PA), Italia',
  phone: '+39 346 384 2111',
  phoneHref: '+393463842111',
  whatsapp: '',                          // e.g. '+39 346 384 2111' — empty = hidden
  email: '',                             // e.g. 'info@eccelso.it' — empty = hidden
  emailHref: '',                         // e.g. 'info@domain.it'
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
  // Map: OpenStreetMap geocode of Via del Celso (street level, not house number).
  // Nudge to the exact door and set exact: true.
  map: { lat: 38.11620, lng: 13.35854, zoom: 17, exact: false },

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
  roomSuperior:   { src: 'home/superior2.png',                         alt: 'Superior room with a sage-green sideboard and oak-tone floor' },
  roomDeluxe:     { src: 'home/deluxe.png',                            alt: 'Deluxe room under a beamed wooden ceiling' },
  roomJunior:     { src: 'home/junior suite.png',                      alt: 'Junior Suite living area with sofa, beamed ceiling and kitchenette' },
  roomSenior:     { src: 'home/9 senior suite.jpg',                    alt: 'Senior Suite: linen sofa, an agave and a terracotta side table' },
  roomDeluxeSuite:{ src: 'home/10 deluxe suite.jpg',                   alt: 'Deluxe Suite living room opening onto the bedroom' },
  roomGrand:      { src: 'home/11 grand suite.jpg',                    alt: 'Grand Suite bedroom with brass pendant lights and an abstract painting' },
  tub:            { src: 'home/12 slide show finale.png',              alt: 'The sage-green hot tub raised on steps, beside a painted botanical wall' },
  lobby:          { src: 'home/13 slide show finale.jpg',              alt: 'Brass pendant lights over the lobby, arched panels and pampas murals' },
  terrace:        { src: 'home/14 slide show finale.jpg',              alt: 'The terrace with patterned blue tiles, yellow chairs and loungers' },
  cathedral:      { src: 'home/al posto di londra.jpeg',               alt: 'Palermo Cathedral framed between stone balusters' },
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
  roomSuperiorDetail: { src: 'rooms/superior-detail.jpg', alt: 'Superior room detail: sage-green sideboard, oak-effect floor and floor-length curtains' },
  roomsOpening:   { src: 'rooms/foto orizzontale apertura.jpg',        alt: 'A bedroom with brass lamps, crimson and green cushions and an abstract canvas' },
  // gallery
  g1: { src: 'gallery/gallery 1.png',               alt: 'Botanical-print bed linen and a brass lamp' },
  g2: { src: 'gallery/gallery 2.png',               alt: 'A round mirror and luggage rack beneath the beams' },
  g3: { src: 'gallery/gallery 3.png',               alt: 'A brass ring light against a white ceiling' },
  g4: { src: 'gallery/gallery 4.png',               alt: 'Kitchenette with burgundy chairs' },
  g5: { src: 'gallery/gallery 5.png',               alt: 'A round dining table with dried flowers' },
  g6: { src: 'gallery/gallery 6.png',               alt: 'Arched illuminated mirror over a sculpted basin' },
  g7: { src: 'gallery/gallery 7.png',               alt: 'A slate-blue conical pendant lamp' },
  g8: { src: 'gallery/gallery 8.png',               alt: 'Bedroom with blue headboard, crimson cushions and an abstract canvas' },
  galleryOpening: { src: 'gallery/orizzontale apertura pag.jpg', alt: 'Bedroom with blue linen under a brass ring light' },
  // location (the venue's own spaces — wellness)
  locOpening:     { src: 'location/orizzontale apertura pagina.png', alt: 'The sage-green hot tub raised on steps, beside a painted botanical wall' },
  sauna:          { src: 'location/orizzontale ultima.JPG',          alt: 'The wooden sauna with its bucket and ladle' },
  hammam:         { src: 'location/verticale destra.JPG',            alt: 'The steam room, lit in deep blue' },
  robes:          { src: 'location/verticale sinistra1.JPG',         alt: 'Bathrobes, slippers and two glasses of prosecco' },
  // contact
  host:           { src: 'contact/orizzontale apertura pagina.jpg',  alt: 'Your host at the reception desk' },
};

// Room types — names taken from the photography file names supplied.
// size / guests / bed are PLACEHOLDERS until confirmed by the owner.
// "features" lists only what is visible in each room's photograph.
export const rooms = [
  {
    slug: 'superior', name: 'Superior', image: 'roomSuperiorDetail',
    line: 'Simple, bright and very calm.',
    text: 'Sage-green woods, oak-tone floors and long curtains that soften the Sicilian light. A room that keeps things simple and gets the essentials right.',
    size: '', guests: '', bed: '', maxGuests: null,
    features: ['Oak-tone wooden floor', 'Smart TV', 'Floor-length curtains'],
  },
  {
    slug: 'deluxe', name: 'Deluxe', image: 'roomDeluxe',
    line: 'Under the old wooden beams.',
    text: 'Warm timber beams overhead, crisp linen below. Deep green, crimson and a touch of gold, with a round mirror catching the afternoon light.',
    size: '', guests: '', bed: '', maxGuests: null,
    features: ['Exposed wooden-beam ceiling', 'Round mirror', 'Luggage rack'],
  },
  {
    slug: 'junior-suite', name: 'Junior Suite', image: 'roomJunior',
    line: 'Room to live, not only to sleep.',
    text: 'A generous living space under the beams, with a deep sofa and a kitchenette of your own. Made for longer stays and slow mornings.',
    size: '', guests: '', bed: '', maxGuests: null,
    features: ['Living area with sofa', 'Kitchenette', 'Exposed wooden-beam ceiling'],
  },
  {
    slug: 'senior-suite', name: 'Senior Suite', image: 'roomSenior',
    line: 'Linen, terracotta and green.',
    text: 'Soft linen upholstery, a terracotta table, an agave in a white pot. A suite of quiet, well-chosen details where the afternoons pass slowly.',
    size: '', guests: '', bed: '', maxGuests: null,
    features: ['Separate lounge corner', 'Linen sofa', 'Oak-tone wooden floor'],
  },
  {
    slug: 'deluxe-suite', name: 'Deluxe Suite', image: 'roomDeluxeSuite',
    line: 'Two rooms, one long view.',
    text: 'A living room that opens onto the bedroom, so the light carries through from one end to the other. Colour comes from the art on the walls.',
    size: '', guests: '', bed: '', maxGuests: null,
    features: ['Separate living room', 'Original artwork', 'Smart TV'],
  },
  {
    slug: 'grand-suite', name: 'Grand Suite', image: 'roomGrand',
    line: 'The house at its most generous.',
    text: 'Brass pendants hang over a wide, low bed. Rich colour on the walls and soft neutrals everywhere else make this a room to come back to.',
    size: '', guests: '', bed: '', maxGuests: null,
    features: ['Brass pendant lighting', 'Original artwork', 'Upholstered headboard'],
  },
];

// Gallery — the full unique photo set, tagged by subject.
export const gallery = [
  ['livingWall', 'spaces'], ['facade', 'palermo'], ['roomDeluxe', 'rooms'], ['g6', 'details'],
  ['tub', 'wellness'], ['g1', 'rooms'], ['corridor', 'spaces'], ['roomJunior', 'rooms'],
  ['g3', 'details'], ['cathedral', 'palermo'], ['g8', 'rooms'], ['prosecco', 'wellness'],
  ['suiteLiving', 'rooms'], ['lobby', 'spaces'], ['g2', 'rooms'], ['breakfast', 'details'],
  ['hammam', 'wellness'], ['roomGrand', 'rooms'], ['g5', 'details'], ['terrace', 'spaces'],
  ['mondello', 'palermo'], ['roomSuperior', 'rooms'], ['g7', 'details'], ['sauna', 'wellness'],
  ['g4', 'rooms'], ['niche', 'details'], ['roomDeluxeSuite', 'rooms'], ['linen', 'details'],
  ['aboutOpening', 'spaces'], ['robes', 'wellness'], ['kitchenette', 'rooms'], ['roomSenior', 'rooms'],
  ['galleryOpening', 'rooms'], ['roomsOpening', 'rooms'], ['host', 'spaces'],
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
    roomSuperior: 'Camera Superior con madia verde salvia e pavimento effetto rovere',
    roomDeluxe: 'Camera Deluxe sotto un soffitto con travi in legno',
    roomJunior: 'Zona giorno della Junior Suite con divano, travi a vista e angolo cottura',
    roomSenior: 'Senior Suite: divano in lino, un’agave e un tavolino color terracotta',
    roomDeluxeSuite: 'Il soggiorno della Deluxe Suite che si apre sulla camera da letto',
    roomGrand: 'Camera della Grand Suite con lampade a sospensione in ottone e un quadro astratto',
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
    roomSuperiorDetail: 'Dettaglio della camera Superior: madia verde salvia, pavimento effetto rovere e tende a tutta altezza',
    roomsOpening: 'Una camera con lampade in ottone, cuscini cremisi e verdi e una tela astratta',
    g1: 'Biancheria da letto a motivi botanici e una lampada in ottone',
    g2: 'Uno specchio tondo e un portabagagli sotto le travi',
    g3: 'Una lampada ad anello in ottone sul soffitto bianco',
    g4: 'Angolo cottura con sedie bordeaux',
    g5: 'Un tavolo rotondo con fiori secchi',
    g6: 'Specchio ad arco illuminato sopra un lavabo scultoreo',
    g7: 'Una lampada a sospensione conica blu ardesia',
    g8: 'Camera con testiera blu, cuscini cremisi e una tela astratta',
    galleryOpening: 'Camera con biancheria blu sotto una lampada ad anello in ottone',
    locOpening: 'La vasca idromassaggio verde salvia, rialzata su gradini, accanto a una parete dipinta a motivi botanici',
    sauna: 'La sauna in legno con secchio e mestolo',
    hammam: 'Il bagno turco, illuminato di blu intenso',
    robes: 'Accappatoi, pantofole e due calici di prosecco',
    host: 'L’host alla reception',
  },
  rooms: {
    'superior': { line: 'Semplice, luminosa, serena.', text: 'Legni verde salvia, pavimenti effetto rovere e lunghe tende che addolciscono la luce siciliana. Una camera essenziale, che cura ciò che conta davvero.', features: ['Pavimento effetto rovere', 'Smart TV', 'Tende a tutta altezza'] },
    'deluxe': { line: 'Sotto le antiche travi in legno.', text: 'Calde travi in legno sopra di te, lenzuola fresche sotto. Verde profondo, cremisi e un tocco d’oro, con uno specchio tondo che cattura la luce del pomeriggio.', features: ['Soffitto con travi in legno a vista', 'Specchio tondo', 'Portabagagli'] },
    'junior-suite': { line: 'Spazio per vivere, non solo per dormire.', text: 'Un ampio soggiorno sotto le travi, con un divano accogliente e un angolo cottura tutto tuo. Pensata per i soggiorni lunghi e le mattine lente.', features: ['Zona giorno con divano', 'Angolo cottura', 'Soffitto con travi in legno a vista'] },
    'senior-suite': { line: 'Lino, terracotta e verde.', text: 'Imbottiture in lino, un tavolino color terracotta, un’agave in un vaso bianco. Una suite di dettagli scelti con cura, dove i pomeriggi scorrono lenti.', features: ['Angolo salotto separato', 'Divano in lino', 'Pavimento effetto rovere'] },
    'deluxe-suite': { line: 'Due ambienti, un’unica prospettiva.', text: 'Un soggiorno che si apre sulla camera da letto, così la luce attraversa la suite da un capo all’altro. Il colore arriva dalle opere alle pareti.', features: ['Soggiorno separato', 'Opere d’arte originali', 'Smart TV'] },
    'grand-suite': { line: 'La casa nella sua versione più generosa.', text: 'Lampade in ottone sospese sopra un letto ampio e basso. Colori intensi alle pareti e toni neutri tutto intorno: una camera in cui tornare.', features: ['Lampade a sospensione in ottone', 'Opere d’arte originali', 'Testiera imbottita'] },
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
