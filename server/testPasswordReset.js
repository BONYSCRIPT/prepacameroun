require('dotenv').config();
const { sendPasswordResetEmail } = require('./services/emailService');
const db = require('./config/database');

async function testPasswordResetFlow() {
  console.log('🧪 Test complet du flux de réinitialisation de mot de passe...\n');
  
  try {
    // 1. Vérifier la structure de la base de données
    console.log('1️⃣ Vérification de la structure de la base de données...');
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND TABLE_SCHEMA = '${process.env.DB_NAME}'
      AND COLUMN_NAME IN ('reset_token', 'reset_token_expires')
    `);
    
    if (columns.length < 2) {
      console.log('❌ Colonnes manquantes dans la table users');
      console.log('Colonnes trouvées:', columns.map(c => c.COLUMN_NAME));
      console.log('\n📝 Exécutez cette requête SQL :');
      console.log(`
ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expires TIMESTAMP NULL;
      `);
      return;
    }
    console.log('✅ Structure de la base de données OK\n');

    // 2. Vérifier qu'un utilisateur test existe
    console.log('2️⃣ Vérification de l\'utilisateur test...');
    const testEmail = process.env.GMAIL_USER; // Utiliser votre propre email pour le test
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [testEmail]);
    
    if (users.length === 0) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email: ${testEmail}`);
      console.log('Créez un utilisateur test ou utilisez un email existant');
      return;
    }
    console.log(`✅ Utilisateur test trouvé: ${users[0].username}\n`);

    // 3. Tester l'envoi d'email
    console.log('3️⃣ Test d\'envoi d\'email de réinitialisation...');
    const testToken = 'test-token-' + Date.now();
    
    const emailResult = await sendPasswordResetEmail(
      testEmail,
      testToken,
      users[0].username
    );
    
    console.log('✅ Email envoyé avec succès !');
    console.log('📧 Vérifiez votre boîte mail:', testEmail);
    console.log('🔗 Token de test:', testToken);
    console.log('\n4️⃣ Informations de l\'email envoyé:');
    console.log('- Message ID:', emailResult.messageId);
    console.log('- Destinataire:', emailResult.accepted);
    
    // 4. Tester la sauvegarde du token en base
    console.log('\n5️⃣ Test de sauvegarde du token en base...');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 heure
    
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [testToken, resetTokenExpires, testEmail]
    );
    
    // Vérifier que le token a été sauvegardé
    const [updatedUser] = await db.query(
      'SELECT reset_token, reset_token_expires FROM users WHERE email = ?',
      [testEmail]
    );
    
    if (updatedUser[0].reset_token === testToken) {
      console.log('✅ Token sauvegardé en base avec succès');
      console.log('⏰ Expiration:', updatedUser[0].reset_token_expires);
    } else {
      console.log('❌ Erreur lors de la sauvegarde du token');
    }

    console.log('\n🎉 Test complet réussi !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Vérifiez votre email');
    console.log('2. Testez le lien de réinitialisation');
    console.log('3. Nous pourrons passer au frontend');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Problème d\'authentification Gmail :');
      console.log('- Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD dans .env');
      console.log('- Assurez-vous d\'utiliser un mot de passe d\'application');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Problème de connexion :');
      console.log('- Vérifiez votre connexion internet');
      console.log('- Vérifiez les paramètres de sécurité Gmail');
    }
  }
}

// Exécuter le test
testPasswordResetFlow();
