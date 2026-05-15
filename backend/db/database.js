const { Database } = require('node-sqlite3-wasm');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

/* ── Auto-clean stale lock directory left by previous crash ── */
const dbPath   = path.join(__dirname, 'billetterie.db');
const lockPath = path.join(__dirname, 'billetterie.db.lock');
try { if (fs.existsSync(lockPath)) fs.rmSync(lockPath, { recursive: true, force: true }); } catch (_) {}

const db = new Database(dbPath);
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA synchronous = NORMAL');
db.exec('PRAGMA busy_timeout = 5000');
db.exec('PRAGMA cache_size = -8000');  /* 8 MB query cache */
db.exec('PRAGMA temp_store = MEMORY'); /* temp tables in RAM */

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    university_id TEXT,
    phone TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS universities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    city TEXT NOT NULL,
    color TEXT DEFAULT '#7C3AED',
    student_count INTEGER DEFAULT 0,
    description TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    university_id TEXT,
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    price_standard REAL DEFAULT 0,
    price_vip REAL DEFAULT 0,
    capacity INTEGER DEFAULT 200,
    tickets_sold INTEGER DEFAULT 0,
    dress_code TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'published',
    organizer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(id),
    FOREIGN KEY (organizer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    ticket_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'confirmed',
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

/* ── Migrations ── */
try {
  db.exec('ALTER TABLE tickets ADD COLUMN payment_intent_id TEXT');
} catch (_) { /* colonne déjà présente */ }

/* ── Performance indexes ── */
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_events_status_date  ON events(status, date);
  CREATE INDEX IF NOT EXISTS idx_events_status_city_date ON events(status, city, date);
  CREATE INDEX IF NOT EXISTS idx_events_status_type_date ON events(status, type, date);
  CREATE INDEX IF NOT EXISTS idx_events_status_university_date ON events(status, university_id, date);
  CREATE INDEX IF NOT EXISTS idx_events_city         ON events(city);
  CREATE INDEX IF NOT EXISTS idx_events_type         ON events(type);
  CREATE INDEX IF NOT EXISTS idx_events_university   ON events(university_id);
  CREATE INDEX IF NOT EXISTS idx_tickets_user        ON tickets(user_id);
  CREATE INDEX IF NOT EXISTS idx_tickets_user_purchased ON tickets(user_id, purchased_at DESC);
  CREATE INDEX IF NOT EXISTS idx_tickets_event       ON tickets(event_id);
  CREATE INDEX IF NOT EXISTS idx_tickets_status_purchased ON tickets(status, purchased_at DESC);
  CREATE INDEX IF NOT EXISTS idx_users_email         ON users(email);
`);

function transaction(fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (_) {}
    throw err;
  }
}

function optimize() {
  try { db.exec('PRAGMA optimize'); } catch (_) {}
}

function seedDatabase() {
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@billetterie.ma');
  if (adminExists) return;

  console.log('Initialisation de la base de données...');

  const universities = [
    { id: uuidv4(), name: 'Université Mohammed V', short_name: 'UM5', city: 'Rabat', color: '#7C3AED', student_count: 85000,
      description: 'Fondée en 1957, UM5 est le flambeau de l\'excellence académique marocaine. Première université du Royaume, elle forme les élites de demain dans ses 12 facultés réparties sur deux campus emblématiques de la capitale.',
      image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80' },
    { id: uuidv4(), name: 'Université Hassan II', short_name: 'UH2C', city: 'Casablanca', color: '#DC2626', student_count: 120000,
      description: 'Avec 120 000 étudiants, UH2C est la plus grande université du Maroc. Implantée au cœur économique du Royaume, elle connecte la formation académique aux réalités du monde professionnel casablancais.',
      image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80' },
    { id: uuidv4(), name: 'Université Cadi Ayyad', short_name: 'UCA', city: 'Marrakech', color: '#D97706', student_count: 95000,
      description: 'Au pied de l\'Atlas et au cœur de la Perle du Sud, l\'UCA rayonne par ses facultés de sciences, médecine et droits. Un campus vibrant où tradition marocaine et modernité académique se rencontrent chaque jour.',
      image_url: 'https://images.unsplash.com/photo-1557093793-e196ae071479?auto=format&fit=crop&w=800&q=80' },
    { id: uuidv4(), name: 'Université Ibn Tofail', short_name: 'UIT', city: 'Kénitra', color: '#059669', student_count: 45000,
      description: 'UIT incarne l\'université de la nouvelle génération : campus vert, innovation technologique, et esprit entrepreneurial. En pleine expansion, elle attire les meilleurs profils scientifiques du Maroc du Nord.',
      image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80' },
    { id: uuidv4(), name: 'Université Ibn Zohr', short_name: 'UIZ', city: 'Agadir', color: '#0284C7', student_count: 60000,
      description: 'Face à l\'Atlantique et ancrée dans le dynamisme du Souss-Massa, l\'UIZ forme les talents d\'une région en pleine renaissance. Tourisme, agro-alimentaire, droit et sciences : un écosystème académique complet.',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80' },
    { id: uuidv4(), name: 'Université SMSBA', short_name: 'USMBA', city: 'Fès', color: '#6D28D9', student_count: 80000,
      description: 'Héritière de la plus ancienne tradition intellectuelle du Maroc, l\'USMBA perpétue le rayonnement culturel de Fès. Arts, lettres, droit islamique et sciences coexistent dans cette université chargée d\'histoire.',
      image_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80' },
    { id: uuidv4(), name: 'Université Abdelmalek Essaâdi', short_name: 'UAE', city: 'Tétouan', color: '#BE185D', student_count: 55000,
      description: 'Carrefour entre deux continents, l\'UAE à Tétouan est l\'université qui regarde vers l\'Europe sans oublier ses racines africaines. Ses échanges internationaux et ses programmes bilingues en font un modèle d\'ouverture.',
      image_url: 'https://images.unsplash.com/photo-1596276020587-8044fe049813?auto=format&fit=crop&w=800&q=80' },
    { id: uuidv4(), name: 'Université Moulay Ismail', short_name: 'UMI', city: 'Meknès', color: '#B45309', student_count: 40000,
      description: 'Dans la cité impériale de Meknès, l\'UMI cultive l\'excellence académique sous le signe du patrimoine millénaire. Ses facultés de sciences, de droit et d\'ingénierie forment les bâtisseurs de la région Fès-Meknès.',
      image_url: 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=800&q=80' },
    { id: uuidv4(), name: 'Université Hassan 1er', short_name: 'UH1', city: 'Settat', color: '#065F46', student_count: 35000,
      description: 'UH1 Settat, université de la région Chaouia-Ouardigha, incarne la montée en puissance de l\'enseignement supérieur hors des grands pôles. Sciences économiques, droit et technologie propulsent ses étudiants vers le marché de l\'emploi.',
      image_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80' },
    { id: uuidv4(), name: 'Université Mohammed 1er', short_name: 'UM1', city: 'Oujda', color: '#1D4ED8', student_count: 50000,
      description: 'Porte de l\'Oriental et fenêtre sur le Maghreb, l\'UM1 Oujda joue un rôle stratégique dans l\'intégration régionale. Médecine, droit, sciences et lettres : une université complète qui rayonne jusqu\'en Algérie.',
      image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
  ];

  const insertUniversity = db.prepare(
    'INSERT INTO universities (id, name, short_name, city, color, student_count, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  universities.forEach(u => insertUniversity.run([u.id, u.name, u.short_name, u.city, u.color, u.student_count, u.description, u.image_url || null]));

  const adminId = uuidv4();
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run([adminId, 'Admin Billetterie', 'admin@billetterie.ma', bcrypt.hashSync('Admin123!', 10), 'admin']);

  const events = [
    {
      id: uuidv4(),
      title: 'Gala de Luxe Casablanca 2026',
      description: 'Bienvenue dans l\'événement le plus convoité de l\'année. Au cœur du Four Seasons Casablanca, les grandes tables s\'habillent de cristal et d\'or pour une nuit d\'exception. Dîner gastronomique signé par un chef étoilé, performance live d\'un orchestre philharmonique, et défilé de créateurs marocains en avant-première. Chaque détail a été pensé pour créer une expérience sensorielle unique — là où le luxe rencontre la culture marocaine dans toute sa splendeur.',
      type: 'gala', university_id: null, venue: 'Four Seasons Casablanca', city: 'Casablanca',
      date: '2026-06-15', time: '20:00', price_standard: 500, price_vip: 1200,
      capacity: 300, tickets_sold: 87, dress_code: 'Tenue de soirée — Black tie obligatoire',
      image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
    {
      id: uuidv4(),
      title: 'Soirée des Étoiles — Marrakech',
      description: 'Sous un ciel de jasmin et de lumières, les jardins légendaires de La Mamounia s\'éveillent pour une nuit enchanteresse. DJ international en live, cocktails signature par un mixologue de renom, et open bar premium jusqu\'à l\'aube. La Perle du Sud révèle sa face la plus sensuelle : bougies flottantes, pool party privée, et ambiance électrisante entre Orient et modernité. Une soirée que Marrakech ne donne qu\'une fois par an.',
      type: 'soiree', university_id: null, venue: 'La Mamounia — Jardins Exotiques', city: 'Marrakech',
      date: '2026-05-30', time: '21:00', price_standard: 300, price_vip: 700,
      capacity: 200, tickets_sold: 145, dress_code: 'Smart Casual — élégance exigée',
      image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
    {
      id: uuidv4(),
      title: 'Soirée Annuelle UM5 — Rabat',
      description: 'La nuit la plus attendue de l\'année universitaire à Rabat est enfin là ! Les étudiants de Mohammed V transforment la salle des fêtes en une scène électrique : DJ sets qui font trembler les murs, battles de danse, talent show surprise et remise des prix d\'excellence. Buffet marocain en abondance, photobooth géant et ambiance garantie jusqu\'aux premières heures du matin. La soirée qui restera dans les mémoires — et dans les stories.',
      type: 'universite', university_id: universities[0].id, venue: 'Salle des Fêtes Atlas Rabat', city: 'Rabat',
      date: '2026-06-20', time: '20:30', price_standard: 120, price_vip: 250,
      capacity: 500, tickets_sold: 210, dress_code: 'Smart Casual',
      image_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
    {
      id: uuidv4(),
      title: 'Gala de Fin d\'Année UH2C 2026',
      description: 'La promotion 2026 de l\'Université Hassan II célèbre la fin d\'un chapitre et l\'ouverture d\'une nouvelle page. Dans le cadre sublime du Sofitel Tour Blanche, une cérémonie empreinte d\'émotion précède une soirée mémorable : orchestre live, dîner gastronomique 4 services, et discours qui resteront gravés. Chaque diplômé mérite ce moment de gloire — venez partager celui des vôtres dans un décor à la hauteur de leur réussite.',
      type: 'universite', university_id: universities[1].id, venue: 'Sofitel Casablanca Tour Blanche', city: 'Casablanca',
      date: '2026-07-05', time: '19:00', price_standard: 200, price_vip: 450,
      capacity: 400, tickets_sold: 178, dress_code: 'Tenue de soirée — élégance requise',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
    {
      id: uuidv4(),
      title: 'Nuit Blanche — Marrakech',
      description: 'Une invitation au voyage sensoriel au cœur du Palais El Badi, vestige d\'une splendeur impériale. La règle : le blanc, toujours le blanc. Entre les colonnes millénaires et sous les étoiles du Maroc, la magie opère — musique gnawa fusion par un ensemble de maîtres musiciens, fantasia à la lueur des flambeaux, gastronomie marocaine servie sur des plateaux en argent. La Nuit Blanche n\'est pas une fête. C\'est un rituel.',
      type: 'soiree', university_id: null, venue: 'Palais El Badi — Marrakech', city: 'Marrakech',
      date: '2026-06-10', time: '21:30', price_standard: 350, price_vip: 800,
      capacity: 150, tickets_sold: 98, dress_code: 'Tenue entièrement blanche — obligatoire',
      image_url: 'https://images.unsplash.com/photo-1519671282429-b44660ead0a7?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
    {
      id: uuidv4(),
      title: 'Soirée Étudiante UCA — Marrakech',
      description: 'La Cadi Ayyad lâche les amarres pour la nuit la plus explosive de l\'année ! DJ international directement importé d\'Europe, animations surprises qui vont faire parler, laser show, buffet all you can eat, et une ambiance qui ne connaît qu\'une seule règle : zéro limite. Le Club Atlas Asni ouvre ses portes les plus larges pour 600 étudiants déterminés à marquer l\'histoire de l\'université. Et toi, tu seras là ou tu le regretteras ?',
      type: 'universite', university_id: universities[2].id, venue: 'Club Atlas Asni Marrakech', city: 'Marrakech',
      date: '2026-06-28', time: '22:00', price_standard: 100, price_vip: 200,
      capacity: 600, tickets_sold: 320, dress_code: 'Casual chic — pas de tenue de sport',
      image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
    {
      id: uuidv4(),
      title: 'Gala Élégance — Rabat',
      description: 'Dans les jardins de roses du Sofitel Rabat, l\'élégance prend un sens nouveau. Ce gala de prestige réunit décideurs, artistes et personnalités pour une soirée placée sous le signe du raffinement absolu. Concert live d\'artistes marocains en exclusivité, dîner 5 étoiles en 6 services maridages mets & vins, et vente aux enchères d\'œuvres d\'art au profit d\'une ONG locale. Chaque billet vendu finance l\'éducation d\'un enfant défavorisé. Ce soir, le luxe a une conscience.',
      type: 'gala', university_id: null, venue: 'Hôtel Sofitel Rabat Jardin des Roses', city: 'Rabat',
      date: '2026-07-12', time: '19:30', price_standard: 600, price_vip: 1500,
      capacity: 250, tickets_sold: 62, dress_code: 'Black tie strict — tenue de soirée longue',
      image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
    {
      id: uuidv4(),
      title: 'Soirée Étudiante UIT — Kénitra',
      description: 'L\'Ibn Tofail entre en ébullition pour sa soirée de fin d\'année ! Scène ouverte pour révéler les talents cachés de la promo, DJ battle entre les facultés, gaming zone, photo booth créatif, et remise des prix d\'excellence dans une ambiance survoltée. Buffet généreux, animations nonstop, et une équipe qui a tout prévu pour que personne ne rentre déçu. C\'est ça, la famille UIT — on fête ensemble, on brille ensemble.',
      type: 'universite', university_id: universities[3].id, venue: 'Centre Culturel Mohammed Diouri', city: 'Kénitra',
      date: '2026-06-25', time: '21:00', price_standard: 80, price_vip: 180,
      capacity: 400, tickets_sold: 156, dress_code: 'Smart casual',
      image_url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
    {
      id: uuidv4(),
      title: 'Gala Ibn Zohr — Nuit de la Baie',
      description: 'La nuit la plus glamour du Sud marocain se tient face à l\'infini bleu de la baie d\'Agadir. Les étudiants de l\'Ibn Zohr ont tout pensé : tapis rouge à l\'entrée, cocktail de bienvenue au coucher de soleil sur l\'Atlantique, DJ sets soigneusement sélectionnés, et animations qui font honneur à l\'esprit du Souss. L\'Hôtel Royal Atlas ouvre ses terrasses panoramiques pour une nuit à couper le souffle. Parce que le Sud mérite mieux qu\'une simple fête.',
      type: 'universite', university_id: universities[4].id, venue: 'Hôtel Royal Atlas Agadir', city: 'Agadir',
      date: '2026-07-01', time: '20:00', price_standard: 150, price_vip: 320,
      capacity: 350, tickets_sold: 89, dress_code: 'Casual chic — couleurs estivales',
      image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
    {
      id: uuidv4(),
      title: 'Soirée Orientale — Fès la Magnifique',
      description: 'Fès n\'est pas une ville. C\'est un état d\'âme. Et ce soir, au cœur d\'un riad de la médina millénaire, elle vous révèle ses plus beaux secrets. Musique andalouse interprétée par un ensemble de maîtres de la Philharmonie Al-Brihi, cérémonie du thé par un maâlem, artisans zelligeurs et tadelakteurs au travail devant vos yeux, et un dîner traditionnel de 7 plats qui raconte l\'histoire de la cité des Idrissides. Tenue orientale bienvenue — l\'authenticité est de mise.',
      type: 'soiree', university_id: null, venue: 'Riad Fès — Médina', city: 'Fès',
      date: '2026-07-18', time: '19:00', price_standard: 280, price_vip: 600,
      capacity: 120, tickets_sold: 45, dress_code: 'Tenue orientale bienvenue — djellaba & caftan',
      image_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      status: 'published', organizer_id: adminId
    },
  ];

  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, description, type, university_id, venue, city, date, time, price_standard, price_vip, capacity, tickets_sold, dress_code, image_url, status, organizer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  events.forEach(e => insertEvent.run([
    e.id, e.title, e.description, e.type, e.university_id, e.venue, e.city,
    e.date, e.time, e.price_standard, e.price_vip, e.capacity, e.tickets_sold,
    e.dress_code, e.image_url || null, e.status, e.organizer_id
  ]));

  console.log('✅ Base de données initialisée: 10 universités, 10 événements, 1 admin');
}

function seedTidarEvents() {
  const already = db.prepare("SELECT COUNT(*) as c FROM events WHERE venue LIKE '%LEONE%' OR venue LIKE '%Sofitel Royal Bay%' OR venue LIKE '%Taghazout%'").get().c;
  if (already > 0) return;

  const admin = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();
  if (!admin) return;
  const orgId = admin.id;

  const tidarEvents = [
    {
      title: 'SIMON J & ALEXIA @ LEONE',
      description: 'Une nuit électronique exclusive au club LEONE avec Simon J & Alexia aux platines. Ambiance underground, son de qualité et dancefloor enflammé jusqu\'au lever du soleil.',
      type: 'soiree', venue: 'LEONE Club', city: 'Marrakech',
      date: '2026-05-09', time: '23:00', price_standard: 200, price_vip: 500,
      capacity: 350, tickets_sold: 210, dress_code: 'Smart casual — no sportswear',
      image_url: 'https://tidar.ma/uploads/1777935884.png',
    },
    {
      title: 'DJ RUN with ODDITY — Tanger',
      description: 'DJ RUN s\'associe à ODDITY pour une soirée électronique inédite à Tanger. Deux univers sonores qui se rencontrent pour une nuit mémorable dans la ville du détroit.',
      type: 'concert', venue: 'Venue TBA — Tanger', city: 'Tanger',
      date: '2026-05-10', time: '22:00', price_standard: 150, price_vip: 350,
      capacity: 400, tickets_sold: 180, dress_code: 'Smart casual',
      image_url: 'https://tidar.ma/uploads/1777298519.png',
    },
    {
      title: 'Dance Of Freedom — Casablanca',
      description: 'Un voyage somatique de danse extatique guidé par Coming into Wholeness. Cercle d\'ouverture, activation somatique, danse extatique et intégration.',
      type: 'autre', venue: 'Slow Flow Yoga — Route d\'Azemmour', city: 'Casablanca',
      date: '2026-05-17', time: '17:00', price_standard: 250, price_vip: 0,
      capacity: 80, tickets_sold: 45, dress_code: 'Tenue confortable — yoga/danse',
      image_url: 'https://tidar.ma/uploads/1750027658.png',
    },
    {
      title: 'Miguelle & Tons @ LEONE — Marrakech',
      description: 'LEONE accueille Miguelle & Tons pour une nuit de musique électronique de haute qualité. Ces artistes reconnus sur la scène internationale viennent faire vibrer le dancefloor.',
      type: 'soiree', venue: 'LEONE Club', city: 'Marrakech',
      date: '2026-05-16', time: '23:00', price_standard: 200, price_vip: 500,
      capacity: 350, tickets_sold: 155, dress_code: 'Smart casual',
      image_url: 'https://tidar.ma/uploads/1777650820.png',
    },
    {
      title: 'Old School R&B Brunch — Marrakech',
      description: 'Un brunch dominical baigné dans les meilleurs hits R&B old school. Ambiance décontractée, bonne musique, brunch généreux et soleil marocain.',
      type: 'soiree', venue: 'Venue TBA — Marrakech', city: 'Marrakech',
      date: '2026-05-17', time: '12:00', price_standard: 300, price_vip: 600,
      capacity: 200, tickets_sold: 88, dress_code: 'Casual chic',
      image_url: 'https://tidar.ma/uploads/1778078100.png',
    },
    {
      title: 'LE COMPTOIR ELECTRONIK — Club Edition',
      description: '"La porte ouvre à 23h30… Après ça, le temps n\'a plus d\'importance." Soirée électronique intime au SOUL CLUB du Sofitel Royal Bay d\'Agadir. Avec Maqossa, Whoskenza & Akagamy.',
      type: 'soiree', venue: 'SOUL CLUB — Hôtel Sofitel Royal Bay, Baie des Palmiers', city: 'Agadir',
      date: '2026-05-22', time: '23:30', price_standard: 180, price_vip: 450,
      capacity: 300, tickets_sold: 124, dress_code: 'Smart casual — no sportswear',
      image_url: 'https://tidar.ma/uploads/1778240157.jpg',
    },
    {
      title: 'ArtBound invite Alexia Glensy, Alex Dima & Juaan',
      description: 'ArtBound présente une nuit exceptionnelle avec Alexia Glensy, Alex Dima, Juaan et des artistes surprises. Expérience immersive à Marrakech.',
      type: 'concert', venue: 'Venue TBA — Marrakech', city: 'Marrakech',
      date: '2026-05-23', time: '22:00', price_standard: 250, price_vip: 600,
      capacity: 400, tickets_sold: 97, dress_code: 'Smart casual',
      image_url: 'https://tidar.ma/uploads/1777028810.png',
    },
    {
      title: 'Alex Wann @ LEONE — Marrakech',
      description: 'Alex Wann prend possession du dancefloor de LEONE pour une nuit de musique électronique soigneusement curatée. Un set de haut vol dans l\'un des clubs les plus prisés du Maroc.',
      type: 'soiree', venue: 'LEONE Club', city: 'Marrakech',
      date: '2026-05-29', time: '23:00', price_standard: 200, price_vip: 500,
      capacity: 350, tickets_sold: 73, dress_code: 'Smart casual',
      image_url: 'https://tidar.ma/uploads/1776862960.png',
    },
    {
      title: 'DREAMERS — Soul Awakening',
      description: 'Une expérience immersive de 4 jours mêlant musique, art, bien-être et éveil spirituel au cœur de la magie de Marrakech. Ateliers, concerts, méditation et célébration.',
      type: 'soiree', venue: 'Palmeraie — Marrakech', city: 'Marrakech',
      date: '2026-06-05', time: '16:00', price_standard: 450, price_vip: 950,
      capacity: 500, tickets_sold: 201, dress_code: 'Tenue confortable et artistique bienvenue',
      image_url: 'https://tidar.ma/uploads/1775128024.png',
    },
    {
      title: 'XTRAVAGANZA — XZ Immersive Music Festival',
      description: 'Festival immersif au Radisson Blu de Taghazout Bay. Choisissez votre thème (eau, terre, air, feu). Lineup : ANDREA OLIVA, JORIS DELACROIX, JOACHIM PASTOR, Oddity, CAIIRO et plus.',
      type: 'soiree', venue: 'Radisson Blu Resort — Taghazout Bay Surf Village', city: 'Agadir',
      date: '2026-06-05', time: '20:00', price_standard: 400, price_vip: 900,
      capacity: 1500, tickets_sold: 630, dress_code: 'Costume thématique : Eau / Terre / Air / Feu',
      image_url: 'https://tidar.ma/uploads/1769594314.jpg',
    },
    {
      title: 'SuperJazzy Mādero Marrakech — Weekend Festival',
      description: '+22h de musique avec Circoloco\'s Tania Vulcano et 12 artistes internationaux. Son Funktion-One, pool vibes et jardin des senteurs.',
      type: 'soiree', venue: 'Villa Marco — Au jardin des senteurs', city: 'Marrakech',
      date: '2026-06-05', time: '22:00', price_standard: 350, price_vip: 750,
      capacity: 600, tickets_sold: 289, dress_code: 'Smart casual / Festival',
      image_url: 'https://tidar.ma/uploads/1777980600.jpg',
    },
    {
      title: 'Darna I — Roots of Detroit',
      description: 'Darna présente "Roots of Detroit" — une exploration des origines de la house et techno de Detroit. Une nuit dédiée à l\'authenticité du son électronique.',
      type: 'concert', venue: 'Venue TBA — Marrakech', city: 'Marrakech',
      date: '2026-06-13', time: '22:00', price_standard: 200, price_vip: 450,
      capacity: 400, tickets_sold: 112, dress_code: 'Smart casual',
      image_url: 'https://tidar.ma/uploads/1778238231.png',
    },
    {
      title: 'ZONA pres. The Moment Showcase — WhoMadeWho',
      description: 'ZONA 2ème édition avec WhoMadeWho — "un format showcase que le Maroc voit pour la première fois." Avec Shimza, Desiree, Kenza Kayati & Staika.',
      type: 'soiree', venue: 'Moment — Marrakech', city: 'Marrakech',
      date: '2026-06-26', time: '21:00', price_standard: 300, price_vip: 700,
      capacity: 800, tickets_sold: 340, dress_code: 'Smart casual / Chic',
      image_url: 'https://tidar.ma/uploads/1775756790.png',
    },
    {
      title: 'MOGA ESSAOUIRA 2026 — 10ème Anniversaire',
      description: 'MOGA fête son 10ème anniversaire à Essaouira. Festival boutique de musique électronique inspiré par les vibrations de l\'Atlantique. 5 jours de musique, art, mouvement et expériences inoubliables.',
      type: 'soiree', venue: 'Hôtel Le Golf d\'Essaouira & Spa', city: 'Essaouira',
      date: '2026-10-02', time: '14:00', price_standard: 600, price_vip: 1400,
      capacity: 2000, tickets_sold: 450, dress_code: 'Festival / Bohème',
      image_url: 'https://tidar.ma/uploads/1760621039.jpg',
    },
  ];

  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, description, type, university_id, venue, city, date, time,
      price_standard, price_vip, capacity, tickets_sold, dress_code, image_url, status, organizer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  tidarEvents.forEach(e => {
    const exists = db.prepare('SELECT id FROM events WHERE title = ? AND date = ?').get([e.title, e.date]);
    if (exists) return;
    insertEvent.run([
      uuidv4(), e.title, e.description, e.type, null,
      e.venue, e.city, e.date, e.time,
      e.price_standard, e.price_vip, e.capacity, e.tickets_sold,
      e.dress_code, e.image_url || null, 'published', orgId
    ]);
  });

  const count = db.prepare("SELECT COUNT(*) as c FROM events").get().c;
  console.log(`🎵 Événements tidar.ma importés avec photos — Total en base: ${count} événements`);
}

seedDatabase();
seedTidarEvents();
optimize();

module.exports = db;
module.exports.transaction = transaction;
