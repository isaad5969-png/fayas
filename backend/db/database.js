require('../config/env')();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const connectionString = process.env.DATABASE_URL;

let pool;

if (connectionString) {
  /* ── Production / staging : vraie base PostgreSQL ── */
  pool = new Pool({
    connectionString,
    ssl: !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
      ? { rejectUnauthorized: false }
      : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  pool.on('error', (err) => console.error('[DB] Pool error:', err.message));
} else {
  /* ── Mode démo local : base PostgreSQL in-memory (pg-mem) ── */
  console.info('[DB] Aucune DATABASE_URL — démarrage en mode démo (base in-memory).');
  const { newDb } = require('pg-mem');
  const memDb = newDb();
  /* pg-mem expose un adaptateur pg Pool-compatible */
  pool = memDb.adapters.createPg().Pool;
  pool = new pool();
}

let initPromise;

async function query(sql, params = []) {
  if (initPromise) await initPromise;
  return pool.query(sql, params);
}

async function many(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows;
}

async function one(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows[0] || null;
}

async function run(sql, params = []) {
  return query(sql, params);
}

async function transaction(fn) {
  const client = await pool.connect();
  const tx = {
    query: (sql, params = []) => client.query(sql, params),
    many: async (sql, params = []) => (await client.query(sql, params)).rows,
    one: async (sql, params = []) => (await client.query(sql, params)).rows[0] || null,
    run: (sql, params = []) => client.query(sql, params),
  };

  try {
    await client.query('BEGIN');
    const result = await fn(tx);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function initSchema() {

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS universities (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        short_name  TEXT NOT NULL UNIQUE,
        city        TEXT NOT NULL,
        color       TEXT DEFAULT '#7C3AED',
        student_count INTEGER DEFAULT 0,
        description TEXT,
        image_url   TEXT,
        logo_url    TEXT,
        votes       INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS users (
        id           TEXT PRIMARY KEY,
        name         TEXT NOT NULL,
        email        TEXT UNIQUE NOT NULL,
        password     TEXT NOT NULL,
        role         TEXT DEFAULT 'user',
        university_id TEXT REFERENCES universities(id),
        phone        TEXT,
        loyalty_points INTEGER DEFAULT 0,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id             TEXT PRIMARY KEY,
        title          TEXT NOT NULL,
        description    TEXT,
        type           TEXT NOT NULL,
        university_id  TEXT REFERENCES universities(id),
        venue          TEXT NOT NULL,
        city           TEXT NOT NULL,
        date           DATE NOT NULL,
        time           TEXT NOT NULL,
        price_standard NUMERIC(10,2) DEFAULT 0,
        price_vip      NUMERIC(10,2) DEFAULT 0,
        capacity       INTEGER DEFAULT 200,
        tickets_sold   INTEGER DEFAULT 0,
        dress_code     TEXT,
        image_url      TEXT,
        lat            FLOAT,
        lng            FLOAT,
        status         TEXT DEFAULT 'published',
        organizer_id   TEXT REFERENCES users(id),
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        updated_at     TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id           TEXT PRIMARY KEY,
        event_id     TEXT NOT NULL REFERENCES events(id),
        user_id      TEXT NOT NULL REFERENCES users(id),
        ticket_type  TEXT NOT NULL,
        quantity     INTEGER DEFAULT 1,
        unit_price   NUMERIC(10,2) NOT NULL,
        total_price  NUMERIC(10,2) NOT NULL,
        status       TEXT DEFAULT 'confirmed',
        purchased_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id         TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used       BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS phone_otps (
        phone      TEXT PRIMARY KEY,
        code       TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts   INTEGER DEFAULT 0
      );
    `);

    /* ── indexes ── */
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_status_date         ON events(status, date);
      CREATE INDEX IF NOT EXISTS idx_events_status_city_date    ON events(status, city, date);
      CREATE INDEX IF NOT EXISTS idx_events_status_type_date    ON events(status, type, date);
      CREATE INDEX IF NOT EXISTS idx_events_status_university   ON events(status, university_id, date);
      CREATE INDEX IF NOT EXISTS idx_events_university_id       ON events(university_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_user_purchased     ON tickets(user_id, purchased_at DESC);
      CREATE INDEX IF NOT EXISTS idx_tickets_event              ON tickets(event_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_status_purchased   ON tickets(status, purchased_at DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email                ON users(email);
      CREATE INDEX IF NOT EXISTS idx_prt_token                 ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_prt_user                  ON password_reset_tokens(user_id);
    `);

    /* ── migrations gracieuses ── */
    await client.query(`
      ALTER TABLE events   ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE events   ADD COLUMN IF NOT EXISTS lat                FLOAT;
      ALTER TABLE events   ADD COLUMN IF NOT EXISTS lng                FLOAT;
      ALTER TABLE users        ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE tickets      ADD COLUMN IF NOT EXISTS payment_intent_id  TEXT;
      ALTER TABLE universities ADD COLUMN IF NOT EXISTS logo_url           TEXT;
      ALTER TABLE universities ADD COLUMN IF NOT EXISTS votes              INTEGER DEFAULT 0;
    `);

    /* ── ensure unique constraint on short_name (migration safety) ── */
    await client.query(
      `ALTER TABLE universities ADD CONSTRAINT universities_short_name_key UNIQUE (short_name);`
    ).catch(() => { /* already exists — safe to ignore */ });

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/* ── Full list of Moroccan universities — upserted on every startup ── */
const ALL_UNIVERSITIES = [
  /* ── Universités Publiques ── */
  ['UM5',        'Université Mohammed V',                    'Rabat',       '#7C3AED', 85000,  '/logos/UM5.png'],
  ['UH2C',       'Université Hassan II',                     'Casablanca',  '#DC2626', 120000, '/logos/UH2C.png'],
  ['UCA',        'Université Cadi Ayyad',                    'Marrakech',   '#D97706', 95000,  '/logos/UCA.png'],
  ['USMBA',      'Université Sidi Mohammed Ben Abdellah',    'Fès',         '#6D28D9', 80000,  '/logos/USMBA.jpg'],
  ['UIT',        'Université Ibn Tofail',                    'Kénitra',     '#059669', 45000,  '/logos/UIT.png'],
  ['UIZ',        'Université Ibn Zohr',                      'Agadir',      '#0284C7', 60000,  '/logos/UIZ.jpg'],
  ['UAE',        'Université Abdelmalek Essaâdi',            'Tétouan',     '#BE185D', 55000,  '/logos/UAE.png'],
  ['UMI',        'Université Moulay Ismail',                 'Meknès',      '#B45309', 40000,  '/logos/UMI.png'],
  ['UH1',        'Université Hassan 1er',                    'Settat',      '#065F46', 35000,  '/logos/UH1.png'],
  ['UM1',        'Université Mohammed 1er',                  'Oujda',       '#1D4ED8', 50000,  '/logos/UM1.svg'],
  ['UCD',        'Université Chouaib Doukkali',              'El Jadida',   '#0891B2', 30000,  '/logos/UCD.jpg'],
  ['USMS',       'Université Sultan Moulay Slimane',         'Béni Mellal', '#7C2D8A', 35000,  '/logos/USMS.svg'],
  ['UAQ',        'Université Al Quaraouiyine',               'Fès',         '#92400E', 10000,  '/logos/UAQ.png'],
  /* ── Grandes Écoles & Instituts ── */
  ['EMI',        'École Mohammadia d\'Ingénieurs',           'Rabat',       '#1E40AF', 3000,   '/logos/EMI.png'],
  ['ENSIAS',     'ENSIAS',                                   'Rabat',       '#4338CA', 1500,   '/logos/ENSIAS.jpg'],
  ['INPT',       'Institut National des P&T',                'Rabat',       '#0F766E', 2000,   '/logos/INPT.png'],
  ['INSEA',      'INSEA',                                    'Rabat',       '#854D0E', 1200,   '/logos/INSEA.png'],
  ['EHTP',       'École Hassania des Travaux Publics',       'Casablanca',  '#9D174D', 1500,   '/logos/EHTP.svg'],
  ['IAV',        'IAV Hassan II',                            'Rabat',       '#166534', 3000,   '/logos/IAV.png'],
  ['ISCAE',      'ISCAE',                                    'Casablanca',  '#1E3A5F', 4000,   '/logos/ISCAE.jpg'],
  ['HEM',        'HEM Business School',                      'Casablanca',  '#7E22CE', 8000,   '/logos/HEM.svg'],
  ['ENCG-CASA',  'ENCG Casablanca',                          'Casablanca',  '#0E4F8B', 3000,   '/logos/ENCG-CASA.png'],
  ['ENCG-FES',   'ENCG Fès',                                 'Fès',         '#3730A3', 2500,   '/logos/ENCG-FES.png'],
  /* ── Universités Privées ── */
  ['UIR',        'Université Internationale de Rabat',       'Rabat',       '#0369A1', 8000,   '/logos/UIR.jpg'],
  ['UM6P',       'Université Mohammed VI Polytechnique',     'Ben Guerir',  '#374151', 3000,   '/logos/UM6P.png'],
  ['UAA',        'Université Al Akhawayn',                   'Ifrane',      '#B91C1C', 2000,   '/logos/UAA.jpg'],
  ['UIC',        'Université Internationale de Casablanca',  'Casablanca',  '#0E7490', 5000,   '/logos/UIC.jpg'],
  ['UEMF',       'Université Euro-Méditerranéenne de Fès',   'Fès',         '#1A56DB', 3000,   '/logos/UEMF.png'],
  ['UPM',        'Université Privée de Marrakech',           'Marrakech',   '#C2410C', 4000,   '/logos/UPM.jpg'],
  ['MUNDIAPOLIS','Université Mundiapolis',                    'Casablanca',  '#4B5563', 6000,   '/logos/MUNDIAPOLIS.gif'],
];

async function upsertUniversities() {
  for (const [shortName, name, city, color, studentCount, logoUrl] of ALL_UNIVERSITIES) {
    /* Vote de départ stable (préservé sur les votes réels accumulés en prod) */
    const seededVotes = 80 + (geoHash(shortName) % 420);
    await pool.query(`
      INSERT INTO universities (id, name, short_name, city, color, student_count, description, logo_url, votes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (short_name) DO UPDATE SET
        name          = EXCLUDED.name,
        city          = EXCLUDED.city,
        color         = EXCLUDED.color,
        student_count = EXCLUDED.student_count,
        description   = EXCLUDED.description,
        logo_url      = EXCLUDED.logo_url
    `, [
      uuidv4(),
      name,
      shortName,
      city,
      color,
      studentCount,
      `${name} — établissement d'enseignement supérieur à ${city}.`,
      logoUrl || null,
      seededVotes,
    ]);
  }
  console.log(`[DB] ${ALL_UNIVERSITIES.length} universités marocaines synchronisées.`);
}

/* ── Géolocalisation des événements ── */
const CITY_COORDS = {
  Casablanca: [33.5731, -7.5898], Marrakech:  [31.6295, -7.9811],
  Rabat:      [34.0209, -6.8416], Agadir:     [30.4202, -9.5982],
  'Fès':      [34.0181, -5.0078], Tanger:     [35.7595, -5.8340],
  Essaouira:  [31.5085, -9.7595], 'Kénitra':  [34.2610, -6.5802],
  'Meknès':   [33.8935, -5.5473], Oujda:      [34.6867, -1.9114],
  'Tétouan':  [35.5785, -5.3684], Dakhla:     [23.7136, -15.9355],
  Bouznika:   [33.7917, -7.1589], Ifrane:     [33.5228, -5.1097],
  'El Jadida':[33.2316, -8.5007], 'Ben Guerir':[32.2352, -7.9560],
};

function geoHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) & 0x7fffffff;
  return h;
}
function eventCoords(title, city) {
  const base = CITY_COORDS[city] || [31.7917, -7.0926];
  const h    = geoHash(title);
  return [
    +( base[0] + ((h & 0x3fff) / 0x3fff - 0.5) * 0.05 ).toFixed(6),
    +( base[1] + (((h >> 14) & 0x3fff) / 0x3fff - 0.5) * 0.05 ).toFixed(6),
  ];
}

async function seedDatabase() {

  await upsertUniversities();

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@billetterie.ma']);
  if (existing.rowCount > 0) return;

  console.log('[DB] Initialisation des données de démo...');

  const uniRows = await pool.query(
    `SELECT id, short_name FROM universities WHERE short_name = ANY($1)`,
    [['UM5', 'UH2C', 'UCA', 'USMBA', 'UIT', 'UIZ', 'UAE', 'UMI', 'UH1', 'UM1', 'EMI', 'ENSIAS', 'INPT', 'HEM', 'ISCAE']],
  );
  const uniMap = Object.fromEntries(uniRows.rows.map(u => [u.short_name, u.id]));

  const adminId = uuidv4();
  await pool.query(`
    INSERT INTO users (id, name, email, password, role)
    VALUES ($1, $2, $3, $4, $5)
  `, [adminId, 'Admin Fayas', 'admin@billetterie.ma', await bcrypt.hash('Admin123!', 10), 'admin']);

  /* ── Images par catégorie / événement ── */
  const IMG = {
    concert:      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
    festival:     'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
    soiree:       'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    gala:         'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    universite:   'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
    rooftop:      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    gnawa:        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    beach:        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    // Tidar.ma réels
    moga_ess:     'https://tidar.ma/uploads/1778759182.png',
    santablanca:  'https://tidar.ma/uploads/1779724667.png',
    gate_bouznika:'https://tidar.ma/uploads/1779713184.png',
    superjazzy:   'https://tidar.ma/uploads/1777980600.jpg',
    alex_leone:   'https://tidar.ma/uploads/1776862960.png',
    echo7000:     'https://tidar.ma/uploads/1777640840.png',
    backtohouse:  'https://tidar.ma/uploads/1779480780.jpg',
    xtravaganza:  'https://tidar.ma/uploads/1779733241.png',
    velocity:     'https://tidar.ma/uploads/1779189249.png',
    darna:        'https://tidar.ma/uploads/1778238231.png',
  };

  /*
   * Format : [title, type, uni_id, venue, city, date, time,
   *           std_price, vip_price, capacity, tickets_sold,
   *           description, dress_code, img_key]
   */
  const events = [

    /* ═══════════════ CASABLANCA ═══════════════ */
    [
      'Gala de Luxe Casablanca — Fayas Edition',
      'gala', null,
      'Four Seasons Hotel Casablanca', 'Casablanca',
      '2026-06-15', '20:00', 500, 1200, 300, 87,
      "Une soirée d'exception orchestrée par Fayas dans l'écrin du Four Seasons. Dîner gastronomique, DJ set exclusif et vue imprenable sur l'Atlantique. Le rendez-vous glamour de l'été casablancais.",
      'Black tie', 'gala',
    ],
    [
      'UNFREQ × FAYAS — Club Edition',
      'concert', null,
      'Mano Club Casablanca', 'Casablanca',
      '2026-05-31', '22:00', 150, 350, 600, 280,
      "Fayas s'associe à UNFREQ pour une nuit électronique mémorable au Mano Club. Techno, progressive house et sets back-to-back jusqu'à l'aube. L'expérience sonore ultime à Casablanca.",
      'Street chic', 'concert',
    ],
    [
      'GAÏA × FAYAS — Sunset Party Ain Diab',
      'soiree', null,
      'La Corniche — Ain Diab', 'Casablanca',
      '2026-06-26', '19:30', 200, 500, 400, 163,
      "Le coucher de soleil sur l'Atlantique comme toile de fond. Fayas présente GAÏA, une soirée sunset loungeuse où electronic groove et cocktails signature se mêlent à la brise marine de Ain Diab.",
      'Beach chic', 'rooftop',
    ],
    [
      'OLD SCHOOL R&B BRUNCH × FAYAS',
      'soiree', null,
      'Four Seasons Hotel Casablanca', 'Casablanca',
      '2026-07-04', '13:00', 250, 600, 200, 88,
      "Fayas réinvente le brunch dominical : soul food, cocktails tropicaux et les plus grands classiques R&B des années 90-2000. Une expérience sensorielle unique en son genre à Casablanca.",
      'Smart casual', 'rooftop',
    ],
    [
      'Gala de Fin d\'Année UH2C × FAYAS',
      'universite', uniMap['UH2C'],
      'Sofitel Casablanca Tour Blanche', 'Casablanca',
      '2026-07-05', '19:00', 200, 450, 400, 178,
      "La soirée de fin d'année la plus attendue de l'Université Hassan II. Fayas et l'UH2C s'associent pour une cérémonie mémorable : remises de diplômes, dîner de gala et concert exclusif.",
      'Smart casual', 'universite',
    ],
    [
      'NEON NIGHTS CASA — Fayas Rave',
      'concert', null,
      'Sofitel CFC Casablanca', 'Casablanca',
      '2026-07-18', '22:00', 180, 420, 500, 201,
      "Fayas illumine Casablanca : une rave exclusive en mode néon dans le cadre futuriste du CFC. Performances live, mapping vidéo et lineup international pour une nuit que vous n'oublierez pas.",
      'Neon dress code', 'concert',
    ],

    /* ═══════════════ MARRAKECH ═══════════════ */
    [
      'Soirée des Étoiles — Fayas × La Mamounia',
      'soiree', null,
      'La Mamounia Marrakech', 'Marrakech',
      '2026-05-30', '21:00', 300, 700, 200, 145,
      "Fayas vous convie à la soirée la plus exclusive de Marrakech, dans les jardins légendaires de La Mamounia. Cocktails de prestige, DJ set ambient et une vue sur l'Atlas sous les étoiles.",
      'Cocktail chic', 'soiree',
    ],
    [
      'Nuit Blanche — Fayas au Palais El Badi',
      'soiree', null,
      'Palais El Badi Marrakech', 'Marrakech',
      '2026-06-10', '21:30', 350, 800, 300, 98,
      "Fayas transforme les ruines du Palais El Badi en scène d'art et de musique. Une nuit entière dédiée à la danse, à la culture et à la créativité — la Nuit Blanche façon Fayas.",
      'Blanc total', 'festival',
    ],
    [
      'ATLAS SOUND × FAYAS — Leone Sessions',
      'concert', null,
      'Nikki Beach Marrakech', 'Marrakech',
      '2026-06-06', '22:00', 250, 600, 800, 345,
      "Fayas s'invite au Nikki Beach pour une nuit électronique de haute volée. Atlas Sound réunit les meilleurs DJs du circuit underground marocain pour un set marathon face aux montagnes de l'Atlas.",
      'Club chic', 'concert',
    ],
    [
      'HUSH HUSH × FAYAS — Palais Night',
      'soiree', null,
      'Palais Jad Mahal Marrakech', 'Marrakech',
      '2026-06-13', '22:30', 300, 700, 400, 178,
      "Le secret est de mise : HUSH HUSH by Fayas investit le Palais Jad Mahal pour une soirée orientale envoûtante. Performances de danse, décors somptueux et musique entre Orient et Occident.",
      'Oriental chic', 'soiree',
    ],
    [
      'DREAMERS — Soul Awakening × FAYAS',
      'concert', null,
      'Fellah Hotel Marrakech', 'Marrakech',
      '2026-07-10', '20:00', 280, 650, 500, 220,
      "Fayas présente DREAMERS, un festival artistique immersif au cœur du Fellah Hotel. Art contemporain, musique live, yoga et performances de danse fusionnent en une expérience soul unique.",
      'Free spirit', 'festival',
    ],
    [
      'GALA DES ATLANTES × FAYAS',
      'gala', null,
      'Palais Namaskar Marrakech', 'Marrakech',
      '2026-07-17', '19:30', 700, 1600, 200, 72,
      "Fayas présente le gala le plus prestigious de l'été : le Gala des Atlantes au Palais Namaskar. Une célébration fastueuse de l'élégance marocaine avec dîner signature et spectacle vivant.",
      'Black tie', 'gala',
    ],
    [
      'SuperJazzy × FAYAS — Mādero Sessions',
      'soiree', null,
      'Mādero Marrakech', 'Marrakech',
      '2026-07-24', '21:00', 200, 500, 350, 140,
      "Fayas et Mādero s'associent pour une soirée jazz-fusion et house au cœur de la palmeraie. SuperJazzy orchestre une programmation unique mêlant saxophone live, beats modernes et ambiance chill.",
      'Jazz casual', 'soiree',
    ],
    [
      'Soirée Étudiante UCA × FAYAS 2026',
      'universite', uniMap['UCA'],
      'Club Atlas Asni Marrakech', 'Marrakech',
      '2026-06-28', '22:00', 100, 200, 600, 320,
      "La soirée étudiante de référence à Marrakech. Fayas et l'Université Cadi Ayyad réunissent les étudiants pour une nuit de fête inoubliable au Club Atlas, avec DJ set, photo booth et after-party.",
      'Smart casual', 'universite',
    ],

    /* ═══════════════ RABAT ═══════════════ */
    [
      'Soirée Annuelle UM5 × FAYAS',
      'universite', uniMap['UM5'],
      'Salle des Fêtes Atlas Rabat', 'Rabat',
      '2026-06-20', '20:30', 120, 250, 500, 210,
      "Fayas s'associe à l'Université Mohammed V pour la soirée annuelle la plus mémorable. Gala étudiant, cérémonie de distinction et DJ set dans la splendide Salle des Fêtes Atlas de Rabat.",
      'Smart casual', 'universite',
    ],
    [
      'Gala Élégance × FAYAS — Rabat',
      'gala', null,
      'Sofitel Rabat Jardin des Roses', 'Rabat',
      '2026-07-12', '19:30', 600, 1500, 250, 62,
      "Dans les jardins enchanteurs du Sofitel Rabat, Fayas orchestre le Gala Élégance : une soirée de prestige alliant gastronomie française et marocaine, musique classique et DJ set de minuit.",
      'Black tie', 'gala',
    ],
    [
      'ECHO × FAYAS — Oudayas Riverside',
      'concert', null,
      'Les Oudayas Rabat', 'Rabat',
      '2026-06-27', '21:00', 200, 500, 800, 310,
      "Fayas investit les remparts des Oudayas pour ECHO, une nuit musicale suspendue entre ciel et Atlantique. Deep house, afro-house et techno se mêlent au son des vagues en contrebas.",
      'Urban chic', 'concert',
    ],
    [
      'JAZZ & ROSES × FAYAS — Sofitel Rabat',
      'soiree', null,
      'Sofitel Rabat Jardin des Roses', 'Rabat',
      '2026-08-07', '20:00', 300, 700, 250, 95,
      "Fayas transforme le jardin de roses du Sofitel en scène jazz. Quartet live, cuisine fine et cocktails floraux pour une soirée romantique et raffinée au cœur de la capitale du Royaume.",
      'Floral chic', 'soiree',
    ],
    [
      'Nuit des Grandes Écoles EMI × FAYAS',
      'universite', uniMap['EMI'],
      'Sofitel Rabat Jardin des Roses', 'Rabat',
      '2026-07-03', '20:00', 180, 380, 500, 195,
      "Fayas et l'EMI célèbrent l'excellence des ingénieurs marocains. Une soirée gala réunissant étudiants, alumni et professeurs pour une nuit de networking, de distinction et de fête.",
      'Smart casual', 'universite',
    ],

    /* ═══════════════ AGADIR / TAGHAZOUT ═══════════════ */
    [
      'XTRAVAGANZA × FAYAS — Taghazout Bay',
      'concert', null,
      'Radisson Blu Taghazout Bay', 'Agadir',
      '2026-06-05', '20:00', 400, 900, 1500, 630,
      "Le festival électronique de référence au Maroc fait son grand retour avec Fayas. XTRAVAGANZA réunit sur la plage de Taghazout les meilleurs DJs internationaux pour 2 jours de fête face à l'océan.",
      'Festival look', 'festival',
    ],
    [
      'LE COMPTOIR ELECTRONIK × FAYAS',
      'concert', null,
      'LBO Agadir Beach Club', 'Agadir',
      '2026-06-19', '22:00', 180, 420, 600, 240,
      "Fayas apporte l'esprit Comptoir Électronik sur la côte souss. Une nuit de minimal techno et electronic groove dans le cadre unique du LBO Beach Club, les pieds dans le sable.",
      'Club chic', 'concert',
    ],
    [
      'COASTAL GROOVES × FAYAS — Agadir',
      'soiree', null,
      'Sofitel Agadir Royal Bay', 'Agadir',
      '2026-07-25', '20:30', 220, 550, 500, 198,
      "Fayas et le Sofitel Royal Bay vous invitent à une soirée beach-chic face à l'Atlantique. Musique lounge, buffet de fruits de mer et cocktails exotiques pour l'expérience côtière ultime de l'été.",
      'Beach chic', 'beach',
    ],

    /* ═══════════════ TANGER ═══════════════ */
    [
      'VELOCITY FEST × FAYAS — Tanger Bay',
      'concert', null,
      'Marina Bay Tanger', 'Tanger',
      '2026-07-25', '20:00', 300, 700, 1500, 520,
      "Fayas fait escale à Tanger pour VELOCITY FEST, le festival qui fusionne techno, drum & bass et afrobeats sur les quais de la Marina. Lineup international, scènes multiples et camping VIP.",
      'Festival look', 'festival',
    ],
    [
      'Soirée Chic du Nord × FAYAS',
      'soiree', null,
      'Hilton Tanger City Center', 'Tanger',
      '2026-07-17', '21:30', 280, 650, 300, 112,
      "Fayas présente la soirée mondaine de l'été tangerois. Ambiance méditerranéenne, musique lounge et cocktails signature au sommet du Hilton avec une vue panoramique sur le Détroit de Gibraltar.",
      'Cocktail chic', 'soiree',
    ],

    /* ═══════════════ ESSAOUIRA ═══════════════ */
    [
      'LUMINA FESTIVAL × FAYAS 2026',
      'concert', null,
      'Plage d\'Essaouira — Bord de mer', 'Essaouira',
      '2026-10-01', '17:00', 350, 800, 2500, 0,
      "Fayas lance LUMINA, le nouveau festival de référence à Essaouira. 4 jours de musique électronique, world music et performances artistiques sur la plage atlantique balayée par les alizés.",
      'Festival look', 'festival',
    ],
    [
      'GNAWA BLUES NIGHT × FAYAS',
      'concert', null,
      'Place Moulay Hassan Essaouira', 'Essaouira',
      '2026-08-01', '21:00', 150, 350, 1000, 380,
      "Fayas célèbre l'âme d'Essaouira : une nuit de Gnawa fusionné avec jazz et blues sur la mythique Place Moulay Hassan. Maâlems reconnus, musiciens internationaux et trance collective.",
      'Free spirit', 'gnawa',
    ],

    /* ═══════════════ FÈS ═══════════════ */
    [
      'Arabian Nights × FAYAS — Fès Médina',
      'soiree', null,
      'Riad Fès by Amanjenaee', 'Fès',
      '2026-07-18', '20:30', 350, 800, 150, 58,
      "Fayas vous transporte dans les Mille et Une Nuits : dîner marocain gastronomique dans le palais d'un riad fassi, musique andalouse live et hammam privatif pour les guests VIP.",
      'Oriental chic', 'soiree',
    ],
    [
      'GALA FASSI × FAYAS 2026',
      'gala', null,
      'Palais Faraj Fès', 'Fès',
      '2026-08-07', '19:00', 500, 1200, 150, 0,
      "Fayas sublime Fès la nuit : le Gala Fassi réunit l'élite du Maroc dans les décors mauresque du Palais Faraj. Dîner de prestige, fantasia et orchestre andalou pour une soirée hors du temps.",
      'Black tie', 'gala',
    ],
    [
      'Nuit des Grandes Écoles USMBA × FAYAS',
      'universite', uniMap['USMBA'],
      'Sofitel Fès Palais Jamai', 'Fès',
      '2026-06-21', '20:00', 150, 300, 500, 187,
      "Fayas et l'Université Sidi Mohammed Ben Abdellah célèbrent l'excellence académique. Cérémonie de remise de prix, dîner de gala et soirée dansante dans le cadre prestigieux du Palais Jamai.",
      'Smart casual', 'universite',
    ],

    /* ═══════════════ KÉNITRA ═══════════════ */
    [
      'Soirée Étudiante UIT × FAYAS',
      'universite', uniMap['UIT'],
      'Club Nautique de Kénitra', 'Kénitra',
      '2026-06-14', '21:00', 80, 160, 400, 165,
      "Fayas s'invite à l'Ibn Tofail pour la soirée étudiante de fin d'année. Ambiance festive, DJ set et concours de danse sur les rives du Bou Regreg pour clôturer l'année universitaire en beauté.",
      'Smart casual', 'universite',
    ],
    [
      'RIVERSIDE SOUNDS × FAYAS — Kénitra',
      'concert', null,
      'Plage Mehdya Kénitra', 'Kénitra',
      '2026-07-11', '20:00', 150, 350, 600, 210,
      "Fayas découvre Kénitra : RIVERSIDE SOUNDS investit la plage sauvage de Mehdya pour une nuit de house, afrobeats et fusion marocaine face à l'Atlantique. Un nouveau rendez-vous estival né par Fayas.",
      'Beach casual', 'beach',
    ],

    /* ═══════════════ MEKNÈS ═══════════════ */
    [
      'Soirée Annuelle UMI × FAYAS',
      'universite', uniMap['UMI'],
      'Hôtel Transatlantique Meknès', 'Meknès',
      '2026-06-26', '20:00', 100, 200, 350, 142,
      "Fayas et l'Université Moulay Ismail réunissent les étudiants de Meknès pour la soirée annuelle. DJ set, photo booth Fayas, buffet marocain et remise de prix pour clôturer l'année avec panache.",
      'Smart casual', 'universite',
    ],
    [
      'GALA ISMAILI × FAYAS — Meknès',
      'gala', null,
      'Palais Bassatine Meknès', 'Meknès',
      '2026-07-31', '19:30', 400, 900, 200, 0,
      "Fayas met à l'honneur la ville des Ismaïls : un gala de prestige dans le Palais Bassatine avec dîner impérial, fantasia et orchestre andalou. Une ode à la grandeur historique de Meknès.",
      'Black tie', 'gala',
    ],

    /* ═══════════════ OUJDA ═══════════════ */
    [
      'ORIENTAL GROOVE × FAYAS — Oujda',
      'concert', null,
      'Complexe Culturel Mohammed VI Oujda', 'Oujda',
      '2026-08-14', '21:00', 150, 350, 800, 0,
      "Fayas traverse le pays pour ORIENTAL GROOVE, une nuit musicale exclusive à Oujda mêlant raï moderne, chaabi électronique et beats orientaux. Le rendez-vous estival du nord-est marocain.",
      'Urban chic', 'concert',
    ],
    [
      'Soirée UM1 × FAYAS 2026',
      'universite', uniMap['UM1'],
      'Hôtel Al Manar Oujda', 'Oujda',
      '2026-07-03', '20:00', 80, 160, 350, 118,
      "La grande soirée de fin d'année de l'Université Mohammed 1er, organisée avec Fayas. Ambiance conviviale, DJ set, and a night full of memories at the gateway to eastern Morocco.",
      'Smart casual', 'universite',
    ],

    /* ═══════════════ AGADIR — UIZ ═══════════════ */
    [
      'Gala Ibn Zohr × FAYAS 2026',
      'universite', uniMap['UIZ'],
      'Sofitel Agadir Thalassa', 'Agadir',
      '2026-07-09', '19:30', 150, 300, 450, 162,
      "Fayas et l'Université Ibn Zohr s'unissent pour le Gala de fin d'année le plus ensoleillé du Maroc. Vue sur l'Atlantique, dîner gastronomique et DJ set face aux palmiers d'Agadir.",
      'Smart casual', 'universite',
    ],

    /* ═══════════════ TÉTOUAN — UAE ═══════════════ */
    [
      'Soirée Étudiante UAE × FAYAS',
      'universite', uniMap['UAE'],
      'Club Méditerranée Tétouan', 'Tétouan',
      '2026-06-19', '21:00', 80, 160, 400, 148,
      "Fayas et l'Université Abdelmalek Essaâdi célèbrent la fin d'année entre deux rives : soirée méditerranéenne sur fond de musique andalouse et électro, avec la mer comme horizon.",
      'Smart casual', 'universite',
    ],
  ];

  /* ── Événements supplémentaires Tidar.ma + Fayas ── */
  const tidarExtra = [
    /* ── Tidar.ma réels ── */
    ['SANTABLANCA — Fan Zone & Club','soiree',null,'Gaia Beach Casablanca','Casablanca','2026-06-13','16:00',200,450,800,312,"Fan zone géante Maroc vs Brésil : giant screen, DJ sets house jusqu'à 4h, food & drinks et ambiance beach sunset.",'Beach chic','santablanca'],
    ['GATE TO BOUZNIKA','soiree',null,'Eden Island Beach Club','Bouznika','2026-06-21','17:00',150,300,600,195,"Sunset celebration face à l'Atlantique : Afro House, Latin House, ocean vibes. Headliner : OMED.",'Well dressed','gate_bouznika'],
    ['SUPERJAZZY × MĀDERO — Marrakech','concert',null,'Villa Marco Au jardin des senteurs','Marrakech','2026-06-05','22:00',350,800,500,267,"22h de musique non-stop par Tania Vulcano et 12 artistes internationaux. Son Funktion-One, pool vibes.",'Festival chic','superjazzy'],
    ['ALEX WANN @ LEONE — Marrakech','concert',null,'LEONE Marrakech','Marrakech','2026-05-29','22:00',250,600,400,180,"Alex Wann investit le LEONE pour une nuit électronique de prestige. Sets profonds, basses puissantes.",'Club chic','alex_leone'],
    ['ECHO7000 × BURN ENERGY TOUR 2026','concert',null,'TBA Marrakech','Marrakech','2026-06-27','21:00',200,500,1000,0,"Le Burn Energy Tour fait escale à Marrakech avec ECHO7000. Énergie maximale et production scénique massive.",'Urban chic','echo7000'],
    ['BACK TO HOUSE — Underground Vol. 02','concert',null,'Venue secrète — Marrakech','Marrakech','2026-07-18','22:00',180,420,600,240,"La série underground continue. Vol. 02 plonge dans les racines de la house, son Funktion-One, capacité limitée.",'All black','backtohouse'],
    ['DARNA I — Roots of Detroit','concert',null,'Lieu à révéler — Marrakech','Marrakech','2026-06-13','22:00',220,500,400,160,"Darna célèbre les racines de la techno de Detroit. Nuit immersive, programmation pointue.",'All black','darna'],
    ['MOGA ESSAOUIRA 2026','festival',null,"Hôtel Le Golf d'Essaouira & Spa",'Essaouira','2026-09-30','15:00',800,2000,2500,0,"Le festival boutique électronique d'Essaouira fête ses 10 ans. Lineup : Jamie Jones, The Martinez Brothers, Rhadoo.",'Come as you are','moga_ess'],
    ['XTRAVAGANZA — Taghazout Bay','festival',null,'Radisson Blu Resort Taghazout Bay','Agadir','2026-06-05','20:00',400,900,1500,630,"Festival immersif : eau, terre, air, feu. Lineup : Andrea Oliva, Joris Delacroix, Joachim Pastor, Caiiro.",'Costume élémentaire','xtravaganza'],
    ['VELOCITY FEST — Tanger','festival',null,'Bord de mer — Tanger','Tanger','2026-07-25','12:00',300,700,1500,520,"Revival de Made in Velocity avec un concept entièrement nouveau. Musique, activités et expériences au-delà de la piste.",'Come as you are','velocity'],
    /* ── Nouvelles soirées Tidar.ma ── */
    ['CHROME — Electronic Night Rabat','soiree',null,'Sofitel Rabat Jardin des Roses','Rabat','2026-07-04','23:00',180,400,500,215,"Chrome débarque à Rabat : techno minimale et ambient sombre. Son Funktion-One, capacité strictement limitée.",'All black / Chrome','rooftop'],
    ['SOLSTICE — Midsummer Party Casa','soiree',null,'La Sqala Casablanca','Casablanca','2026-06-21','21:00',200,500,600,310,"La nuit la plus longue de l'année célébrée sur les remparts de La Sqala. DJs, artistes et fêtards pour une nuit inoubliable.",'Festival chic','soiree'],
    ['JUNGLE TRIBE — Pool & Dance','soiree',null,'Kenzi Tower Hotel Casablanca','Casablanca','2026-07-12','18:00',220,500,400,178,"Pool party tropicale : décors jungle, afro-house et sets continus 18h-4h. Le rendez-vous estival de Casa.",'Tropical / Couleurs vives','rooftop'],
    ['LUNA BLANCA — Soirée Tanger','soiree',null,'El Minzah Hotel Tanger','Tanger','2026-07-19','22:00',250,600,350,142,"Face au Détroit, Luna Blanca transforme la terrasse El Minzah en dancefloor. White dress code, deep house & chaâbi électronique.",'All white','soiree'],
    ['UNDERGROUND SESSION 02 — Casa','concert',null,'Venue secrète — Casablanca','Casablanca','2026-07-25','23:00',150,350,300,188,"Le deuxième volet underground. Adresse révélée 24h avant. Lineup surprise, son impeccable, pas de téléphone sur la piste.",'All black','concert'],
    ['SUNRISE — Dawn Party Agadir','festival',null,'Sofitel Agadir Thalassa Sea & Spa','Agadir','2026-08-08','04:00',180,400,600,95,"Dansez jusqu'au lever du soleil face à l'Atlantique. Beats organiques et brunch au soleil levant.",'Beach white','beach'],
    ['DEEP SUNDAYS — Ain Diab Casa','soiree',null,'Cabaret Sauvage Casa Marina','Casablanca','2026-08-02','17:00',160,380,450,207,"Les dimanches deep house d'été. Les meilleurs sélecteurs du Maroc face à l'Atlantique.",'Smart casual','soiree'],
    ['MYSTIC FES — Palais des Arts','soiree',null,'Palais Batha Fès','Fès','2026-08-14','21:30',300,700,400,124,"Électronique organique, musique andalouse et installations lumineuses dans les cours du Batha.",'Oriental chic','soiree'],
    ['PARADISE POOL — Marrakech','soiree',null,'Fellah Hotel Marrakech','Marrakech','2026-08-01','17:00',250,600,500,263,"Le meilleur pool party de Marrakech : dancefloor flottant et DJ sets continus 17h-4h.",'Swimwear / Club chic','soiree'],
    ['AFTER HOURS — Late Night Casa','concert',null,'NINE Casablanca','Casablanca','2026-08-22','01:00',120,280,250,180,"Quand la nuit devient profonde. Sets marathons jusqu'au petit matin, underground at its finest.",'All black','concert'],
    ['NEON JUNGLE — Soirée Fluo Rabat','soiree',null,'Hôtel Golden Tulip Farah Rabat','Rabat','2026-07-31','22:00',140,320,400,156,"Corps illuminés et musique électronique colorée. Maquillage UV fourni à l'entrée.",'Neon / Fluo obligatoire','rooftop'],
    ['OASIS — Desert Rave Agadir','festival',null,'Plage des Dunes — Sidi Kaouki','Agadir','2026-09-05','20:00',350,800,1200,0,"Rave en plein air entre dunes et Atlantique. Lineup international, scènes multiples, camping disponible.",'Festival look','beach'],
    ['ELECTRIC MARRAKECH — Summer Edition','concert',null,'Nikki Beach Marrakech','Marrakech','2026-07-05','22:00',280,650,700,312,"Cinq DJs internationaux pour une nuit de techno mélodique et progressive house au Nikki Beach.",'Club chic','concert'],
    ['CASA GROOVE — R&B & Afrobeats Night','soiree',null,'Mazagan Beach & Golf Resort','Casablanca','2026-06-28','21:00',200,480,600,278,"La meilleure playlist R&B et Afrobeats du Maroc dans un cadre de rêve. Burna Boy, Wizkid, Summer Walker.",'Smart casual','soiree'],
    /* ── Galas & soirées premium supplémentaires ── */
    ['PRESTIGE GALA × FAYAS — Royal Palm','gala',null,'Fairmont Royal Palm Casablanca','Casablanca','2026-09-05','19:30',900,2200,120,18,"Le gala le plus exclusif de la saison : dîner étoilé, DJ résidence internationale et cabaret de luxe.",'Black tie','gala'],
    ['ROOFTOP SESSION × FAYAS — Marina','soiree',null,'Anfa Place Marina Casablanca','Casablanca','2026-06-21','20:30',180,450,350,127,"Sur les toits de la Marina, vue sur l'Atlantique et la Mosquée Hassan II.",'Smart chic','rooftop'],
    ['GOLDEN HOUR × FAYAS — Atlas View','gala',null,'Palais Namaskar Marrakech','Marrakech','2026-10-10','18:00',800,2000,150,0,"Golden hour sur l'Atlas depuis les terrasses du Namaskar. Haute gastronomie et DJ set sunset.",'Cocktail chic','gala'],
    ['MYSTIC NIGHT × FAYAS — Marrakech','soiree',null,'Café Bô Zin Marrakech','Marrakech','2026-07-31','21:30',200,500,400,156,"Jardins de Marrakech en scène mystique. Art de lumière et musique électronique orientale.",'Oriental chic','soiree'],
    ['MIDNIGHT OASIS × FAYAS — Dakhla','soiree',null,'Dakhla Attitude Kite Camp','Dakhla','2026-08-15','21:00',300,700,200,42,"Soirée hors du commun face au lagon de Dakhla. Électronique, ciel étoilé et Atlantique à pied.",'Bohème chic','beach'],
    ['SANDSTORM × FAYAS — Dakhla Festival','festival',null,'Plage Foum El Bour Dakhla','Dakhla','2026-09-12','18:00',250,600,1000,185,"Le premier festival électronique du Sahara atlantique. Fayas réunit les meilleures têtes d'affiche sur la langue de sable.",'Festival look','festival'],
  ];

  for (const e of [...events, ...tidarExtra]) {
    const [
      title, type, uniId, venue, city, date, time,
      stdPrice, vipPrice, capacity, ticketsSold,
      description, dressCode, imgKey,
    ] = e;

    const [lat, lng] = eventCoords(title, city);

    await pool.query(`
      INSERT INTO events (
        id, title, description, type, university_id, venue, city, date, time,
        price_standard, price_vip, capacity, tickets_sold, dress_code, image_url,
        lat, lng, status, organizer_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'published',$18)
      ON CONFLICT DO NOTHING
    `, [
      uuidv4(), title, description, type, uniId || null, venue, city, date, time,
      stdPrice, vipPrice, capacity, ticketsSold, dressCode,
      IMG[imgKey] || IMG.soiree,
      lat, lng,
      adminId,
    ]);
  }

  console.log(`[DB] Seed: ${ALL_UNIVERSITIES.length} universités, ${events.length + tidarExtra.length} événements, 1 admin`);
}

async function init() {
  if (!initPromise) {
    initPromise = (async () => {
      await initSchema();
      await seedDatabase();
    })();
  }
  return initPromise;
}

initPromise = init();

module.exports = {
  pool,
  init,
  query,
  many,
  one,
  run,
  transaction,
};
