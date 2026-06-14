require('dotenv').config();
const axios = require('axios');

const BASE_URL = `http://localhost:${process.env.PORT || 8000}`;

async function testPasswordResetAPI() {
  console.log('🧪 Test de l\'API de réinitialisation de mot de passe...\n');
  
  try {
    // 1. Test de la demande de réinitialisation
    console.log('1️⃣ Test POST /api/users/forgot-password');
    const forgotResponse = await axios.post(`${BASE_URL}/api/users/forgot-password`, {
      email: 'prepacameroun@gmail.com'
    });
    
    console.log('✅ Réponse:', forgotResponse.data);
    
    // 2. Test avec un token fictif
    console.log('\n2️⃣ Test GET /api/users/verify-reset-token/fake-token');
    try {
      const verifyResponse = await axios.get(`${BASE_URL}/api/users/verify-reset-token/fake-token`);
      console.log('Réponse:', verifyResponse.data);
    } catch (error) {
      console.log('❌ Token invalide (normal):', error.response?.data?.message);
    }
    
    // 3. Test avec un vrai token (récupéré de la base)
    console.log('\n3️⃣ Test avec un token réel de la base...');
    // Ici on pourrait récupérer le token de la base pour tester
    
    console.log('\n✅ Tests API terminés');
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error.response?.data || error.message);
  }
}

testPasswordResetAPI();

