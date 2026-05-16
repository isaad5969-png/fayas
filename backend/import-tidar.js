const { v4: uuidv4 } = require('uuid');
const db = require('./db/database');

const tidarEvents = [
  {
    title: 'SIMON J & ALEXIA @ LEONE',
    description: 'Une nuit électronique exclusive au club LEONE avec Simon J & Alexia aux platines.',
    type: 'soiree',
    venue: 'LEONE Club',
    city: 'Marrakech',
    date: '2026-05-09',
    time: '23:00',
    price_standard: 200,
    price_vip: 500,
    capacity: 350,
    tickets_sold: 210,
    dress_code: 'Smart casual',
    image_url: 'https://tidar.ma/uploads/1777935884.png',
  },
  {
    title: 'DJ RUN with ODDITY - Tanger',
    description: 'DJ RUN s’associe à ODDITY pour une soirée électronique inédite à Tanger.',
    type: 'concert',
    venue: 'Venue TBA - Tanger',
    city: 'Tanger',
    date: '2026-05-10',
    time: '22:00',
    price_standard: 150,
    price_vip: 350,
    capacity: 400,
    tickets_sold: 180,
    dress_code: 'Smart casual',
    image_url: 'https://tidar.ma/uploads/1777298519.png',
  },
];

async function main() {
  await db.init();

  const admin = await db.one("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (!admin) throw new Error('Admin introuvable. Lancez le serveur pour initialiser la base.');

  for (const event of tidarEvents) {
    const exists = await db.one('SELECT id FROM events WHERE title = $1 AND date = $2', [event.title, event.date]);
    if (exists) continue;

    await db.run(`
      INSERT INTO events (
        id, title, description, type, university_id, venue, city, date, time,
        price_standard, price_vip, capacity, tickets_sold, dress_code, image_url, status, organizer_id
      )
      VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'published', $15)
    `, [
      uuidv4(), event.title, event.description, event.type, event.venue, event.city,
      event.date, event.time, event.price_standard, event.price_vip, event.capacity,
      event.tickets_sold, event.dress_code, event.image_url, admin.id,
    ]);
  }

  const total = await db.one('SELECT COUNT(*)::int as c FROM events');
  console.log(`Total événements en base: ${total.c}`);
  await db.pool.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
