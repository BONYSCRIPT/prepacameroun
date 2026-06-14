const Joi = require('joi');
const logger = require('../utils/logger');

// Schéma de validation pour la connexion Firebase
const firebaseLoginSchema = Joi.object({
  idToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Le token Firebase est requis',
      'any.required': 'Le token Firebase est requis'
    })
});

// Middleware de validation pour Firebase login
const validateFirebaseLogin = (req, res, next) => {
  logger.debug('?? Middleware validateFirebaseLogin activé');
  logger.debug('?? req.body:', req.body);

  const { error } = firebaseLoginSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    logger.error('? Erreur de validation Firebase:', errors);
    return res.status(400).json({ 
      success: false,
      message: 'Données de connexion Firebase invalides',
      errors,
      validationError: error.details
    });
  }
  
  return next();
};

module.exports = {
  validateFirebaseLogin,
  firebaseLoginSchema
};