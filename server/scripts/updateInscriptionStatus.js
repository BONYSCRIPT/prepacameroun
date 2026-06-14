// Fichier: updateInscriptionStatus.js
// Version: 1.0 - Corrigée et sécurisée
// Description: Met à jour le statut des inscriptions expirées

const db = require('../config/database');

/**
 * Met à jour le statut des inscriptions expirées
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
async function updateInscriptionStatus() {
  console.log('Exécution de la fonction updateInscriptionStatus');
  const currentDate = new Date();

  try {
    // Mise à jour des inscriptions expirées
    const [result] = await db.query(
      'UPDATE inscriptions SET statut = "expirée" WHERE date_expiration < ? AND statut = "active"',
      [currentDate]
    );

    console.log(`Mise à jour effectuée: ${result.affectedRows} inscription(s) modifiée(s)`);
    return result;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statuts d\'inscription:', error);
    throw error;
  }
}

// Exporter uniquement la fonction, sans l'exécuter automatiquement
module.exports = updateInscriptionStatus;
