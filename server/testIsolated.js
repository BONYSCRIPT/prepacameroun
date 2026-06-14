// Test complètement isolé - PAS de dotenv
const nodemailer = require('nodemailer');

// REMPLACEZ par vos vraies valeurs
const EMAIL = 'bonaventurezogo7@gmail.com';
const PASSWORD = 'bkrk byfm pdfw iqvd'; // Votre mot de passe d'application

console.log('=== TEST ISOLÉ ===');
console.log('Email:', EMAIL);
console.log('Password:', PASSWORD);
console.log('Password length:', PASSWORD.length);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: PASSWORD
  },
  debug: true,
  logger: true
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erreur:', error.message);
  } else {
    console.log('✅ SUCCÈS ! Gmail fonctionne !');
  }
});
