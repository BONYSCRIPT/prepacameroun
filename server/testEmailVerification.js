require('dotenv').config();
const { sendVerificationEmail, generateVerificationToken, testConnection } = require('./services/emailVerificationService');

async function testEmailVerificationService() {
  console.log('🧪 Test du service de vérification email...');
  console.log('Gmail User:', process.env.GMAIL_USER);
  console.log('Gmail Password configuré:', process.env.GMAIL_APP_PASSWORD ? 'Oui' : 'Non');
  
  try {
    // Test de connexion
    console.log('\n1️⃣ Test de connexion SMTP...');
    const connectionTest = await testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Connexion SMTP réussie');
      
      // Test d'envoi d'email de vérification
      console.log('\n2️⃣ Test d\'envoi d\'email de vérification...');
      const testToken = generateVerificationToken();
      console.log('Token généré:', testToken);
      
      const testResult = await sendVerificationEmail(
        process.env.GMAIL_USER, // Envoyer à soi-même pour test
        testToken,
        'Utilisateur Test'
      );
      
      console.log('✅ Email de vérification envoyé avec succès !');
      console.log('📧 Vérifiez votre boîte mail:', process.env.GMAIL_USER);
      console.log('🔗 URL de test:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${testToken}`);
      
    } else {
      console.log('❌ Erreur connexion SMTP:', connectionTest.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testEmailVerificationService();
