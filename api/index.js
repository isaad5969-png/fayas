// Point d'entrée serverless Vercel pour l'API Express.
// server.js exporte l'app Express (sans app.listen quand require()).
// Vercel utilise l'app comme handler (req, res).
//
// ⚠️ Nécessite DATABASE_URL (Neon/PostgreSQL) : en serverless il n'y a pas
// de processus persistant, donc la base in-memory (pg-mem) ne convient pas.
module.exports = require('../backend/server.js')
