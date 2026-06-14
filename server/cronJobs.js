// Fichier: cronJobs.js
// Version: 1.0 - Corrigée et sécurisée
// Description: Planifie les tâches récurrentes

const cron = require('node-cron');
const updateInscriptionStatus = require('./scripts/updateInscriptionStatus');

// Fonction pour exécuter la mise à jour avec gestion d'erreur
async function runUpdateInscriptions() {
  console.log('Démarrage de la mise à jour des statuts d\'inscription');
  try {
    await updateInscriptionStatus();
    console.log('Statuts des inscriptions mis à jour avec succès');
  } catch (error) {
    console.error('Échec de la mise à jour des statuts d\'inscription:', error);
  }
}

// Exécution tous les jours à minuit
cron.schedule('0 0 * * *', runUpdateInscriptions);

// Exécuter également au démarrage du serveur, mais avec un délai
setTimeout(() => {
  console.log('Exécution initiale de la mise à jour des statuts d\'inscription');
  runUpdateInscriptions();
}, 30000); // Attendre 30 secondes après le démarrage

console.log('Planificateur de tâches initialisé');
