require('../config/env')();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[DB] DATABASE_URL is not set. Configure a PostgreSQL connection string before starting the API.');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

let initPromise;

async function query(sql, params = []) {
  if (!connectionString) {
    throw new Error('DATABASE_URL manquant. Configurez une base PostgreSQL.');
  }
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
  if (!connectionString) {
    throw new Error('DATABASE_URL manquant. Configurez une base PostgreSQL.');
  }

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
  if (!connectionString) return;

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
        image_url   TEXT
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
    `);

    /* ── add updated_at to pre-existing tables gracefully ── */
    await client.query(`
      ALTER TABLE events   ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE users    ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE tickets  ADD COLUMN IF NOT EXISTS payment_intent_id  TEXT;
    `);

    /* ── ensure unique constraint on short_name for upsert ── */
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'universities_short_name_key'
        ) THEN
          ALTER TABLE universities ADD CONSTRAINT universities_short_name_key UNIQUE (short_name);
        END IF;
      END $$;
    `);

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
  ['UM5',        'Université Mohammed V',                    'Rabat',       '#7C3AED', 85000],
  ['UH2C',       'Université Hassan II',                     'Casablanca',  '#DC2626', 120000],
  ['UCA',        'Université Cadi Ayyad',                    'Marrakech',   '#D97706', 95000],
  ['USMBA',      'Université Sidi Mohammed Ben Abdellah',    'Fès',         '#6D28D9', 80000],
  ['UIT',        'Université Ibn Tofail',                    'Kénitra',     '#059669', 45000],
  ['UIZ',        'Université Ibn Zohr',                      'Agadir',      '#0284C7', 60000],
  ['UAE',        'Université Abdelmalek Essaâdi',            'Tétouan',     '#BE185D', 55000],
  ['UMI',        'Université Moulay Ismail',                 'Meknès',      '#B45309', 40000],
  ['UH1',        'Université Hassan 1er',                    'Settat',      '#065F46', 35000],
  ['UM1',        'Université Mohammed 1er',                  'Oujda',       '#1D4ED8', 50000],
  ['UCD',        'Université Chouaib Doukkali',              'El Jadida',   '#0891B2', 30000],
  ['USMS',       'Université Sultan Moulay Slimane',         'Béni Mellal', '#7C2D8A', 35000],
  ['UAQ',        'Université Al Quaraouiyine',               'Fès',         '#92400E', 10000],
  /* ── Grandes Écoles & Instituts ── */
  ['EMI',        'École Mohammadia d\'Ingénieurs',           'Rabat',       '#1E40AF', 3000],
  ['ENSIAS',     'ENSIAS',                                   'Rabat',       '#4338CA', 1500],
  ['INPT',       'Institut National des P&T',                'Rabat',       '#0F766E', 2000],
  ['INSEA',      'INSEA',                                    'Rabat',       '#854D0E', 1200],
  ['EHTP',       'École Hassania des Travaux Publics',       'Casablanca',  '#9D174D', 1500],
  ['IAV',        'IAV Hassan II',                            'Rabat',       '#166534', 3000],
  ['ISCAE',      'ISCAE',                                    'Casablanca',  '#1E3A5F', 4000],
  ['HEM',        'HEM Business School',                      'Casablanca',  '#7E22CE', 8000],
  ['ENCG-CASA',  'ENCG Casablanca',                          'Casablanca',  '#0E4F8B', 3000],
  ['ENCG-FES',   'ENCG Fès',                                 'Fès',         '#3730A3', 2500],
  /* ── Universités Privées ── */
  ['UIR',        'Université Internationale de Rabat',       'Rabat',       '#0369A1', 8000],
  ['UM6P',       'Université Mohammed VI Polytechnique',     'Ben Guerir',  '#374151', 3000],
  ['UAA',        'Université Al Akhawayn',                   'Ifrane',      '#B91C1C', 2000],
  ['UIC',        'Université Internationale de Casablanca',  'Casablanca',  '#0E7490', 5000],
  ['UEMF',       'Université Euro-Méditerranéenne de Fès',   'Fès',         '#1A56DB', 3000],
  ['UPM',        'Université Privée de Marrakech',           'Marrakech',   '#C2410C', 4000],
  ['MUNDIAPOLIS','Université Mundiapolis',                    'Casablanca',  '#4B5563', 6000],
];

async function upsertUniversities() {
  if (!connectionString) return;
  for (const [shortName, name, city, color, studentCount] of ALL_UNIVERSITIES) {
    await pool.query(`
      INSERT INTO universities (id, name, short_name, city, color, student_count, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (short_name) DO UPDATE SET
        name          = EXCLUDED.name,
        city          = EXCLUDED.city,
        color         = EXCLUDED.color,
        student_count = EXCLUDED.student_count,
        description   = EXCLUDED.description
    `, [
      uuidv4(),
      name,
      shortName,
      city,
      color,
      studentCount,
      `${name} — établissement d'enseignement supérieur à ${city}.`,
    ]);
  }
  console.log(`[DB] ${ALL_UNIVERSITIES.length} universités marocaines synchronisées.`);
}

async function seedDatabase() {
  if (!connectionString) return;

  await upsertUniversities();

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@billetterie.ma']);
  if (existing.rowCount > 0) return;

  console.log('[DB] Initialisation des données de démo...');

  const universities = await pool.query(
    `SELECT id, short_name FROM universities WHERE short_name = ANY($1)`,
    [['UM5', 'UH2C', 'UCA']],
  );
  const uniMap = Object.fromEntries(universities.rows.map(u => [u.short_name, u.id]));

  const adminId = uuidv4();
  await pool.query(`
    INSERT INTO users (id, name, email, password, role)
    VALUES ($1, $2, $3, $4, $5)
  `, [adminId, 'Admin Billetterie', 'admin@billetterie.ma', await bcrypt.hash('Admin123!', 10), 'admin']);

  const events = [
    ['Gala de Luxe Casablanca 2026',     'gala',       null,              'Four Seasons Casablanca',        'Casablanca', '2026-06-15', '20:00', 500,  1200, 300,  87],
    ['Soirée des Étoiles - Marrakech',   'soiree',     null,              'La Mamounia',                    'Marrakech',  '2026-05-30', '21:00', 300,  700,  200,  145],
    ['Soirée Annuelle UM5 - Rabat',      'universite', uniMap['UM5'],     'Salle des Fêtes Atlas Rabat',    'Rabat',      '2026-06-20', '20:30', 120,  250,  500,  210],
    ['Gala de Fin d\'Année UH2C 2026',  'universite', uniMap['UH2C'],    'Sofitel Casablanca',              'Casablanca', '2026-07-05', '19:00', 200,  450,  400,  178],
    ['Nuit Blanche - Marrakech',         'soiree',     null,              'Palais El Badi',                 'Marrakech',  '2026-06-10', '21:30', 350,  800,  150,  98],
    ['Soirée Étudiante UCA',             'universite', uniMap['UCA'],     'Club Atlas Asni',                'Marrakech',  '2026-06-28', '22:00', 100,  200,  600,  320],
    ['Gala Élégance - Rabat',            'gala',       null,              'Sofitel Rabat Jardin des Roses', 'Rabat',      '2026-07-12', '19:30', 600,  1500, 250,  62],
    ['XTRAVAGANZA - Taghazout Festival', 'concert',    null,              'Radisson Blu Taghazout',         'Agadir',     '2026-06-05', '20:00', 400,  900,  1500, 630],
  ];

  for (const e of events) {
    await pool.query(`
      INSERT INTO events (
        id, title, description, type, university_id, venue, city, date, time,
        price_standard, price_vip, capacity, tickets_sold, dress_code, image_url, status, organizer_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'published',$16)
    `, [
      uuidv4(), e[0], `Réservez vos billets pour ${e[0]}.`, e[1], e[2], e[3], e[4],
      e[5], e[6], e[7], e[8], e[9], e[10], 'Smart casual',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      adminId,
    ]);
  }

  console.log(`[DB] Données de démo: ${ALL_UNIVERSITIES.length} universités, ${events.length} événements, 1 admin`);
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
