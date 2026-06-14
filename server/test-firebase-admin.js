require('dotenv').config();
const { admin, verifyFirebaseToken } = require('./config/firebase-admin');

console.log('🧪 Test de la configuration Firebase Admin...');

// Test de base
try {
  console.log('✅ Firebase Admin SDK chargé avec succès');
  console.log('📋 Project ID:', admin.app().options.projectId);
  console.log('📧 Client Email:', admin.app().options.credential.clientEmail);
  
  // Test de connexion
  admin.auth().listUsers(1)
    .then(() => {
      console.log('✅ Connexion Firebase Auth réussie !');
      console.log('🎉 Configuration Firebase Admin terminée avec succès !');
    })
    .catch((error) => {
      console.error('❌ Erreur de connexion Firebase Auth:', error.message);
    });
    
} catch (error) {
  console.error('❌ Erreur lors du test Firebase Admin:', error);
}
