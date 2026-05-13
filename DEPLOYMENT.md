# Deploiement

## Backend sur Render

1. Pousse le projet sur GitHub.
2. Dans Render, cree un nouveau **Blueprint** depuis ce repo.
3. Render lira `render.yaml` et creera le service `billetterie-maroc-api`.
4. Dans les variables d'environnement Render, configure:
   - `ALLOWED_ORIGINS=https://ton-site.vercel.app`
   - `JWT_SECRET=une-valeur-longue-et-secrete`
5. Apres deploy, garde l'URL backend, par exemple:
   `https://billetterie-maroc-api.onrender.com`

## Frontend sur Vercel

1. Importe le meme repo dans Vercel.
2. Configure le projet avec:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Ajoute la variable d'environnement:
   - `VITE_API_URL=https://billetterie-maroc-api.onrender.com`
4. Lance le deploy.

## Verification

- Frontend: ouvre l'URL Vercel.
- Backend: ouvre `https://ton-backend/api/health`.
- CORS: si le frontend ne charge pas les donnees, verifie que `ALLOWED_ORIGINS` contient exactement l'URL Vercel.
