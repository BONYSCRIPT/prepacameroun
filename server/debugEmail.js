require('dotenv').config();

console.log('=== DÉBOGAGE EMAIL ===');
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD);
console.log('Longueur du mot de passe:', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 'undefined');
console.log('Contient des espaces:', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.includes(' ') : 'undefined');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  debug: true, // Active le mode debug
  logger: true // Active les logs détaillés
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erreur de vérification:', error);
  } else {
    console.log('✅ Serveur prêt à envoyer des emails');
  }
});
