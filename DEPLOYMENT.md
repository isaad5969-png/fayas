# Guide de Déploiement — Fayas

## Vue d'ensemble

Deux options. **Option A** = tout sur Vercel (1 seul service). **Option B** = Vercel + Render (backend séparé).

| Composant | Option A (tout Vercel) | Option B (Vercel + Render) |
|-----------|------------------------|----------------------------|
| Frontend  | Vercel | Vercel |
| Backend (API) | Vercel (fonction serverless) | Render (serveur Node) |
| Base de données | **Neon (obligatoire)** | Neon |

> ⚠️ Dans les deux cas, **Neon (PostgreSQL) est requis**. En serverless il n'y a pas de processus permanent : la base in-memory (`pg-mem`) ne persiste pas.

---

## 🟢 Option A — Tout sur Vercel (recommandée ici)

Le repo contient `vercel.json` + `api/index.js` qui exposent l'API Express en fonction serverless sous `/api`. Frontend et API vivent dans **un seul déploiement** (même domaine).

1. **Base Neon** : créez un projet sur [neon.tech](https://neon.tech) → copiez la **Connection String** (utilisez l'endpoint `-pooler` recommandé pour le serverless).
2. **Poussez sur GitHub** : `git push`.
3. **Vercel** → [vercel.com](https://vercel.com) → **Add New Project** → importez le repo. Vercel détecte `vercel.json` (ne changez rien).
4. **Variables d'environnement** dans Vercel :

   | Nom | Valeur | Pour |
   |-----|--------|------|
   | `DATABASE_URL` | `postgresql://...-pooler.../db?sslmode=require` | API |
   | `JWT_SECRET` | chaîne aléatoire longue (64+ car.) | API |
   | `ALLOWED_ORIGINS` | `https://votre-projet.vercel.app` | API |
   | `FRONTEND_URL` | `https://votre-projet.vercel.app` | API (liens reset) |
   | `VITE_GOOGLE_CLIENT_ID` | client ID Google *(optionnel)* | Build front |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` *(optionnel)* | Build front |
   | `GOOGLE_CLIENT_ID` / `STRIPE_SECRET_KEY` / `GMAIL_*` / `SMS_PROVIDER` | *(optionnels)* | API |

   > ❗ **NE définissez PAS `VITE_API_URL`** : l'API est sur le même domaine, le front appelle `/api` directement.

5. **Deploy**. Vérifiez : `https://votre-projet.vercel.app/api/health` → `{"status":"ok",...}`.

> Sans clés : **paiement** = mode démo (aucun débit), **OTP téléphone** = code affiché, **reset mot de passe** = lien renvoyé. Ajoutez les clés correspondantes pour passer en réel.

---

## 🔵 Option B — Vercel (frontend) + Render (backend)

| Composant | Hébergement | Coût |
|-----------|-------------|------|
| Frontend  | Vercel      | Gratuit |
| Backend   | Render      | Gratuit |
| Base de données | Neon (PostgreSQL) | Gratuit |

> Pour cette option, remplacez `vercel.json` par un build frontend simple (Root Directory `frontend`) et définissez `VITE_API_URL` vers l'URL Render. Étapes détaillées ci-dessous.

---

## Étape 1 — Base de données PostgreSQL (Neon)

1. Allez sur **[neon.tech](https://neon.tech)** → **Sign Up** (gratuit)
2. Cliquez **New Project** → donnez un nom (ex. `fayas-db`)
3. Région : choisissez **EU West** (proche du Maroc)
4. Copiez la **Connection String** qui ressemble à :
   ```
   postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require
   ```
5. Gardez cette URL — vous en aurez besoin pour le backend

> Le backend crée automatiquement toutes les tables, index et données de démo au premier démarrage.

---

## Étape 2 — Backend sur Render

1. Allez sur **[render.com](https://render.com)** → **Sign Up** avec GitHub
2. Dashboard → **New** → **Blueprint**
3. Connectez votre repo GitHub (poussez d'abord avec `git push`)
4. Render détecte `render.yaml` et crée le service `billetterie-maroc-api`
5. Configurez ces **variables d'environnement** dans Render :

   | Variable | Valeur |
   |----------|--------|
   | `DATABASE_URL` | `postgresql://USER:PASSWORD@HOST.neon.tech/...` |
   | `JWT_SECRET` | Une chaîne longue aléatoire (ex. 64 caractères) |
   | `ALLOWED_ORIGINS` | `https://votre-projet.vercel.app` |
   | `GOOGLE_CLIENT_ID` | Votre client ID Google (optionnel) |

6. Cliquez **Apply** → attendez que le build soit **Live** (~2 min)
7. Copiez l'URL de l'API : `https://billetterie-maroc-api.onrender.com`

> **Vérification** : ouvrez `https://votre-api.onrender.com/api/health`
> Vous devez voir : `{"status":"ok","version":"1.2",...}`

---

## Étape 3 — Frontend sur Vercel

### Méthode recommandée (automatique avec `vercel.json`)

1. Allez sur **[vercel.com](https://vercel.com)** → **Sign Up** avec GitHub
2. Dashboard → **Add New Project**
3. Sélectionnez votre repo GitHub
4. Vercel détecte automatiquement la config — **ne changez rien** dans les paramètres de build
5. Ajoutez ces **variables d'environnement** :

   | Nom | Valeur |
   |-----|--------|
   | `VITE_API_URL` | `https://votre-api.onrender.com` |
   | `VITE_GOOGLE_CLIENT_ID` | Votre client ID Google (optionnel) |

6. Cliquez **Deploy** → attendez ~1 min
7. Votre URL sera : `https://votre-projet.vercel.app`

### Méthode alternative (si vous ne voulez déployer que le frontend)

Même étapes, mais configurez :
- **Root Directory** : `frontend`
- **Build Command** : `npm run build`
- **Output Directory** : `dist`

---

## Étape 4 — Relier frontend et backend

1. Dans **Render**, mettez à jour `ALLOWED_ORIGINS` avec votre vraie URL Vercel :
   ```
   ALLOWED_ORIGINS=https://votre-projet.vercel.app
   ```
2. Dans **Vercel**, vérifiez que `VITE_API_URL` pointe bien vers votre backend Render
3. Redéployez les deux si vous avez changé des variables

---

## Connexion Google (optionnel)

1. Allez sur **[console.cloud.google.com](https://console.cloud.google.com)**
2. Créez un projet → **API & Services** → **Credentials** → **Create OAuth 2.0 Client**
3. Type : **Web application**
4. **Authorized JavaScript origins** :
   ```
   http://localhost:5173
   https://votre-projet.vercel.app
   ```
5. Copiez le **Client ID** et ajoutez-le aux deux services :
   - Vercel : `VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com`
   - Render : `GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com`

---

## Vérification finale

| Test | URL |
|------|-----|
| Frontend chargé | `https://votre-projet.vercel.app` |
| API health | `https://votre-api.onrender.com/api/health` |
| Liste des événements | `https://votre-api.onrender.com/api/events` |
| Admin panel | `https://votre-projet.vercel.app/admin` |

**Compte admin par défaut** (à changer après le premier login) :
```
Email    : admin@billetterie.ma
Password : Admin123!
```

---

## Variables d'environnement — Résumé

### Backend (Render)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=une-longue-chaine-secrete-de-64-caracteres
ALLOWED_ORIGINS=https://votre-projet.vercel.app
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com   # optionnel
NODE_ENV=production
```

### Frontend (Vercel)
```env
VITE_API_URL=https://votre-api.onrender.com
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com   # optionnel
```
