const db = require('../config/database');
const logger = require('../utils/logger');

const validateResetPasswordToken = async (req, res, next) => {
  const { token } = req.body;

  try {
    // Vérifier si le token est présent
    if (!token) {
      logger.warn('❌ Token de réinitialisation manquant');
      return res.status(400).json({ 
        success: false, 
        message: "Token de réinitialisation requis" 
      });
    }

    // Rechercher l'utilisateur avec le token et la date d'expiration
    const [users] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      logger.warn('❌ Token de réinitialisation invalide ou expiré:', token);
      return res.status(400).json({ 
        success: false, 
        message: "Token de réinitialisation invalide ou expiré. Veuillez refaire une demande de réinitialisation." 
      });
    }

    // Ajouter l'utilisateur à l'objet de requête pour une utilisation ultérieure
    req.user = users[0];

    next();
  } catch (error) {
    logger.error('❌ Erreur lors de la vérification du token de réinitialisation:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la vérification du token. Veuillez réessayer." 
    });
  }
};

module.exports = { validateResetPasswordToken };