const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendPasswordResetEmail = async (email, resetToken, username) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"PrepaCameroun" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - PrepaCameroun',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">PrepaCameroun</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Réinitialisation de mot de passe</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">Bonjour <strong>${username}</strong>,</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe sur PrepaCameroun.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-size: 16px; font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>?? Important :</strong> Ce lien expirera dans <strong>1 heure</strong>.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6c757d;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email en toute sécurité.
          </p>
          
          <p style="font-size: 14px; color: #6c757d;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${resetUrl}" style="color: #007bff; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 12px; margin: 0;">
            L'équipe PrepaCameroun<br>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #007bff;">prepacameroun.com</a>
          </p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };

