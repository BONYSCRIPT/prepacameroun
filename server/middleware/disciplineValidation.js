const Joi = require('joi');

const createDisciplineSchema = Joi.object({
  nom: Joi.string()
    .required()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'Le nom de la discipline est requis',
      'string.min': 'Le nom doit contenir au moins 3 caractères',
      'string.max': 'Le nom ne doit pas dépasser 100 caractères'
    }),
  description: Joi.string()
    .required()
    .max(500)
    .messages({
      'string.empty': 'La description de la discipline est requise',
      'string.max': 'La description ne doit pas dépasser 500 caractères'
    }),
  prepa_concours_id: Joi.string().required()
});

const updateDisciplineSchema = Joi.object({
  nom: Joi.string()
    .required()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'Le nom de la discipline est requis',
      'string.min': 'Le nom doit contenir au moins 3 caractères',
      'string.max': 'Le nom ne doit pas dépasser 100 caractères'
    }),
  description: Joi.string()
    .required()
    .max(500)
    .messages({
      'string.empty': 'La description de la discipline est requise',
      'string.max': 'La description ne doit pas dépasser 500 caractères'
    })
});

const validateCreateDiscipline = (discipline) => {
  return createDisciplineSchema.validate(discipline, { abortEarly: false });
};

const validateUpdateDiscipline = (discipline) => {
  return updateDisciplineSchema.validate(discipline, { abortEarly: false });
};

const validateCreateDisciplineMiddleware = (req, res, next) => {
  const { error } = validateCreateDiscipline(req.body);
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({ errors });
  }
  next();
};

const validateUpdateDisciplineMiddleware = (req, res, next) => {
  const { error } = validateUpdateDiscipline(req.body);
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
  createDisciplineSchema,
  updateDisciplineSchema,
  validateCreateDiscipline,
  validateUpdateDiscipline,
  validateCreateDisciplineMiddleware,
  validateUpdateDisciplineMiddleware
};
