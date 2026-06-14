require('dotenv').config();
const { sendPasswordResetEmail } = require('./services/emailService');

async function testEmailService() {
  console.log('🧪 Test du service email...');
  console.log('Gmail User:', process.env.GMAIL_USER);
  console.log('Gmail Password configuré:', process.env.GMAIL_APP_PASSWORD ? 'Oui' : 'Non');
  
  try {
    console.log('\n📧 Test d\'envoi d\'email...');
    const testResult = await sendPasswordResetEmail(
      process.env.GMAIL_USER,
      'test-token-123456789',
      'Utilisateur Test'
    );
    
    console.log('✅ Email de test envoyé avec succès !');
    console.log('📧 Vérifiez votre boîte mail:', process.env.GMAIL_USER);
    console.log('Message ID:', testResult.messageId);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error.message);
  }
}

testEmailService();

