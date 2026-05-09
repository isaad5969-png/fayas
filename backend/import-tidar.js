/**
 * Import des événements réels depuis tidar.ma
 * Source: https://buy.tidar.ma — scrapé le 09/05/2026
 * Exécuter: node import-tidar.js
 */

const { Database } = require('node-sqlite3-wasm');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const db = new Database(path.join(__dirname, 'db', 'billetterie.db'));
db.exec('PRAGMA foreign_keys = ON');

// Récupérer l'admin pour organizer_id
const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
if (!admin) {
  console.error('❌ Admin introuvable. Lancez d\'abord le serveur pour initialiser la DB.');
  process.exit(1);
}
const organizerId = admin.id;

const tidarEvents = [
  {
    title: 'SIMON J & ALEXIA @ LEONE',
    description: 'Une nuit électronique exclusive au club LEONE avec Simon J & Alexia aux platines. Ambiance underground, son de qualité et dancefloor enflammé jusqu\'au lever du soleil. L\'un des clubs les plus réputés de Marrakech.',
    type: 'soiree',
    venue: 'LEONE Club',
    city: 'Marrakech',
    date: '2026-05-09',
    time: '23:00',
    price_standard: 200,
    price_vip: 500,
    capacity: 350,
    tickets_sold: 210,
    dress_code: 'Smart casual — entrée refusée en tenue de sport',
    status: 'published',
  },
  {
    title: 'DJ RUN with @ODDITY — Tanger',
    description: 'DJ RUN s\'associe à ODDITY pour une soirée électronique inédite à Tanger. Deux univers sonores qui se rencontrent pour une nuit mémorable dans la ville du détroit.',
    type: 'concert',
    venue: 'Venue TBA — Tanger',
    city: 'Tanger',
    date: '2026-05-10',
    time: '22:00',
    price_standard: 150,
    price_vip: 350,
    capacity: 400,
    tickets_sold: 180,
    dress_code: 'Smart casual',
    status: 'published',
  },
  {
    title: 'Dance Of Freedom — Casablanca',
    description: 'Un voyage somatique de danse extatique guidé par Coming into Wholeness. Une expérience de libération à travers le mouvement : cercle d\'ouverture, activation somatique, danse extatique et intégration. Une expérience unique mêlant bien-être et musique.',
    type: 'autre',
    venue: 'Slow Flow Yoga — Route d\'Azemmour',
    city: 'Casablanca',
    date: '2026-05-17',
    time: '17:00',
    price_standard: 250,
    price_vip: 0,
    capacity: 80,
    tickets_sold: 45,
    dress_code: 'Tenue confortable — yoga/danse',
    status: 'published',
  },
  {
    title: 'Miguelle & Tons @ LEONE — Marrakech',
    description: 'LEONE accueille Miguelle & Tons pour une nuit de musique électronique de haute qualité. Ces deux artistes reconnus sur la scène internationale viennent faire vibrer le dancefloor de Marrakech.',
    type: 'soiree',
    venue: 'LEONE Club',
    city: 'Marrakech',
    date: '2026-05-16',
    time: '23:00',
    price_standard: 200,
    price_vip: 500,
    capacity: 350,
    tickets_sold: 155,
    dress_code: 'Smart casual',
    status: 'published',
  },
  {
    title: 'Old School R&B Brunch — Marrakech',
    description: 'Un brunch dominical baigné dans les meilleurs hits R&B old school. Ambiance décontractée, bonne musique, brunch généreux et soleil marocain. L\'événement du dimanche à ne pas manquer à Marrakech.',
    type: 'soiree',
    venue: 'Venue TBA — Marrakech',
    city: 'Marrakech',
    date: '2026-05-17',
    time: '12:00',
    price_standard: 300,
    price_vip: 600,
    capacity: 200,
    tickets_sold: 88,
    dress_code: 'Casual chic',
    status: 'published',
  },
  {
    title: 'LE COMPTOIR ELECTRONIK — Club Edition',
    description: 'Une soirée électronique intime et exclusive au SOUL CLUB de l\'Hôtel Sofitel Royal Bay d\'Agadir. "La porte ouvre à 23h30… Après ça, le temps n\'a plus d\'importance." Avec Maqossa, Whoskenza & Akagamy.',
    type: 'soiree',
    venue: 'SOUL CLUB — Hôtel Sofitel Royal Bay, Baie des Palmiers',
    city: 'Agadir',
    date: '2026-05-22',
    time: '23:30',
    price_standard: 180,
    price_vip: 450,
    capacity: 300,
    tickets_sold: 124,
    dress_code: 'Smart casual — no sportswear',
    status: 'published',
  },
  {
    title: 'ArtBound invite Alexia Glensy, Alex Dima & Juaan',
    description: 'ArtBound présente une nuit exceptionnelle avec Alexia Glensy, Alex Dima, Juaan et d\'autres artistes surprises. Une programmation artistique et musicale soigneusement sélectionnée pour une expérience immersive à Marrakech.',
    type: 'concert',
    venue: 'Venue TBA — Marrakech',
    city: 'Marrakech',
    date: '2026-05-23',
    time: '22:00',
    price_standard: 250,
    price_vip: 600,
    capacity: 400,
    tickets_sold: 97,
    dress_code: 'Smart casual',
    status: 'published',
  },
  {
    title: 'Alex Wann @ LEONE — Marrakech',
    description: 'Alex Wann prend possession du dancefloor de LEONE pour une nuit de musique électronique soigneusement curatée. Un set de haut vol dans l\'un des clubs les plus prisés du Maroc.',
    type: 'soiree',
    venue: 'LEONE Club',
    city: 'Marrakech',
    date: '2026-05-29',
    time: '23:00',
    price_standard: 200,
    price_vip: 500,
    capacity: 350,
    tickets_sold: 73,
    dress_code: 'Smart casual',
    status: 'published',
  },
  {
    title: 'DREAMERS — Soul Awakening',
    description: 'Une expérience immersive de 4 jours mêlant musique, art, bien-être et éveil spirituel. DREAMERS Soul Awakening vous invite à un voyage intérieur au cœur de la magie de Marrakech. Ateliers, concerts, méditation et célébration.',
    type: 'soiree',
    venue: 'Palmeraie — Marrakech',
    city: 'Marrakech',
    date: '2026-06-05',
    time: '16:00',
    price_standard: 450,
    price_vip: 950,
    capacity: 500,
    tickets_sold: 201,
    dress_code: 'Tenue comfortable et artistique bienvenue',
    status: 'published',
  },
  {
    title: 'XTRAVAGANZA — XZ Immersive Music Festival',
    description: 'Un festival immersif unique au Radisson Blu Resort de Taghazout Bay. Choisissez votre thème élémentaire (eau, terre, air ou feu) et plongez dans un carnaval de lumières et de musique. Lineup : ADASSIYA, JOEZI, ARKADYAN, ANDREA OLIVA, MOEAIKE, JORIS DELACROIX, JOACHIM PASTOR, Oddity, CAIIRO et plus.',
    type: 'soiree',
    venue: 'Radisson Blu Resort — Taghazout Bay Surf Village',
    city: 'Agadir',
    date: '2026-06-05',
    time: '20:00',
    price_standard: 400,
    price_vip: 900,
    capacity: 1500,
    tickets_sold: 630,
    dress_code: 'Costume thématique : Eau / Terre / Air / Feu',
    status: 'published',
  },
  {
    title: 'SuperJazzy Mādero Marrakech — Weekend Festival',
    description: 'Un weekend musical de +22h de musique avec Circoloco\'s Tania Vulcano et 12 artistes internationaux. Son Funktion-One, pool vibes et jardin des senteurs. Une "simple et honnête réunion" autour de la musique et de la connexion humaine.',
    type: 'soiree',
    venue: 'Villa Marco — Au jardin des senteurs',
    city: 'Marrakech',
    date: '2026-06-05',
    time: '22:00',
    price_standard: 350,
    price_vip: 750,
    capacity: 600,
    tickets_sold: 289,
    dress_code: 'Smart casual / Festival',
    status: 'published',
  },
  {
    title: 'Darna I — Roots of Detroit',
    description: 'Darna présente sa première édition "Roots of Detroit" — une exploration des origines de la house et techno de Detroit. Une nuit dédiée à l\'authenticité du son électronique avec une sélection pointue d\'artistes.',
    type: 'concert',
    venue: 'Venue TBA — Marrakech',
    city: 'Marrakech',
    date: '2026-06-13',
    time: '22:00',
    price_standard: 200,
    price_vip: 450,
    capacity: 400,
    tickets_sold: 112,
    dress_code: 'Smart casual',
    status: 'published',
  },
  {
    title: 'ZONA pres. The Moment Showcase — WhoMadeWho',
    description: 'ZONA revient pour une 2ème édition encore plus élevée. En tête d\'affiche : WhoMadeWho, partenaire du Moment Marrakech — "un format showcase que le Maroc voit pour la première fois." Avec Shimza, Desiree, Kenza Kayati et Staika. Les billets sont livrés 24h avant l\'événement.',
    type: 'soiree',
    venue: 'Moment — Marrakech',
    city: 'Marrakech',
    date: '2026-06-26',
    time: '21:00',
    price_standard: 300,
    price_vip: 700,
    capacity: 800,
    tickets_sold: 340,
    dress_code: 'Smart casual / Chic',
    status: 'published',
  },
  {
    title: 'MOGA ESSAOUIRA 2026 — 10ème Anniversaire',
    description: 'MOGA fête son 10ème anniversaire à Essaouira. Un festival boutique de musique électronique inspiré par les vibrations de l\'Atlantique, connectant des gens du monde entier à travers la musique, la danse, l\'art et le bien-être. 5 jours de musique, art, mouvement et expériences inoubliables.',
    type: 'soiree',
    venue: 'Hôtel Le Golf d\'Essaouira & Spa',
    city: 'Essaouira',
    date: '2026-10-02',
    time: '14:00',
    price_standard: 600,
    price_vip: 1400,
    capacity: 2000,
    tickets_sold: 450,
    dress_code: 'Festival / Bohème',
    status: 'published',
  },
];

const insertEvent = db.prepare(`
  INSERT INTO events (id, title, description, type, university_id, venue, city, date, time,
    price_standard, price_vip, capacity, tickets_sold, dress_code, status, organizer_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let inserted = 0;
let skipped = 0;

tidarEvents.forEach(e => {
  // Vérifier si l'événement existe déjà
  const exists = db.prepare('SELECT id FROM events WHERE title = ? AND date = ?').get([e.title, e.date]);
  if (exists) {
    console.log(`⏭️  Déjà existant: ${e.title}`);
    skipped++;
    return;
  }
  insertEvent.run([
    uuidv4(), e.title, e.description, e.type, null,
    e.venue, e.city, e.date, e.time,
    e.price_standard, e.price_vip, e.capacity, e.tickets_sold,
    e.dress_code, e.status, organizerId
  ]);
  console.log(`✅ Ajouté: ${e.title} — ${e.date} — ${e.city}`);
  inserted++;
});

console.log(`\n🎉 Import terminé: ${inserted} événements ajoutés, ${skipped} ignorés (déjà existants)`);
console.log(`📊 Total événements en base: ${db.prepare('SELECT COUNT(*) as c FROM events').get().c}`);
process.exit(0);
