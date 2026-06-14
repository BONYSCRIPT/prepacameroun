const Joi = require('joi');

// Schéma de validation pour la création de leçons
const createLessonSchema = Joi.object({
  titre: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .required()
    .messages({
      'string.min': 'Le titre doit contenir au moins 3 caractères',
      'string.max': 'Le titre ne doit pas dépasser 100 caractères',
      'string.pattern.base': 'Le titre ne doit contenir que des lettres, des chiffres, des espaces, des tirets et des underscores',
      'any.required': 'Le titre est requis'
    }),
  contenu: Joi.string().allow('').optional(),
  discipline_id: Joi.string().required(),
  numero_page: Joi.number().integer().min(1).required()
});

// Schéma de validation pour la mise à jour de leçons
const updateLessonSchema = Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).optional(),
    titre: Joi.string()
      .min(3)
      .max(100)
      .pattern(/^[a-zA-Z0-9\s\-_]+$/)
      .messages({
        'string.min': 'Le titre doit contenir au moins 3 caractères',
        'string.max': 'Le titre ne doit pas dépasser 100 caractères',
        'string.pattern.base': 'Le titre ne doit contenir que des lettres, des chiffres, des espaces, des tirets et des underscores'
      }),
    contenu: Joi.string().allow('').optional(),
    discipline_id: Joi.string().optional(),
    numero_page: Joi.number().integer().min(1).optional()
  }).min(1);
  

// Middleware de validation pour la création
const validateCreateLesson = (req, res, next) => {
  const { error } = createLessonSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }
  next();
};

// Middleware de validation pour la mise à jour
const validateUpdateLesson = (req, res, next) => {
  const { error } = updateLessonSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }
  next();
};

module.exports = {
  validateCreateLesson,
  validateUpdateLesson
};
