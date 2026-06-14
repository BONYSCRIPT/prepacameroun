const Joi = require('joi');

const prepaSchema = Joi.object({
  nom: Joi.string()
    .required()
    .min(3)
    .messages({
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit contenir au moins 3 caractères'
    }),
  description: Joi.string()
    .required()
    .messages({
      'string.empty': 'La description est requise'
    }),
  prix: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Le prix doit être un nombre',
      'number.positive': 'Le prix doit être positif',
      'any.required': 'Le prix est requis'
    }),
  auteur: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.empty': 'L\'identifiant de l\'auteur est requis',
      'string.guid': 'L\'identifiant de l\'auteur doit être un UUID valide',
      'any.required': 'L\'identifiant de l\'auteur est requis'
    })
});

const updatePrepaSchema = Joi.object({
  nom: Joi.string()
    .min(3)
    .messages({
      'string.min': 'Le nom doit contenir au moins 3 caractères'
    }),
  description: Joi.string(),
  prix: Joi.number()
    .positive()
    .messages({
      'number.base': 'Le prix doit être un nombre',
      'number.positive': 'Le prix doit être positif'
    })
});

const validatePrepa = (prepa) => {
  return prepaSchema.validate(prepa, { abortEarly: false });
};

const validateUpdatePrepa = (prepa) => {
  return updatePrepaSchema.validate(prepa, { abortEarly: false });
};

const validatePrepaMiddleware = (req, res, next) => {
  const { error } = validatePrepa(req.body);
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    console.error(errors);
    return res.status(400).json({ errors });
  }
  next();
};

const validateUpdatePrepaMiddleware = (req, res, next) => {
  const { error } = validateUpdatePrepa(req.body);
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = {
  prepaSchema,
  updatePrepaSchema,
  validatePrepa,
  validateUpdatePrepa,
  validatePrepaMiddleware,
  validateUpdatePrepaMiddleware
};
