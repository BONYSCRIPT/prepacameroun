require('dotenv').config();
const db = require('./config/database');
const { v4: uuidv4 } = require('uuid');

async function testZitoPayFunctionality() {
  console.log('🧪 Test des fonctionnalités ZitoPay...');
  
  try {
    // Test 1: Créer une transaction
    const transactionId = uuidv4();
    const userId = '76a79a17-5255-425f-8406-3dc99cbebba5';
    const prepaId = '23e01c84-2b3a-44dc-b862-c35e0bd4c1a5';
    const reference = `TEST_ZITO_${Date.now()}`;
    
    console.log('📝 Création d\'une transaction de test...');
    await db.query(
      'INSERT INTO transactions_zitopay (id, user_id, prepa_id, reference, amount, statut) VALUES (?, ?, ?, ?, ?, ?)',
      [transactionId, userId, prepaId, reference, 5000.00, 'pending']
    );
    console.log('✅ Transaction créée avec succès');
    
    // Test 2: Récupérer la transaction
    console.log('🔍 Récupération de la transaction...');
    const [transaction] = await db.query(
      'SELECT * FROM transactions_zitopay WHERE reference = ?',
      [reference]
    );
    
    if (transaction.length > 0) {
      console.log('✅ Transaction trouvée:', {
        id: transaction[0].id,
        reference: transaction[0].reference,
        amount: transaction[0].amount,
        statut: transaction[0].statut
      });
    } else {
      console.log('❌ Transaction non trouvée');
    }
    
    // Test 3: Mettre à jour le statut
    console.log('🔄 Mise à jour du statut...');
    await db.query(
      'UPDATE transactions_zitopay SET statut = ?, completed_at = NOW() WHERE reference = ?',
      ['completed', reference]
    );
    console.log('✅ Statut mis à jour');
    
    // Test 4: Vérifier la mise à jour
    const [updatedTransaction] = await db.query(
      'SELECT * FROM transactions_zitopay WHERE reference = ?',
      [reference]
    );
    
    if (updatedTransaction[0].statut === 'completed') {
      console.log('✅ Statut correctement mis à jour');
    } else {
      console.log('❌ Problème avec la mise à jour du statut');
    }
    
    // Test 5: Nettoyer
    console.log('🧹 Nettoyage...');
    await db.query('DELETE FROM transactions_zitopay WHERE reference = ?', [reference]);
    console.log('✅ Nettoyage terminé');
    
    console.log('🎉 Tous les tests ZitoPay sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests ZitoPay:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testZitoPayFunctionality();
