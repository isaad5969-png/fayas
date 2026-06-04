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
  concert:      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
  festival:     'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
  soiree:       'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  gala:         'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
  universite:   'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
  rooftop:      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  gnawa:        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  beach:        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  // ── Images réelles Tidar.ma ──
  moga_ess:     'https://tidar.ma/uploads/1778759182.png',
  santablanca:  'https://tidar.ma/uploads/1779724667.png',
  gate_bouznika:'https://tidar.ma/uploads/1779713184.png',
  superjazzy:   'https://tidar.ma/uploads/1777980600.jpg',
  alex_leone:   'https://tidar.ma/uploads/1776862960.png',
  echo7000:     'https://tidar.ma/uploads/1777640840.png',
  backtohouse:  'https://tidar.ma/uploads/1779480780.jpg',
  xtravaganza:  'https://tidar.ma/uploads/1779733241.png',
  velocity:     'https://tidar.ma/uploads/1779189249.png',
  dreamers:     'https://tidar.ma/uploads/1775128024.png',
  darna:        'https://tidar.ma/uploads/1778238231.png',
  // ── Soirées supplémentaires Tidar.ma ──
  chrome_rabat:   'https://tidar.ma/uploads/1780412800.png',
  solstice_casa:  'https://tidar.ma/uploads/1780499200.png',
  jungle_tribe:   'https://tidar.ma/uploads/1780585600.jpg',
  luna_tanger:    'https://tidar.ma/uploads/1780672000.png',
  underground02:  'https://tidar.ma/uploads/1780758400.jpg',
  sunrise_agadir: 'https://tidar.ma/uploads/1780844800.png',
  deep_casa:      'https://tidar.ma/uploads/1780931200.jpg',
  mystic_fes:     'https://tidar.ma/uploads/1781017600.png',
  paradise_marra: 'https://tidar.ma/uploads/1781104000.jpg',
  after_hours:    'https://tidar.ma/uploads/1781190400.png',
};

/* ── Coordonnées géographiques pour les marqueurs carte ── */
const CITY_COORDS_SERVER = {
  Casablanca:   [33.5731, -7.5898],
  Marrakech:    [31.6295, -7.9811],
  Rabat:        [34.0209, -6.8416],
  Agadir:       [30.4202, -9.5982],
  'Fès':        [34.0181, -5.0078],
  Tanger:       [35.7595, -5.8340],
  Essaouira:    [31.5085, -9.7595],
  'Kénitra':    [34.2610, -6.5802],
  'Meknès':     [33.8935, -5.5473],
  Oujda:        [34.6867, -1.9114],
  'Tétouan':    [35.5785, -5.3684],
  Dakhla:       [23.7136, -15.9355],
  Ifrane:       [33.5228, -5.1097],
  'El Jadida':  [33.2316, -8.5007],
  'Ben Guerir': [32.2352, -7.9560],
  Bouznika:     [33.7917, -7.1589],
};

/* Hash déterministe pour décaler les marqueurs de la même ville */
function geoHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) & 0x7fffffff;
  return h;
}

const UNIVERSITIES = [
  // ── Universités publiques ──
  { id: uuidv4(), short_name: 'UM5',        name: 'Université Mohammed V',                      city: 'Rabat',       color: '#7C3AED', student_count: 85000,  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Mohammed_V_University_Logo.png/250px-Mohammed_V_University_Logo.png' },
  { id: uuidv4(), short_name: 'UH2C',       name: 'Université Hassan II',                       city: 'Casablanca',  color: '#DC2626', student_count: 120000, logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/UH2-logo.png/250px-UH2-logo.png' },
  { id: uuidv4(), short_name: 'UCA',        name: 'Université Cadi Ayyad',                      city: 'Marrakech',   color: '#D97706', student_count: 95000,  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Universite_Cadi_Ayyad.png/250px-Universite_Cadi_Ayyad.png' },
  { id: uuidv4(), short_name: 'USMBA',      name: 'Université Sidi Mohammed Ben Abdellah',      city: 'Fès',         color: '#6D28D9', student_count: 80000,  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/University_SIDI_MOHAMMED_BEN_ABBEDELLAH.jpg/250px-University_SIDI_MOHAMMED_BEN_ABBEDELLAH.jpg' },
  { id: uuidv4(), short_name: 'UIT',        name: 'Université Ibn Tofail',                      city: 'Kénitra',     color: '#059669', student_count: 45000,  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/%D8%AC%D8%A7%D9%85%D8%B9%D8%A9_%D8%A5%D8%A8%D9%86_%D8%B7%D9%81%D9%8A%D9%84.png' },
  { id: uuidv4(), short_name: 'UIZ',        name: 'Université Ibn Zohr',                        city: 'Agadir',      color: '#0284C7', student_count: 60000,  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Logo-UIZ.jpg' },
  { id: uuidv4(), short_name: 'UAE',        name: 'Université Abdelmalek Essaâdi',              city: 'Tétouan',     color: '#BE185D', student_count: 55000,  logo_url: 'https://upload.wikimedia.org/wikipedia/en/3/35/Abdelmalek_Essaadi_University.png' },
  { id: uuidv4(), short_name: 'UMI',        name: 'Université Moulay Ismail',                   city: 'Meknès',      color: '#B45309', student_count: 40000,  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Logo-umi.png' },
  { id: uuidv4(), short_name: 'UH1',        name: 'Université Hassan 1er',                      city: 'Settat',      color: '#065F46', student_count: 35000,  logo_url: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/38/Universite-Hassan-1er-settat.PNG/330px-Universite-Hassan-1er-settat.PNG' },
  { id: uuidv4(), short_name: 'UM1',        name: 'Université Mohammed 1er',                    city: 'Oujda',       color: '#1D4ED8', student_count: 50000,  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Logo_de_l%27Universit%C3%A9_Mohammed_Premier.svg' },
  { id: uuidv4(), short_name: 'UCD',        name: 'Université Chouaib Doukkali',                city: 'El Jadida',   color: '#0891B2', student_count: 30000,  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Logo-UCD.jpg' },
  { id: uuidv4(), short_name: 'USMS',       name: 'Université Sultan Moulay Slimane',           city: 'Béni Mellal', color: '#7C2D8A', student_count: 35000,  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Usms-logo.png/250px-Usms-logo.png' },
  { id: uuidv4(), short_name: 'UAQ',        name: 'Université Al Quaraouiyine',                 city: 'Fès',         color: '#92400E', student_count: 10000,  logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/37/University_of_Al_Quaraouiyine_logo.svg/250px-University_of_Al_Quaraouiyine_logo.svg.png' },
  { id: uuidv4(), short_name: 'UAM',        name: 'Université Abdelmalek Essaâdi — Tanger',     city: 'Tanger',      color: '#0F766E', student_count: 30000,  logo_url: 'https://upload.wikimedia.org/wikipedia/en/3/35/Abdelmalek_Essaadi_University.png' },

  // ── Grandes écoles publiques d'ingénierie ──
  { id: uuidv4(), short_name: 'EMI',        name: "École Mohammadia d'Ingénieurs",              city: 'Rabat',       color: '#1E40AF', student_count: 3000,   logo_url: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/05/EMI.PNG/250px-EMI.PNG' },
  { id: uuidv4(), short_name: 'ENSIAS',     name: 'ENSIAS',                                     city: 'Rabat',       color: '#4338CA', student_count: 1500,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Ensias2.jpg' },
  { id: uuidv4(), short_name: 'INPT',       name: 'Institut National des P&T',                 city: 'Rabat',       color: '#0F766E', student_count: 2000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Logo_inpt.PNG/250px-Logo_inpt.PNG' },
  { id: uuidv4(), short_name: 'INSEA',      name: 'INSEA',                                     city: 'Rabat',       color: '#854D0E', student_count: 1200,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/INSEA_logo.png' },
  { id: uuidv4(), short_name: 'EHTP',       name: 'École Hassania des Travaux Publics',        city: 'Casablanca',  color: '#9D174D', student_count: 1500,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/LogoEHTP.jpg' },
  { id: uuidv4(), short_name: 'IAV',        name: 'IAV Hassan II',                             city: 'Rabat',       color: '#166534', student_count: 3000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Logo_iav.png' },
  { id: uuidv4(), short_name: 'ESITH',      name: 'École Supérieure des Industries du Textile', city: 'Casablanca',  color: '#B91C1C', student_count: 1000,   logo_url: 'https://upload.wikimedia.org/wikipedia/fr/6/64/ESITH_Logo.jpg' },
  { id: uuidv4(), short_name: 'ENIM',       name: 'École Nationale de l\'Industrie Minérale',  city: 'Rabat',       color: '#374151', student_count: 1000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/ENSMR.png' },
  { id: uuidv4(), short_name: 'ENAM',       name: 'École Nationale d\'Administration et de Mgmt', city: 'Casablanca', color: '#0369A1', student_count: 800,  logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%230369A1%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%230369A1%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2248%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2216%22 font-weight%3D%22800%22 fill%3D%22%230369A1%22%3EENAM%3C%2Ftext%3E%3C%2Fsvg%3E' },

  // ── ENSA (Écoles Nationales des Sciences Appliquées) ──
  { id: uuidv4(), short_name: 'ENSA-FES',   name: 'ENSA Fès',                                  city: 'Fès',         color: '#6D28D9', student_count: 2000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/ENSAF.png' },
  { id: uuidv4(), short_name: 'ENSA-MRK',   name: 'ENSA Marrakech',                            city: 'Marrakech',   color: '#D97706', student_count: 2000,   logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%23D97706%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%23D97706%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2244%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2213%22 font-weight%3D%22800%22 fill%3D%22%23D97706%22%3ENSA%3C%2Ftext%3E%3Ctext x%3D%2240%22 y%3D%2260%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2213%22 font-weight%3D%22800%22 fill%3D%22%23D97706%22%3EMRK%3C%2Ftext%3E%3C%2Fsvg%3E' },
  { id: uuidv4(), short_name: 'ENSA-AGA',   name: 'ENSA Agadir',                               city: 'Agadir',      color: '#0284C7', student_count: 1800,   logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%230284C7%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%230284C7%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2244%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2213%22 font-weight%3D%22800%22 fill%3D%22%230284C7%22%3ENSA%3C%2Ftext%3E%3Ctext x%3D%2240%22 y%3D%2260%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2213%22 font-weight%3D%22800%22 fill%3D%22%230284C7%22%3EAGA%3C%2Ftext%3E%3C%2Fsvg%3E' },
  { id: uuidv4(), short_name: 'ENSA-OUJ',   name: 'ENSA Oujda',                                city: 'Oujda',       color: '#1D4ED8', student_count: 1500,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/%C3%89cole_Nationale_des_Sciences_Appliqu%C3%A9es_d%27Oujda_logo.png/250px-%C3%89cole_Nationale_des_Sciences_Appliqu%C3%A9es_d%27Oujda_logo.png' },
  { id: uuidv4(), short_name: 'ENSA-TNG',   name: 'ENSA Tanger',                               city: 'Tanger',      color: '#BE185D', student_count: 1800,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Ensat.jpg/250px-Ensat.jpg' },
  { id: uuidv4(), short_name: 'ENSA-KEN',   name: 'ENSA Kénitra',                              city: 'Kénitra',     color: '#059669', student_count: 1500,   logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%23059669%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%23059669%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2244%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2213%22 font-weight%3D%22800%22 fill%3D%22%23059669%22%3ENSA%3C%2Ftext%3E%3Ctext x%3D%2240%22 y%3D%2260%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2213%22 font-weight%3D%22800%22 fill%3D%22%23059669%22%3EKEN%3C%2Ftext%3E%3C%2Fsvg%3E' },

  // ── ENCG (Écoles Nationales de Commerce et de Gestion) ──
  { id: uuidv4(), short_name: 'ENCG-CASA',  name: 'ENCG Casablanca',                           city: 'Casablanca',  color: '#0E4F8B', student_count: 3000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png' },
  { id: uuidv4(), short_name: 'ENCG-FES',   name: 'ENCG Fès',                                  city: 'Fès',         color: '#3730A3', student_count: 2500,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png' },
  { id: uuidv4(), short_name: 'ENCG-MRK',   name: 'ENCG Marrakech',                            city: 'Marrakech',   color: '#B45309', student_count: 2000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png' },
  { id: uuidv4(), short_name: 'ENCG-AGA',   name: 'ENCG Agadir',                               city: 'Agadir',      color: '#0891B2', student_count: 2000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png' },
  { id: uuidv4(), short_name: 'ENCG-TNG',   name: 'ENCG Tanger',                               city: 'Tanger',      color: '#0F766E', student_count: 2000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png' },
  { id: uuidv4(), short_name: 'ENCG-KEN',   name: 'ENCG Kénitra',                              city: 'Kénitra',     color: '#065F46', student_count: 1800,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png' },
  { id: uuidv4(), short_name: 'ENCG-OUJ',   name: 'ENCG Oujda',                                city: 'Oujda',       color: '#1D4ED8', student_count: 1800,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png' },
  { id: uuidv4(), short_name: 'ENCG-SET',   name: 'ENCG Settat',                               city: 'Settat',      color: '#7C3AED', student_count: 1500,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png' },

  // ── Grandes écoles de commerce ──
  { id: uuidv4(), short_name: 'ISCAE',      name: 'ISCAE',                                     city: 'Casablanca',  color: '#1E3A5F', student_count: 4000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Logo_groupe_ISCAE.jpg' },
  { id: uuidv4(), short_name: 'HEM',        name: 'HEM Business School',                       city: 'Casablanca',  color: '#7E22CE', student_count: 8000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Logo_HEM.svg' },
  { id: uuidv4(), short_name: 'ESCA',       name: 'ESCA École de Management',                  city: 'Casablanca',  color: '#DC2626', student_count: 3500,   logo_url: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c7/ESCA_Logo.png/200px-ESCA_Logo.png' },
  { id: uuidv4(), short_name: 'ISGA',       name: 'Institut Supérieur de Gestion et d\'Administration', city: 'Casablanca', color: '#0E7490', student_count: 5000, logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%230E7490%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%230E7490%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2248%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2216%22 font-weight%3D%22800%22 fill%3D%22%230E7490%22%3EISGA%3C%2Ftext%3E%3C%2Fsvg%3E' },
  { id: uuidv4(), short_name: 'ISC',        name: 'Institut Supérieur de Commerce',            city: 'Rabat',       color: '#854D0E', student_count: 3000,   logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%23854D0E%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%23854D0E%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2248%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2216%22 font-weight%3D%22800%22 fill%3D%22%23854D0E%22%3EISC%3C%2Ftext%3E%3C%2Fsvg%3E' },

  // ── Grandes écoles d'ingénierie privées ──
  { id: uuidv4(), short_name: 'EMSI',       name: 'École Marocaine des Sciences de l\'Ingénieur', city: 'Casablanca', color: '#1E40AF', student_count: 6000,  logo_url: 'https://upload.wikimedia.org/wikipedia/fr/4/4a/Emsi_logo.jpg' },
  { id: uuidv4(), short_name: 'SUPMTI',     name: 'SUPMTI',                                    city: 'Casablanca',  color: '#4338CA', student_count: 2000,   logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%234338CA%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%234338CA%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2248%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2213%22 font-weight%3D%22800%22 fill%3D%22%234338CA%22%3ESUPMTI%3C%2Ftext%3E%3C%2Fsvg%3E' },
  { id: uuidv4(), short_name: 'ESISA',      name: 'ESISA',                                     city: 'Fès',         color: '#0F766E', student_count: 1500,   logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%230F766E%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%230F766E%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2248%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2216%22 font-weight%3D%22800%22 fill%3D%22%230F766E%22%3EESISA%3C%2Ftext%3E%3C%2Fsvg%3E' },
  { id: uuidv4(), short_name: 'ENSEM',      name: 'ENSEM',                                     city: 'Casablanca',  color: '#166534', student_count: 1000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/ENSEM-270x300.png/250px-ENSEM-270x300.png' },

  // ── Universités privées ──
  { id: uuidv4(), short_name: 'UIR',        name: 'Université Internationale de Rabat',        city: 'Rabat',       color: '#0369A1', student_count: 8000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/46/LOGO_UIR.jpg' },
  { id: uuidv4(), short_name: 'UM6P',       name: 'Université Mohammed VI Polytechnique',      city: 'Ben Guerir',  color: '#374151', student_count: 3000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/UM6P-Universit%C3%A9-Mohamed-VI-polytechnique.png' },
  { id: uuidv4(), short_name: 'UAA',        name: 'Université Al Akhawayn',                    city: 'Ifrane',      color: '#B91C1C', student_count: 2000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Al_Akhawayn_logo.jpg' },
  { id: uuidv4(), short_name: 'UIC',        name: 'Université Internationale de Casablanca',   city: 'Casablanca',  color: '#0E7490', student_count: 5000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Universit%C3%A9_Internationale_de_Casablanca.jpg' },
  { id: uuidv4(), short_name: 'UEMF',       name: 'Université Euro-Méditerranéenne de Fès',    city: 'Fès',         color: '#1A56DB', student_count: 3000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Logo_Universit%C3%A9_Euromed_de_F%C3%A8s.png' },
  { id: uuidv4(), short_name: 'UPM',        name: 'Université Privée de Marrakech',            city: 'Marrakech',   color: '#C2410C', student_count: 4000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/LOGO_UPM_-_UNIVERSITE_PRIVEE_DE_MARRAKECH.jpg' },
  { id: uuidv4(), short_name: 'MUNDIAPOLIS',name: 'Université Mundiapolis',                    city: 'Casablanca',  color: '#4B5563', student_count: 6000,   logo_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Mundiapolislogo.gif' },
  { id: uuidv4(), short_name: 'USEK-MA',    name: 'USEK Maroc',                                city: 'Casablanca',  color: '#7C2D8A', student_count: 2000,   logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%237C2D8A%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%237C2D8A%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2248%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2214%22 font-weight%3D%22800%22 fill%3D%22%237C2D8A%22%3EUSEK%3C%2Ftext%3E%3C%2Fsvg%3E' },
  { id: uuidv4(), short_name: 'IPSS',       name: 'Institut Privé des Sciences Sociales',      city: 'Rabat',       color: '#92400E', student_count: 1200,   logo_url: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 80 80%22%3E%3Crect width%3D%2280%22 height%3D%2280%22 rx%3D%2210%22 fill%3D%22%2392400E%22 opacity%3D%220.12%22%2F%3E%3Crect x%3D%221%22 y%3D%221%22 width%3D%2278%22 height%3D%2278%22 rx%3D%229%22 fill%3D%22none%22 stroke%3D%22%2392400E%22 stroke-width%3D%221.5%22 opacity%3D%220.4%22%2F%3E%3Ctext x%3D%2240%22 y%3D%2248%22 text-anchor%3D%22middle%22 font-family%3D%22system-ui%2Csans-serif%22 font-size%3D%2216%22 font-weight%3D%22800%22 fill%3D%22%2392400E%22%3EIPSS%3C%2Ftext%3E%3C%2Fsvg%3E' },
];

const uniMap = Object.fromEntries(UNIVERSITIES.map(u => [u.short_name, u]));

/* ── Génération des événements ── */
function makeEvent(title, type, uniShort, venue, city, date, time, std, vip, cap, sold, desc, dress, imgKey) {
  const uni = uniShort ? uniMap[uniShort] : null;
  const base = CITY_COORDS_SERVER[city] || [31.7917, -7.0926];
  const h = geoHash(title);
  const lat = +(base[0] + ((h & 0x3fff) / 0x3fff - 0.5) * 0.05).toFixed(6);
  const lng = +(base[1] + (((h >> 14) & 0x3fff) / 0x3fff - 0.5) * 0.05).toFixed(6);
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
    lat, lng,
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
  makeEvent('XTRAVAGANZA — Taghazout Bay','festival',null,'Radisson Blu Resort Taghazout Bay Surf Village','Agadir','2026-06-05','20:00',400,900,1500,630,"Festival immersif alliant musique, costumes, maquillage UV et décors féeriques. Choisissez votre élément : Eau (bleu/violet), Terre (vert/brun), Air (blanc), Feu (rouge/jaune). Lineup : Andrea Oliva, Joris Delacroix, Joachim Pastor, Caiiro.","Costume élémentaire",'xtravaganza'),
  makeEvent('LE COMPTOIR ELECTRONIK × FAYAS','concert',null,'LBO Agadir Beach Club','Agadir','2026-06-19','22:00',180,420,600,240,"Fayas apporte l'esprit Comptoir Électronik sur la côte souss. Minimal techno et electronic groove les pieds dans le sable.","Club chic",'concert'),
  makeEvent('COASTAL GROOVES × FAYAS — Agadir','soiree',null,'Sofitel Agadir Royal Bay','Agadir','2026-07-25','20:30',220,550,500,198,"Fayas et le Sofitel Royal Bay vous invitent à une soirée beach-chic face à l'Atlantique.","Beach chic",'beach'),
  makeEvent('Gala Ibn Zohr × FAYAS 2026','universite','UIZ','Sofitel Agadir Thalassa','Agadir','2026-07-09','19:30',150,300,450,162,"Fayas et l'Université Ibn Zohr s'unissent pour le Gala de fin d'année le plus ensoleillé du Maroc.","Smart casual",'universite'),
  // ── TANGER ──
  makeEvent('VELOCITY FEST — Tanger','festival',null,'Bord de mer — Tanger','Tanger','2026-07-25','12:00',300,700,1500,520,"Revival de Made in Velocity avec un concept entièrement nouveau, une nouvelle énergie et une nouvelle destination. Musique, off-events, activités curatoriales et expériences au-delà de la piste de danse. Lineup à annoncer.","Come as you are",'velocity'),
  makeEvent('Soirée Chic du Nord × FAYAS','soiree',null,'Hilton Tanger City Center','Tanger','2026-07-17','21:30',280,650,300,112,"Fayas présente la soirée mondaine de l'été tangerois. Vue panoramique sur le Détroit de Gibraltar.","Cocktail chic",'soiree'),
  // ── ESSAOUIRA ──
  makeEvent('MOGA ESSAOUIRA 2026','festival',null,"Hôtel Le Golf d'Essaouira & Spa",'Essaouira','2026-09-30','15:00',800,2000,2500,0,"Le festival boutique électronique d'Essaouira fête ses 10 ans. 5 jours de musique, art, mouvement et expériences inoubliables — Atlantic vibes. MOGA OFF (30 sept-1er oct) gratuit, MOGA IN (2-4 oct) sur billet. Lineup : Jamie Jones, The Martinez Brothers, Rhadoo, Fort Romeau.","Come as you are",'moga_ess'),
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
  // ── ÉVÉNEMENTS TIDAR.MA (réels) ──
  makeEvent('SANTABLANCA — Fan Zone & Club','soiree',null,'Gaia Beach Casablanca','Casablanca','2026-06-13','16:00',200,450,800,312,"Fan zone géante pour Maroc vs Brésil : giant screen, DJ sets house jusqu\'à 4h du matin, food & drinks et ambiance beach sunset. Le match commence, la nuit continue.","Beach chic",'santablanca'),
  makeEvent('GATE TO BOUZNIKA','soiree',null,'Eden Island Beach Club','Bouznika','2026-06-21','17:00',150,300,600,195,"Sunset celebration face à l\'Atlantique : Afro House, Latin House, ocean vibes et tropical energy. Headliner : OMED. Une escapade hors du temps entre rythme et connexion.","Well dressed",'gate_bouznika'),
  makeEvent('SUPERJAZZY × MĀDERO — Marrakech','concert',null,'Villa Marco Au jardin des senteurs','Marrakech','2026-06-05','22:00',350,800,500,267,"22 heures de musique non-stop par Tania Vulcano et 12 artistes internationaux. Son Funktion-One, pool vibes, du soir jusqu\'au soleil levant. Par Supervibe.","Festival chic",'superjazzy'),
  makeEvent('ALEX WANN @ LEONE — Marrakech','concert',null,'LEONE Marrakech','Marrakech','2026-05-29','22:00',250,600,400,180,"Alex Wann investit le LEONE pour une nuit électronique de prestige. Sets profonds, basses puissantes, ambiance club 5 étoiles au cœur de Marrakech.","Club chic",'alex_leone'),
  makeEvent('ECHO7000 × BURN ENERGY TOUR 2026','concert',null,'TBA Marrakech','Marrakech','2026-06-27','21:00',200,500,1000,0,"Le Burn Energy Tour fait escale à Marrakech avec ECHO7000. Énergie maximale, lineup surprises et production scénique massive.","Urban chic",'echo7000'),
  makeEvent('BACK TO HOUSE — Underground Vol. 02','concert',null,'Venue secrète — Marrakech','Marrakech','2026-07-18','22:00',180,420,600,240,"La série underground continue. Vol. 02 plonge dans les racines de la house music, sélection rigoureuse, son Funktion-One, capacité strictement limitée.","All black",'backtohouse'),
  makeEvent('DARNA I — Roots of Detroit','concert',null,'Lieu à révéler — Marrakech','Marrakech','2026-06-13','22:00',220,500,400,160,"Darna célèbre les racines de la techno de Detroit. Une nuit immersive qui honore les pionniers d\'un genre fondateur, programmation pointue et sons authentiques.","All black",'darna'),
  // ── Soirées Tidar.ma supplémentaires ──
  makeEvent('CHROME — Electronic Night Rabat','soiree',null,'Sofitel Rabat Jardin des Roses','Rabat','2026-07-04','23:00',180,400,500,215,"Chrome débarque à Rabat : une nuit de musique électronique pure — minimal, deep techno et ambient sombre. Résidence internationale, son Funktion-One, capacité strictement limitée.","All black / Chrome",'chrome_rabat'),
  makeEvent('SOLSTICE — Midsummer Party Casa','soiree',null,'La Sqala Casablanca','Casablanca','2026-06-21','21:00',200,500,600,310,"La nuit la plus longue de l'année célébrée sur les remparts de La Sqala. Solstice réunit DJs, artistes et fêtards pour une nuit inoubliable entre musique et magie nocturne.","Festival chic",'solstice_casa'),
  makeEvent('JUNGLE TRIBE — Pool & Dance','soiree',null,'Kenzi Tower Hotel Casablanca','Casablanca','2026-07-12','18:00',220,500,400,178,"Plongez dans la jungle : décors tropicaux, pool party et sets afro-house jusqu\'à l\'aube. Jungle Tribe est le rendez-vous estival de la scène casa — vibes, couleurs et percussions.","Tropical / Couleurs vives",'jungle_tribe'),
  makeEvent('LUNA BLANCA — Soirée Tanger','soiree',null,'El Minzah Hotel Tanger','Tanger','2026-07-19','22:00',250,600,350,142,"Face au Détroit, Luna Blanca transforme la terrasse de l\'El Minzah en dancefloor suspendu. White dress code, cocktails signature et DJ sets mêlant deep house et chaâbi électronique.","All white",'luna_tanger'),
  makeEvent('UNDERGROUND SESSION 02 — Casa','concert',null,'Venue secrète — Casablanca','Casablanca','2026-07-25','23:00',150,350,300,188,"Le deuxième volet de la série underground la plus attendue de l\'été. Adresse révélée 24h avant. Lineup surprise, son impeccable, pas de téléphone sur la piste.","All black",'underground02'),
  makeEvent('SUNRISE — Dawn Party Agadir','festival',null,'Sofitel Agadir Thalassa Sea & Spa','Agadir','2026-08-08','04:00',180,400,600,95,"Dansez jusqu\'au lever du soleil face à l\'Atlantique. Sunrise Agadir est la fête de l\'aube marocaine — beats organiques, brunch au soleil levant et douceur océanique.","Beach white",'sunrise_agadir'),
  makeEvent('DEEP SUNDAYS — Ain Diab Casa','soiree',null,'Cabaret Sauvage Casa Marina','Casablanca','2026-08-02','17:00',160,380,450,207,"Les dimanches ne seront plus jamais pareils. Deep Sundays invite les meilleurs sélecteurs de deep house du Maroc pour une session douce et groove face à l\'Atlantique.","Smart casual",'deep_casa'),
  makeEvent('MYSTIC FES — Palais des Arts','soiree',null,'Palais Batha Fès','Fès','2026-08-14','21:30',300,700,400,124,"Dans les cours du Batha, Mystic Fes mêle musique andalouse, électronique organique et installations lumineuses. Une nuit d\'art et de transe au cœur de la médina.","Oriental chic",'mystic_fes'),
  makeEvent('PARADISE POOL — Marrakech','soiree',null,'Fellah Hotel Marrakech','Marrakech','2026-08-01','17:00',250,600,500,263,"Le meilleur pool party de Marrakech revient pour l\'été. Paradise réunit dancefloor flottant, DJ sets continus de 17h à 4h du matin et cocktails tropicaux.","Swimwear / Club chic",'paradise_marra'),
  makeEvent('AFTER HOURS — Late Night Casa','concert',null,'NINE Casablanca','Casablanca','2026-08-22','01:00',120,280,250,180,"Quand la nuit devient profonde. After Hours accueille la crème des DJs underground pour des sets marathons qui durent jusqu\'au petit matin. Dernier bus parti ? Parfait.","All black",'after_hours'),
  makeEvent('NEON JUNGLE — Soirée Fluo Rabat','soiree',null,'Hôtel Golden Tulip Farah Rabat','Rabat','2026-07-31','22:00',140,320,400,156,"Corps illuminés, décors floraux UV et musique électronique colorée. Neon Jungle invite à une plongée sensorielle et dansante — maquillage UV fourni à l\'entrée.","Neon / Fluo obligatoire",'rooftop'),
  makeEvent('OASIS — Desert Rave Agadir','festival',null,'Plage des Dunes — Sidi Kaouki','Agadir','2026-09-05','20:00',350,800,1200,0,"Oasis sort des sentiers battus : rave en plein air entre dunes et Atlantique. Lineup international, scènes multiples, camping disponible. La fête que le Maroc attendait.","Festival look",'beach'),
  makeEvent('ELECTRIC MARRAKECH — Summer Edition','concert',null,'Nikki Beach Marrakech','Marrakech','2026-07-05','22:00',280,650,700,312,"La ville ocre s\'embrase : Electric Marrakech réunit cinq DJs internationaux pour une nuit de techno mélodique et de progressive house au bord de la piscine du Nikki Beach.","Club chic",'concert'),
  makeEvent('CASA GROOVE — R&B & Afrobeats Night','soiree',null,'Mazagan Beach & Golf Resort','Casablanca','2026-06-28','21:00',200,480,600,278,"La meilleure playlist R&B et Afrobeats du Maroc dans un cadre de rêve. Casa Groove célèbre la culture black music — Burna Boy, Wizkid, Summer Walker en boucle jusqu\'à l\'aube.","Smart casual",'soiree'),
  // ── DAKHLA ──
  makeEvent('MIDNIGHT OASIS × FAYAS — Dakhla','soiree',null,'Dakhla Attitude Kite Camp','Dakhla','2026-08-15','21:00',300,700,200,42,"Fayas descend jusqu'au bout du Maroc pour une soirée hors du commun face au lagon. Musique électronique, ciel étoilé et Atlantique à pied.","Bohème chic",'beach'),
  makeEvent('SANDSTORM × FAYAS — Dakhla Festival','festival',null,'Plage Foum El Bour Dakhla','Dakhla','2026-09-12','18:00',250,600,1000,185,"Le premier festival électronique du Sahara atlantique. Fayas réunit les meilleures têtes d'affiche sur la langue de sable de Dakhla.","Festival look",'festival'),
  // ── CASABLANCA (nouveaux) ──
  makeEvent('PRESTIGE GALA × FAYAS — Casablanca Royal','gala',null,'Fairmont Royal Palm Casablanca','Casablanca','2026-09-05','19:30',900,2200,120,18,"Le gala le plus exclusif de la saison au Fairmont Royal Palm. Dîner étoilé, DJ résidence internationale et cabaret de luxe.","Black tie",'gala'),
  makeEvent('ROOFTOP SESSION × FAYAS — Casa Marina','soiree',null,'Anfa Place Marina Casablanca','Casablanca','2026-06-21','20:30',180,450,350,127,"Sur les toits de la Marina de Casablanca, Fayas orchestre une soirée open-air avec vue sur l'Atlantique et le Hassan II.","Smart chic",'rooftop'),
  // ── MARRAKECH (nouveaux) ──
  makeEvent('GOLDEN HOUR × FAYAS — Atlas View','gala',null,'Palais Namaskar Marrakech','Marrakech','2026-10-10','18:00',800,2000,150,0,"Le gala crépuscule ultime : golden hour sur l'Atlas depuis les terrasses du Namaskar. Haute gastronomie, champagne et DJ set sunset.","Cocktail chic",'gala'),
  makeEvent('MYSTIC NIGHT × FAYAS — Jardin Majorelle','soiree',null,'Café Bô Zin Marrakech','Marrakech','2026-07-31','21:30',200,500,400,156,"Fayas transforme les jardins de Marrakech en scène mystique. Une nuit envoûtante mêlant art de lumière et musique électronique orientale.","Oriental chic",'soiree'),
];

const ADMIN = {
  id: uuidv4(), name: 'Admin Fayas',
  email: 'admin@billetterie.ma', role: 'admin',
  loyalty_points: 0, created_at: new Date().toISOString(),
};

const USERS = [ADMIN];
const TICKETS = [];
const SUBMITTED_EVENTS = []; // Événements soumis par les étudiants (status: pending)
const FAVORITES = []; // [{ user_id, event_id, created_at }]
const INTERESTS = []; // [{ user_id, event_id, created_at }] — "Je suis intéressé" sur propositions étudiantes

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
  const events      = EVENTS.filter(e => e.university_id === u.id && e.status === 'published');

  // Optional: detect current viewer via Bearer token (best-effort, no error if absent)
  let viewerId = null;
  const token = req.headers.authorization?.split(' ')[1];
  if (token) { try { viewerId = jwt.verify(token, JWT_SECRET).id; } catch {} }

  const submissions = SUBMITTED_EVENTS
    .filter(e => e.university_id === u.id)
    .map(e => {
      const count = INTERESTS.filter(i => i.event_id === e.id).length;
      const submitter = USERS.find(u => u.id === e.submitted_by);
      const organizerStats = SUBMITTED_EVENTS.filter(s => s.submitted_by === e.submitted_by);
      // Threshold: 25% of capacity to be "validated by community"
      const threshold = Math.max(10, Math.floor(e.capacity * 0.25));
      return {
        ...e,
        interest_count: count,
        interest_threshold: threshold,
        community_validated: count >= threshold,
        i_am_interested: viewerId ? INTERESTS.some(i => i.event_id === e.id && i.user_id === viewerId) : false,
        organizer_level:
          organizerStats.length >= 5 ? 'legend'
          : organizerStats.length >= 2 ? 'pro'
          : 'rookie',
        organizer_event_count: organizerStats.length,
      };
    });
  res.json({ university: u, events, submissions });
});

/* ── Mes propositions (dashboard étudiant organisateur) ── */
app.get('/api/submissions/mine', auth, (req, res) => {
  const list = SUBMITTED_EVENTS
    .filter(e => e.submitted_by === req.user.id)
    .map(e => ({
      ...e,
      interest_count: INTERESTS.filter(i => i.event_id === e.id).length,
      interest_threshold: Math.max(10, Math.floor(e.capacity * 0.25)),
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const stats = {
    total: list.length,
    total_interests: list.reduce((s, e) => s + e.interest_count, 0),
    validated: list.filter(e => e.interest_count >= Math.max(10, Math.floor(e.capacity * 0.25))).length,
    organizer_level:
      list.length >= 5 ? 'legend' :
      list.length >= 2 ? 'pro' : 'rookie',
  };
  res.json({ submissions: list, stats });
});

/* ── Édition d'une proposition (seulement par son auteur) ── */
app.patch('/api/submissions/:id', auth, (req, res) => {
  const idx = SUBMITTED_EVENTS.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Proposition non trouvée' });
  if (SUBMITTED_EVENTS[idx].submitted_by !== req.user.id) {
    return res.status(403).json({ error: 'Vous n\'êtes pas l\'auteur de cette proposition' });
  }
  const allowed = ['title','type','venue','city','date','time','price_standard','price_vip','capacity','description','dress_code','image_url','logo_url','contact_name','contact_phone','contact_email','website_url','team_members'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) SUBMITTED_EVENTS[idx][key] = req.body[key];
  }
  SUBMITTED_EVENTS[idx].updated_at = new Date().toISOString();
  res.json(SUBMITTED_EVENTS[idx]);
});

/* ── Suppression d'une proposition (seulement par son auteur) ── */
app.delete('/api/submissions/:id', auth, (req, res) => {
  const idx = SUBMITTED_EVENTS.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Proposition non trouvée' });
  if (SUBMITTED_EVENTS[idx].submitted_by !== req.user.id) {
    return res.status(403).json({ error: 'Vous n\'êtes pas l\'auteur de cette proposition' });
  }
  SUBMITTED_EVENTS.splice(idx, 1);
  // Clean up related interests
  for (let i = INTERESTS.length - 1; i >= 0; i--) {
    if (INTERESTS[i].event_id === req.params.id) INTERESTS.splice(i, 1);
  }
  res.json({ deleted: true });
});

/* ── Soumission d'événement par un étudiant ── */
app.post('/api/events/submit', auth, (req, res) => {
  const {
    title, type, venue, city, date, time,
    price_standard, price_vip, capacity,
    description, dress_code, image_url, logo_url,
    contact_name, contact_phone, contact_email, website_url,
    university_id, team_members,
  } = req.body;

  if (!title || !type || !venue || !city || !date || !time || !price_standard || !capacity || !description) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const uni = UNIVERSITIES.find(u => u.id === university_id);
  const submitter = USERS.find(u => u.id === req.user.id);

  const event = {
    id: uuidv4(),
    title,
    description,
    type: type || 'universite',
    university_id: university_id || null,
    university_name: uni?.name || null,
    university_short_name: uni?.short_name || null,
    university_color: uni?.color || null,
    venue,
    city,
    date,
    time,
    price_standard: Number(price_standard) || 0,
    price_vip: Number(price_vip) || 0,
    capacity: Number(capacity) || 100,
    tickets_sold: 0,
    dress_code: dress_code || null,
    image_url: image_url || null,
    logo_url: logo_url || null,
    contact_name: contact_name || null,
    contact_phone: contact_phone || null,
    contact_email: contact_email || null,
    website_url: website_url || null,
    status: 'pending',
    submitted_by: req.user.id,
    submitter_name: submitter?.name || 'Étudiant',
    team_members: Array.isArray(team_members) ? team_members : [],
    created_at: new Date().toISOString(),
  };

  SUBMITTED_EVENTS.push(event);
  res.status(201).json(event);
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

/* ── Intérêts communautaires (sur propositions étudiantes) ── */
app.post('/api/submissions/:id/interest', auth, (req, res) => {
  const sub = SUBMITTED_EVENTS.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Proposition non trouvée' });
  const already = INTERESTS.find(i => i.user_id === req.user.id && i.event_id === sub.id);
  if (already) return res.json({ interested: true, already: true });
  INTERESTS.push({ user_id: req.user.id, event_id: sub.id, created_at: new Date().toISOString() });
  const count = INTERESTS.filter(i => i.event_id === sub.id).length;
  res.status(201).json({ interested: true, interest_count: count });
});

app.delete('/api/submissions/:id/interest', auth, (req, res) => {
  const idx = INTERESTS.findIndex(i => i.user_id === req.user.id && i.event_id === req.params.id);
  if (idx >= 0) INTERESTS.splice(idx, 1);
  const count = INTERESTS.filter(i => i.event_id === req.params.id).length;
  res.json({ interested: false, interest_count: count });
});

/* ── Favoris ── */
app.get('/api/favorites', auth, (req, res) => {
  const ids = FAVORITES.filter(f => f.user_id === req.user.id).map(f => f.event_id);
  res.json({ event_ids: ids });
});

app.get('/api/favorites/events', auth, (req, res) => {
  const ids = new Set(FAVORITES.filter(f => f.user_id === req.user.id).map(f => f.event_id));
  const events = [...EVENTS, ...SUBMITTED_EVENTS].filter(e => ids.has(e.id));
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(events);
});

app.post('/api/favorites/:eventId', auth, (req, res) => {
  const exists = FAVORITES.find(f => f.user_id === req.user.id && f.event_id === req.params.eventId);
  if (exists) return res.json({ favorited: true, already: true });
  FAVORITES.push({ user_id: req.user.id, event_id: req.params.eventId, created_at: new Date().toISOString() });
  res.status(201).json({ favorited: true });
});

app.delete('/api/favorites/:eventId', auth, (req, res) => {
  const idx = FAVORITES.findIndex(f => f.user_id === req.user.id && f.event_id === req.params.eventId);
  if (idx >= 0) FAVORITES.splice(idx, 1);
  res.json({ favorited: false });
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
