require('dotenv').config();
const db = require('./config/database');

async function testDatabaseConnection() {
  console.log('🔍 Test de connexion à la base de données...');
  
  try {
    // Test de connexion basique
    const [result] = await db.query('SELECT 1 as test');
    console.log('✅ Connexion à la base de données réussie');
    
    // Test de la table transactions_zitopay
    const [tables] = await db.query("SHOW TABLES LIKE 'transactions_zitopay'");
    if (tables.length > 0) {
      console.log('✅ Table transactions_zitopay trouvée');
      
      // Test d'insertion
      const testId = 'test-' + Date.now();
      const testUserId = '76a79a17-5255-425f-8406-3dc99cbebba5'; // ID utilisateur existant
      const testPrepaId = '23e01c84-2b3a-44dc-b862-c35e0bd4c1a5'; // ID prepa existant
      
      await db.query(
        'INSERT INTO transactions_zitopay (id, user_id, prepa_id, reference, amount, statut) VALUES (?, ?, ?, ?, ?, ?)',
        [testId, testUserId, testPrepaId, `TEST_${Date.now()}`, 1000.00, 'pending']
      );
      
      console.log('✅ Insertion de test réussie');
      
      // Nettoyer le test
      await db.query('DELETE FROM transactions_zitopay WHERE id = ?', [testId]);
      console.log('✅ Nettoyage effectué');
      
    } else {
      console.log('❌ Table transactions_zitopay non trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testDatabaseConnection();
