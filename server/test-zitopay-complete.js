require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function testCompleteZitoPayFlow() {
  console.log('🚀 Test complet du flux ZitoPay...');
  
  try {
    // Étape 1: Créer un utilisateur de test
    console.log('👤 Création d\'un utilisateur de test...');
    const registerResponse = await axios.post(`${BASE_URL}/users/register`, {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@gmail.com`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!'
    });
    
    console.log('✅ Utilisateur créé avec succès');
    const token = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    
    // Étape 2: Initialiser une transaction ZitoPay
    console.log('💳 Initialisation d\'une transaction ZitoPay...');
    const initResponse = await axios.post(`${BASE_URL}/payment/zitopay/init`, {
      prepaId: '23e01c84-2b3a-44dc-b862-c35e0bd4c1a5',
      amount: 8000,
      reference: `TEST_COMPLETE_${Date.now()}`,
      prepaNom: 'ISSEA'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Transaction initialisée:', {
      transactionId: initResponse.data.transactionId,
      reference: initResponse.data.reference
    });
    
    // Étape 3: Simuler la vérification du paiement
    console.log('🔍 Simulation de la vérification du paiement...');
    const verifyResponse = await axios.post(`${BASE_URL}/payment/zitopay/verify`, {
      ref: initResponse.data.reference,
      status: 'success',
      payment_method: 'mobile_money',
      prepaId: '23e01c84-2b3a-44dc-b862-c35e0bd4c1a5'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Paiement vérifié:', verifyResponse.data);
    
    // Étape 4: Vérifier les inscriptions de l'utilisateur
    console.log('📋 Vérification des inscriptions...');
    const inscriptionsResponse = await axios.get(`${BASE_URL}/inscriptions/user/inscriptions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Inscriptions récupérées:', inscriptionsResponse.data.length, 'inscription(s)');
    
    console.log('🎉 Test complet réussi ! Le flux ZitoPay fonctionne parfaitement.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testCompleteZitoPayFlow();
