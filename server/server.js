// Charge les variables d'environnement du fichier .env au tout début
require('dotenv').config();

// Importe l'application Express configurée dans app.js
const app = require('./app');
//require('./cronJobs');


const PORT = process.env.PORT || 8005; // Utilise le port du .env ou 8005 par défaut

console.log('-------------------------------------------');
console.log('--- DÉMARRAGE DU SERVEUR PREPACAMEROUN ---');
console.log(`--- PORT CIBLE: ${PORT} ---`);
console.log(`--- DATE: ${new Date().toLocaleString()} ---`);
console.log('-------------------------------------------');

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SUCCÈS: Serveur en écoute sur http://0.0.0.0:${PORT}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`💥 Erreur : Le port ${PORT} est déjà utilisé par un autre processus.`);
    console.error(`👉 Solutions : Tuez le processus node existant ou changez le port dans le fichier .env`);
    process.exit(1);
  } else {
    console.error('Erreur serveur:', e);
  }
});
