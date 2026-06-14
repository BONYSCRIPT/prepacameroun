const logger = require('./logger');

const errorHandler = (error, req, res, next) => {
  logger.error('? Erreur non gérée:', error); // Enregistre l'erreur complète avec Winston
  console.error('? Erreur non gérée:', error); // Ajoute console.error pour PM2

  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: error.message });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Non autorisé' });
  }

  // Ajoute une gestion plus spécifique des erreurs, si nécessaire
  if (error.message === 'Email non vérifié') {
    return res.status(403).json({ success: false, code: 'EMAIL_UNVERIFIED', message: error.message });
  }

  const status = error.status || 500;
  res.status(status).json({
    success: false,
    code: status === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR',
    message: status === 500 ? 'Erreur interne du serveur' : error.message
  });
};

module.exports = errorHandler;