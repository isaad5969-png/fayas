/**
 * demo-server.js — Serveur Fayas en mode démo (aucune base de données requise)
 * Lance Express avec données in-memory générées depuis le seed.
 * Usage : node demo-server.js
 */
require('./config/env')();

const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-fayas-2026';

app.use(express.json());
app.use(cors({ origin: '*' }));

/* ─────────────────────────────────────────
   DONNÉES IN-MEMORY
───────────────────────────────────────── */

const IMG = {
  concert:    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
  festival:   'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
  soiree:     'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  gala:       'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
  universite: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
  rooftop:    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  gnawa:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  beach:      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
};

const UNIVERSITIES = [
  { id: uuidv4(), short_name: 'UM5',        name: 'Université Mohammed V',                    city: 'Rabat',       color: '#7C3AED', student_count: 85000  },
  { id: uuidv4(), short_name: 'UH2C',       name: 'Université Hassan II',                     city: 'Casablanca',  color: '#DC2626', student_count: 120000 },
  { id: uuidv4(), short_name: 'UCA',        name: 'Université Cadi Ayyad',                    city: 'Marrakech',   color: '#D97706', student_count: 95000  },
  { id: uuidv4(), short_name: 'USMBA',      name: 'Université Sidi Mohammed Ben Abdellah',    city: 'Fès',         color: '#6D28D9', student_count: 80000  },
  { id: uuidv4(), short_name: 'UIT',        name: 'Université Ibn Tofail',                    city: 'Kénitra',     color: '#059669', student_count: 45000  },
  { id: uuidv4(), short_name: 'UIZ',        name: 'Université Ibn Zohr',                      city: 'Agadir',      color: '#0284C7', student_count: 60000  },
  { id: uuidv4(), short_name: 'UAE',        name: 'Université Abdelmalek Essaâdi',            city: 'Tétouan',     color: '#BE185D', student_count: 55000  },
  { id: uuidv4(), short_name: 'UMI',        name: 'Université Moulay Ismail',                 city: 'Meknès',      color: '#B45309', student_count: 40000  },
  { id: uuidv4(), short_name: 'UH1',        name: 'Université Hassan 1er',                    city: 'Settat',      color: '#065F46', student_count: 35000  },
  { id: uuidv4(), short_name: 'UM1',        name: 'Université Mohammed 1er',                  city: 'Oujda',       color: '#1D4ED8', student_count: 50000  },
  { id: uuidv4(), short_name: 'UCD',        name: 'Université Chouaib Doukkali',              city: 'El Jadida',   color: '#0891B2', student_count: 30000  },
  { id: uuidv4(), short_name: 'USMS',       name: 'Université Sultan Moulay Slimane',         city: 'Béni Mellal', color: '#7C2D8A', student_count: 35000  },
  { id: uuidv4(), short_name: 'UAQ',        name: 'Université Al Quaraouiyine',               city: 'Fès',         color: '#92400E', student_count: 10000  },
  { id: uuidv4(), short_name: 'EMI',        name: "École Mohammadia d'Ingénieurs",            city: 'Rabat',       color: '#1E40AF', student_count: 3000   },
  { id: uuidv4(), short_name: 'ENSIAS',     name: 'ENSIAS',                                   city: 'Rabat',       color: '#4338CA', student_count: 1500   },
  { id: uuidv4(), short_name: 'INPT',       name: 'Institut National des P&T',               city: 'Rabat',       color: '#0F766E', student_count: 2000   },
  { id: uuidv4(), short_name: 'INSEA',      name: 'INSEA',                                   city: 'Rabat',       color: '#854D0E', student_count: 1200   },
  { id: uuidv4(), short_name: 'EHTP',       name: 'École Hassania des Travaux Publics',      city: 'Casablanca',  color: '#9D174D', student_count: 1500   },
  { id: uuidv4(), short_name: 'IAV',        name: 'IAV Hassan II',                           city: 'Rabat',       color: '#166534', student_count: 3000   },
  { id: uuidv4(), short_name: 'ISCAE',      name: 'ISCAE',                                   city: 'Casablanca',  color: '#1E3A5F', student_count: 4000   },
  { id: uuidv4(), short_name: 'HEM',        name: 'HEM Business School',                     city: 'Casablanca',  color: '#7E22CE', student_count: 8000   },
  { id: uuidv4(), short_name: 'ENCG-CASA',  name: 'ENCG Casablanca',                         city: 'Casablanca',  color: '#0E4F8B', student_count: 3000   },
  { id: uuidv4(), short_name: 'ENCG-FES',   name: 'ENCG Fès',                                city: 'Fès',         color: '#3730A3', student_count: 2500   },
  { id: uuidv4(), short_name: 'UIR',        name: 'Université Internationale de Rabat',      city: 'Rabat',       color: '#0369A1', student_count: 8000   },
  { id: uuidv4(), short_name: 'UM6P',       name: 'Université Mohammed VI Polytechnique',    city: 'Ben Guerir',  color: '#374151', student_count: 3000   },
  { id: uuidv4(), short_name: 'UAA',        name: 'Université Al Akhawayn',                  city: 'Ifrane',      color: '#B91C1C', student_count: 2000   },
  { id: uuidv4(), short_name: 'UIC',        name: 'Université Internationale de Casablanca', city: 'Casablanca',  color: '#0E7490', student_count: 5000   },
  { id: uuidv4(), short_name: 'UEMF',       name: 'Université Euro-Méditerranéenne de Fès',  city: 'Fès',         color: '#1A56DB', student_count: 3000   },
  { id: uuidv4(), short_name: 'UPM',        name: 'Université Privée de Marrakech',          city: 'Marrakech',   color: '#C2410C', student_count: 4000   },
  { id: uuidv4(), short_name: 'MUNDIAPOLIS',name: 'Université Mundiapolis',                  city: 'Casablanca',  color: '#4B5563', student_count: 6000   },
];

const uniMap = Object.fromEntries(UNIVERSITIES.map(u => [u.short_name, u]));

/* ── Génération des événements ── */
function makeEvent(title, type, uniShort, venue, city, date, time, std, vip, cap, sold, desc, dress, imgKey) {
  const uni = uniShort ? uniMap[uniShort] : null;
  return {
    id: uuidv4(), title, description: desc, type,
    university_id: uni?.id || null,
    university_name: uni?.name || null,
    university_short_name: uni?.short_name || null,
    university_color: uni?.color || null,
    venue, city, date, time,
    price_standard: std, price_vip: vip,
    capacity: cap, tickets_sold: sold,
    dress_code: dress,
    image_url: IMG[imgKey] || IMG.soiree,
    status: 'published',
    created_at: new Date().toISOString(),
  };
}

const EVENTS = [
  // ── CASABLANCA ──
  makeEvent('Gala de Luxe Casablanca — Fayas Edition','gala',null,'Four Seasons Hotel Casablanca','Casablanca','2026-06-15','20:00',500,1200,300,87,"Une soirée d'exception orchestrée par Fayas dans l'écrin du Four Seasons. Dîner gastronomique, DJ set exclusif et vue imprenable sur l'Atlantique.","Black tie",'gala'),
  makeEvent('UNFREQ × FAYAS — Club Edition','concert',null,'Mano Club Casablanca','Casablanca','2026-05-31','22:00',150,350,600,280,"Fayas s'associe à UNFREQ pour une nuit électronique mémorable au Mano Club. Techno, progressive house et sets back-to-back jusqu'à l'aube.","Street chic",'concert'),
  makeEvent("GAÏA × FAYAS — Sunset Party Ain Diab",'soiree',null,'La Corniche — Ain Diab','Casablanca','2026-06-26','19:30',200,500,400,163,"Le coucher de soleil sur l'Atlantique comme toile de fond. Fayas présente GAÏA, une soirée sunset loungeuse à Ain Diab.","Beach chic",'rooftop'),
  makeEvent('OLD SCHOOL R&B BRUNCH × FAYAS','soiree',null,'Four Seasons Hotel Casablanca','Casablanca','2026-07-04','13:00',250,600,200,88,"Fayas réinvente le brunch dominical : soul food, cocktails tropicaux et les plus grands classiques R&B des années 90-2000.","Smart casual",'rooftop'),
  makeEvent("Gala de Fin d'Année UH2C × FAYAS",'universite','UH2C','Sofitel Casablanca Tour Blanche','Casablanca','2026-07-05','19:00',200,450,400,178,"La soirée de fin d'année la plus attendue de l'Université Hassan II. Fayas et l'UH2C s'associent pour une cérémonie mémorable.","Smart casual",'universite'),
  makeEvent('NEON NIGHTS CASA — Fayas Rave','concert',null,'Sofitel CFC Casablanca','Casablanca','2026-07-18','22:00',180,420,500,201,"Fayas illumine Casablanca : une rave exclusive en mode néon dans le cadre futuriste du CFC. Performances live, mapping vidéo et lineup international.","Neon dress code",'concert'),
  // ── MARRAKECH ──
  makeEvent('Soirée des Étoiles — Fayas × La Mamounia','soiree',null,'La Mamounia Marrakech','Marrakech','2026-05-30','21:00',300,700,200,145,"Fayas vous convie à la soirée la plus exclusive de Marrakech dans les jardins légendaires de La Mamounia. Cocktails de prestige et DJ set ambient.","Cocktail chic",'soiree'),
  makeEvent('Nuit Blanche — Fayas au Palais El Badi','soiree',null,'Palais El Badi Marrakech','Marrakech','2026-06-10','21:30',350,800,300,98,"Fayas transforme les ruines du Palais El Badi en scène d'art et de musique. Une nuit entière dédiée à la danse, à la culture et à la créativité.","Blanc total",'festival'),
  makeEvent('ATLAS SOUND × FAYAS — Leone Sessions','concert',null,'Nikki Beach Marrakech','Marrakech','2026-06-06','22:00',250,600,800,345,"Fayas s'invite au Nikki Beach pour une nuit électronique de haute volée. Atlas Sound réunit les meilleurs DJs du circuit underground marocain.","Club chic",'concert'),
  makeEvent('HUSH HUSH × FAYAS — Palais Night','soiree',null,'Palais Jad Mahal Marrakech','Marrakech','2026-06-13','22:30',300,700,400,178,"Le secret est de mise : HUSH HUSH by Fayas investit le Palais Jad Mahal pour une soirée orientale envoûtante.","Oriental chic",'soiree'),
  makeEvent('DREAMERS — Soul Awakening × FAYAS','concert',null,'Fellah Hotel Marrakech','Marrakech','2026-07-10','20:00',280,650,500,220,"Fayas présente DREAMERS, un festival artistique immersif au cœur du Fellah Hotel. Art contemporain, musique live et performances de danse.","Free spirit",'festival'),
  makeEvent('GALA DES ATLANTES × FAYAS','gala',null,'Palais Namaskar Marrakech','Marrakech','2026-07-17','19:30',700,1600,200,72,"Fayas présente le gala le plus prestigious de l'été au Palais Namaskar. Une célébration fastueuse de l'élégance marocaine.","Black tie",'gala'),
  makeEvent('SuperJazzy × FAYAS — Mādero Sessions','soiree',null,'Mādero Marrakech','Marrakech','2026-07-24','21:00',200,500,350,140,"Fayas et Mādero s'associent pour une soirée jazz-fusion et house au cœur de la palmeraie.","Jazz casual",'soiree'),
  makeEvent('Soirée Étudiante UCA × FAYAS 2026','universite','UCA','Club Atlas Asni Marrakech','Marrakech','2026-06-28','22:00',100,200,600,320,"La soirée étudiante de référence à Marrakech. Fayas et l'UCA réunissent les étudiants pour une nuit de fête inoubliable.","Smart casual",'universite'),
  // ── RABAT ──
  makeEvent('Soirée Annuelle UM5 × FAYAS','universite','UM5','Salle des Fêtes Atlas Rabat','Rabat','2026-06-20','20:30',120,250,500,210,"Fayas s'associe à l'Université Mohammed V pour la soirée annuelle la plus mémorable.","Smart casual",'universite'),
  makeEvent('Gala Élégance × FAYAS — Rabat','gala',null,'Sofitel Rabat Jardin des Roses','Rabat','2026-07-12','19:30',600,1500,250,62,"Dans les jardins enchanteurs du Sofitel Rabat, Fayas orchestre le Gala Élégance avec dîner signature.","Black tie",'gala'),
  makeEvent('ECHO × FAYAS — Oudayas Riverside','concert',null,'Les Oudayas Rabat','Rabat','2026-06-27','21:00',200,500,800,310,"Fayas investit les remparts des Oudayas pour ECHO, une nuit musicale suspendue entre ciel et Atlantique.","Urban chic",'concert'),
  makeEvent('JAZZ & ROSES × FAYAS — Sofitel Rabat','soiree',null,'Sofitel Rabat Jardin des Roses','Rabat','2026-08-07','20:00',300,700,250,95,"Fayas transforme le jardin de roses du Sofitel en scène jazz. Quartet live, cuisine fine et cocktails floraux.","Floral chic",'soiree'),
  makeEvent('Nuit des Grandes Écoles EMI × FAYAS','universite','EMI','Sofitel Rabat Jardin des Roses','Rabat','2026-07-03','20:00',180,380,500,195,"Fayas et l'EMI célèbrent l'excellence des ingénieurs marocains. Gala étudiant, distinction et DJ set.","Smart casual",'universite'),
  // ── AGADIR / TAGHAZOUT ──
  makeEvent('XTRAVAGANZA × FAYAS — Taghazout Bay','concert',null,'Radisson Blu Taghazout Bay','Agadir','2026-06-05','20:00',400,900,1500,630,"Le festival électronique de référence au Maroc fait son grand retour avec Fayas sur la plage de Taghazout.","Festival look",'festival'),
  makeEvent('LE COMPTOIR ELECTRONIK × FAYAS','concert',null,'LBO Agadir Beach Club','Agadir','2026-06-19','22:00',180,420,600,240,"Fayas apporte l'esprit Comptoir Électronik sur la côte souss. Minimal techno et electronic groove les pieds dans le sable.","Club chic",'concert'),
  makeEvent('COASTAL GROOVES × FAYAS — Agadir','soiree',null,'Sofitel Agadir Royal Bay','Agadir','2026-07-25','20:30',220,550,500,198,"Fayas et le Sofitel Royal Bay vous invitent à une soirée beach-chic face à l'Atlantique.","Beach chic",'beach'),
  makeEvent('Gala Ibn Zohr × FAYAS 2026','universite','UIZ','Sofitel Agadir Thalassa','Agadir','2026-07-09','19:30',150,300,450,162,"Fayas et l'Université Ibn Zohr s'unissent pour le Gala de fin d'année le plus ensoleillé du Maroc.","Smart casual",'universite'),
  // ── TANGER ──
  makeEvent('VELOCITY FEST × FAYAS — Tanger Bay','concert',null,'Marina Bay Tanger','Tanger','2026-07-25','20:00',300,700,1500,520,"Fayas fait escale à Tanger pour VELOCITY FEST, le festival qui fusionne techno, drum & bass et afrobeats sur les quais de la Marina.","Festival look",'festival'),
  makeEvent('Soirée Chic du Nord × FAYAS','soiree',null,'Hilton Tanger City Center','Tanger','2026-07-17','21:30',280,650,300,112,"Fayas présente la soirée mondaine de l'été tangerois. Vue panoramique sur le Détroit de Gibraltar.","Cocktail chic",'soiree'),
  // ── ESSAOUIRA ──
  makeEvent('LUMINA FESTIVAL × FAYAS 2026','concert',null,"Plage d'Essaouira",'Essaouira','2026-10-01','17:00',350,800,2500,0,"Fayas lance LUMINA, le nouveau festival de référence à Essaouira. 4 jours de musique sur la plage atlantique.","Festival look",'festival'),
  makeEvent('GNAWA BLUES NIGHT × FAYAS','concert',null,'Place Moulay Hassan Essaouira','Essaouira','2026-08-01','21:00',150,350,1000,380,"Fayas célèbre l'âme d'Essaouira : une nuit de Gnawa fusionné avec jazz et blues sur la mythique Place Moulay Hassan.","Free spirit",'gnawa'),
  // ── FÈS ──
  makeEvent('Arabian Nights × FAYAS — Fès Médina','soiree',null,'Riad Fès by Amanjenaee','Fès','2026-07-18','20:30',350,800,150,58,"Fayas vous transporte dans les Mille et Une Nuits : dîner marocain dans un riad fassi, musique andalouse live.","Oriental chic",'soiree'),
  makeEvent('GALA FASSI × FAYAS 2026','gala',null,'Palais Faraj Fès','Fès','2026-08-07','19:00',500,1200,150,0,"Fayas sublime Fès la nuit : le Gala Fassi réunit l'élite du Maroc dans les décors mauresque du Palais Faraj.","Black tie",'gala'),
  makeEvent('Nuit des Grandes Écoles USMBA × FAYAS','universite','USMBA','Sofitel Fès Palais Jamai','Fès','2026-06-21','20:00',150,300,500,187,"Fayas et l'USMBA célèbrent l'excellence académique dans le cadre prestigieux du Palais Jamai.","Smart casual",'universite'),
  // ── KÉNITRA ──
  makeEvent('Soirée Étudiante UIT × FAYAS','universite','UIT','Club Nautique de Kénitra','Kénitra','2026-06-14','21:00',80,160,400,165,"Fayas s'invite à l'Ibn Tofail pour la soirée étudiante de fin d'année sur les rives du Bou Regreg.","Smart casual",'universite'),
  makeEvent('RIVERSIDE SOUNDS × FAYAS — Kénitra','concert',null,'Plage Mehdya Kénitra','Kénitra','2026-07-11','20:00',150,350,600,210,"Fayas découvre Kénitra : RIVERSIDE SOUNDS investit la plage sauvage de Mehdya pour une nuit de house et afrobeats.","Beach casual",'beach'),
  // ── MEKNÈS ──
  makeEvent('Soirée Annuelle UMI × FAYAS','universite','UMI','Hôtel Transatlantique Meknès','Meknès','2026-06-26','20:00',100,200,350,142,"Fayas et l'UMI réunissent les étudiants de Meknès pour la soirée annuelle de fin d'année.","Smart casual",'universite'),
  makeEvent('GALA ISMAILI × FAYAS — Meknès','gala',null,'Palais Bassatine Meknès','Meknès','2026-07-31','19:30',400,900,200,0,"Fayas met à l'honneur la ville des Ismaïls : un gala de prestige au Palais Bassatine avec dîner impérial.","Black tie",'gala'),
  // ── OUJDA ──
  makeEvent('ORIENTAL GROOVE × FAYAS — Oujda','concert',null,'Complexe Culturel Mohammed VI Oujda','Oujda','2026-08-14','21:00',150,350,800,0,"Fayas traverse le pays pour ORIENTAL GROOVE, une nuit musicale mêlant raï moderne et beats orientaux.","Urban chic",'concert'),
  makeEvent('Soirée UM1 × FAYAS 2026','universite','UM1','Hôtel Al Manar Oujda','Oujda','2026-07-03','20:00',80,160,350,118,"La grande soirée de fin d'année de l'Université Mohammed 1er, organisée avec Fayas à la porte de l'orient.","Smart casual",'universite'),
  // ── TÉTOUAN ──
  makeEvent('Soirée Étudiante UAE × FAYAS','universite','UAE','Club Méditerranée Tétouan','Tétouan','2026-06-19','21:00',80,160,400,148,"Fayas et l'UAE célèbrent la fin d'année entre deux rives, musique andalouse et électro face à la mer.","Smart casual",'universite'),
];

const ADMIN = {
  id: uuidv4(), name: 'Admin Fayas',
  email: 'admin@billetterie.ma', role: 'admin',
  loyalty_points: 0, created_at: new Date().toISOString(),
};

const USERS = [ADMIN];
const TICKETS = [];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function paginate(arr, page, limit) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit) || 24));
  const total = arr.length;
  const data  = arr.slice((p - 1) * l, p * l);
  return { data, meta: { total, page: p, limit: l, pages: Math.ceil(total / l) } };
}
function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalide' }); }
}
function safeUser(u) {
  const { password: _, ...s } = u;
  return s;
}

/* ─────────────────────────────────────────
   ROUTES
───────────────────────────────────────── */

app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '1.2-demo', mode: 'demo' }));

/* ── Events ── */
app.get('/api/events', (req, res) => {
  let list = [...EVENTS];
  const { type, city, search, upcoming } = req.query;
  if (type && type !== 'all') list = list.filter(e => e.type === type);
  if (city && city !== 'all') list = list.filter(e => e.city === city);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(e => e.title.toLowerCase().includes(s) || e.venue.toLowerCase().includes(s) || e.city.toLowerCase().includes(s));
  }
  if (upcoming === 'true') list = list.filter(e => new Date(e.date) >= new Date());
  list.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(paginate(list, req.query.page, req.query.limit));
});

app.get('/api/events/:id', (req, res) => {
  const ev = EVENTS.find(e => e.id === req.params.id);
  if (!ev) return res.status(404).json({ error: 'Événement non trouvé' });
  res.json(ev);
});

/* ── Universities ── */
app.get('/api/universities', (_req, res) => {
  const list = UNIVERSITIES.map(u => ({
    ...u,
    event_count: EVENTS.filter(e => e.university_id === u.id).length,
    description: `${u.name} — établissement d'enseignement supérieur à ${u.city}.`,
  }));
  res.json(list.sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/universities/:id', (req, res) => {
  const u = UNIVERSITIES.find(u => u.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Université non trouvée' });
  res.json(u);
});

app.get('/api/universities/:id/events', (req, res) => {
  const u = UNIVERSITIES.find(u => u.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Université non trouvée' });
  const events = EVENTS.filter(e => e.university_id === u.id);
  res.json({ university: u, events });
});

/* ── Auth ── */
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone, university_id } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Champs requis manquants' });
  if (USERS.find(u => u.email === email.toLowerCase())) return res.status(409).json({ error: 'Email déjà utilisé' });
  const user = {
    id: uuidv4(), name, email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    role: 'user', university_id: university_id || null,
    phone: phone || null, loyalty_points: 0,
    created_at: new Date().toISOString(),
  };
  USERS.push(user);
  res.status(201).json({ user: safeUser(user), token: sign(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find(u => u.email === email?.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  const ok = user.email === ADMIN.email
    ? (password === 'Admin123!')
    : await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  res.json({ user: safeUser(user), token: sign(user) });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = USERS.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const uni = UNIVERSITIES.find(u => u.id === user.university_id);
  res.json({
    ...safeUser(user),
    university: uni ? { id: uni.id, name: uni.name, short_name: uni.short_name, city: uni.city, color: uni.color } : null,
  });
});

/* ── Tickets ── */
app.get('/api/tickets/my', auth, (req, res) => {
  const list = TICKETS.filter(t => t.user_id === req.user.id);
  res.json(paginate(list, req.query.page, req.query.limit));
});

app.post('/api/tickets/purchase', auth, (req, res) => {
  const { event_id, ticket_type, quantity = 1 } = req.body;
  const ev = EVENTS.find(e => e.id === event_id);
  if (!ev) return res.status(404).json({ error: 'Événement non trouvé' });
  const unitPrice = ticket_type === 'vip' ? ev.price_vip : ev.price_standard;
  const ticket = {
    id: uuidv4(), event_id, user_id: req.user.id,
    ticket_type, quantity: Number(quantity),
    unit_price: unitPrice, total_price: unitPrice * Number(quantity),
    status: 'confirmed', purchased_at: new Date().toISOString(),
    event_title: ev.title, date: ev.date, time: ev.time,
    venue: ev.venue, city: ev.city, event_type: ev.type, dress_code: ev.dress_code,
  };
  TICKETS.push(ticket);
  ev.tickets_sold += Number(quantity);
  res.status(201).json({ ...ticket, points_earned: Math.round(ticket.total_price) });
});

/* ── Admin stats ── */
app.get('/api/admin/stats', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  res.json({
    totalEvents: EVENTS.length,
    totalUsers: USERS.filter(u => u.role === 'user').length,
    totalTickets: TICKETS.length,
    totalRevenue: TICKETS.reduce((s, t) => s + t.total_price, 0),
    ticketsSold: TICKETS.reduce((s, t) => s + t.quantity, 0),
    eventsByType: Object.entries(EVENTS.reduce((acc, e) => { acc[e.type] = (acc[e.type]||0)+1; return acc; }, {})).map(([type, count]) => ({ type, count })),
    eventsByCity: Object.entries(EVENTS.reduce((acc, e) => { acc[e.city] = (acc[e.city]||0)+1; return acc; }, {})).map(([city, count]) => ({ city, count })).sort((a,b)=>b.count-a.count).slice(0,8),
    revenueByMonth: [],
    recentTickets: TICKETS.slice(-10),
    topEvents: EVENTS.sort((a,b)=>b.tickets_sold-a.tickets_sold).slice(0,6).map(e=>({ id:e.id, title:e.title, city:e.city, type:e.type, tickets_sold:e.tickets_sold, capacity:e.capacity, fill_rate:((e.tickets_sold/e.capacity)*100).toFixed(1) })),
  });
});

app.get('/api/admin/users', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  res.json(USERS.map(u => ({ ...safeUser(u), ticket_count: TICKETS.filter(t=>t.user_id===u.id).length, total_spent: TICKETS.filter(t=>t.user_id===u.id).reduce((s,t)=>s+t.total_price,0) })));
});

app.get('/api/admin/tickets', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  res.json(paginate(TICKETS, req.query.page, req.query.limit || 50));
});

app.get('/api/loyalty', auth, (req, res) => {
  const user = USERS.find(u => u.id === req.user.id);
  res.json({ points: user?.loyalty_points || 0, history: [] });
});

/* ── 404 ── */
app.use((_req, res) => res.status(404).json({ error: 'Route non trouvée' }));

app.listen(PORT, () => {
  console.log('\x1b[35m◆ Fayas DEMO Server\x1b[0m');
  console.log(`\x1b[36m  http://localhost:${PORT}/api\x1b[0m`);
  console.log(`\x1b[2m  ${EVENTS.length} événements | ${UNIVERSITIES.length} universités | Mode démo\x1b[0m`);
  console.log(`\x1b[2m  Admin: admin@billetterie.ma / Admin123!\x1b[0m`);
});
