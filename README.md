# Fayas — Plateforme de billetterie événementielle au Maroc

Application web complète pour la réservation de billets pour galas, soirées, concerts et événements universitaires au Maroc.

---

## Structure du projet

```
fayas/
├── backend/                    ← Serveur Node.js / Express
│   ├── config/
│   │   └── env.js              ← Chargement des variables d'environnement
│   ├── db/
│   │   ├── database.js         ← Connexion SQLite (production)
│   │   └── billetterie.db      ← Base de données locale
│   ├── middleware/
│   │   ├── auth.js             ← Vérification JWT
│   │   ├── asyncHandler.js     ← Gestion des erreurs async
│   │   └── rateLimit.js        ← Limitation de requêtes
│   ├── routes/
│   │   ├── events.js           ← GET/POST /api/events
│   │   ├── auth.js             ← POST /api/auth/login|register
│   │   ├── tickets.js          ← GET/POST /api/tickets
│   │   ├── universities.js     ← GET /api/universities
│   │   ├── admin.js            ← GET /api/admin/stats
│   │   ├── loyalty.js          ← GET /api/loyalty
│   │   └── payments.js         ← POST /api/payments
│   ├── services/
│   │   └── emailService.js     ← Envoi d'emails (confirmation billets)
│   ├── demo-server.js          ← Serveur DEMO (données in-memory, sans BDD)
│   ├── server.js               ← Serveur PRODUCTION (SQLite)
│   ├── .env                    ← Variables d'environnement (ne pas committer)
│   ├── .env.example            ← Exemple de configuration
│   └── package.json
│
├── frontend/                   ← Application React + Vite + Tailwind CSS
│   ├── public/
│   │   └── _redirects          ← Règles Netlify pour React Router
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        ← Client HTTP (base URL backend)
│   │   ├── components/
│   │   │   ├── Navbar.jsx      ← Navigation principale
│   │   │   ├── Footer.jsx      ← Pied de page
│   │   │   ├── EventCard.jsx   ← Carte d'événement
│   │   │   ├── EventMap.jsx    ← Carte Leaflet interactive
│   │   │   ├── CityGraphic.jsx ← Illustrations CSS des villes
│   │   │   ├── Icons.jsx       ← Bibliothèque d'icônes SVG
│   │   │   ├── FavoriteButton.jsx
│   │   │   ├── ShareButton.jsx
│   │   │   ├── HeroParticles.jsx
│   │   │   ├── RevenueCalculator.jsx
│   │   │   ├── EventTemplates.jsx
│   │   │   └── TeamMembers.jsx
│   │   ├── context/
│   │   │   ├── ThemeContext.jsx ← Dark/Light mode
│   │   │   └── FavoritesContext.jsx
│   │   ├── hooks/
│   │   │   ├── useScrollReveal.js
│   │   │   └── useCountUp.js
│   │   ├── pages/
│   │   │   ├── Home.jsx        ← Page d'accueil
│   │   │   ├── Events.jsx      ← Liste des événements + filtres
│   │   │   ├── EventDetail.jsx ← Détail d'un événement
│   │   │   ├── MapPage.jsx     ← Carte interactive /map
│   │   │   ├── Universities.jsx
│   │   │   ├── UniversityEvents.jsx
│   │   │   ├── SubmitEvent.jsx ← Soumettre un événement étudiant
│   │   │   ├── MyProposals.jsx
│   │   │   ├── Favorites.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Loyalty.jsx
│   │   │   └── Admin.jsx
│   │   ├── App.jsx             ← Routing principal
│   │   ├── main.jsx            ← Point d'entrée React
│   │   └── index.css           ← Styles globaux + design system
│   ├── dist/                   ← BUILD NETLIFY — glisser ce dossier sur Netlify
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── install.bat                 ← Installation automatique (Windows)
├── start.bat                   ← Démarrage rapide (Windows)
├── render.yaml                 ← Config déploiement Render (backend)
└── README.md                   ← Ce fichier
```

---

## Démarrage rapide

### 1. Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

Ou double-cliquer sur **`install.bat`** (Windows)

### 2. Lancer en mode démo (sans base de données)

```bash
# Terminal 1 — Backend démo
cd backend
node demo-server.js
# → http://localhost:5000/api

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

Ou double-cliquer sur **`start.bat`** (Windows)

### 3. Comptes de test

| Rôle  | Email                     | Mot de passe |
|-------|---------------------------|--------------|
| Admin | admin@billetterie.ma      | Admin123!    |
| User  | créer un compte librement |              |

---

## Déploiement Netlify (frontend)

1. `cd frontend && npm run build`
2. Glisser le dossier **`frontend/dist/`** sur [netlify.com](https://netlify.com)
3. Le fichier `_redirects` gère automatiquement les routes React

---

## Technologies

| Côté        | Stack                                          |
|-------------|------------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, React Router v6  |
| Carte       | Leaflet.js (tiles CartoDB dark)                |
| Animations  | Lenis smooth scroll, CSS keyframes             |
| Backend     | Node.js, Express, JWT, bcryptjs               |
| Base de données | SQLite (production) / In-memory (démo)    |
| Déploiement | Netlify (frontend) · Render (backend)          |

---

## Pages disponibles

| Route                        | Description                          |
|------------------------------|--------------------------------------|
| `/`                          | Accueil — hero, villes, événements   |
| `/events`                    | Tous les événements avec filtres     |
| `/events/:id`                | Détail + réservation                 |
| `/map`                       | Carte interactive du Maroc           |
| `/universities`              | Soirées universitaires               |
| `/universities/:id`          | Événements d'une université          |
| `/universities/:id/submit`   | Soumettre un événement étudiant      |
| `/my-proposals`              | Mes propositions                     |
| `/favorites`                 | Mes favoris                          |
| `/checkout`                  | Paiement                             |
| `/dashboard`                 | Mon compte                           |
| `/loyalty`                   | Programme FayasCoins                 |
| `/admin`                     | Panel administrateur                 |