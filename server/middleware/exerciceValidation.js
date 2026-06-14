const Joi = require('joi');

const createExerciceSchema = Joi.object({
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
  enonce: Joi.string().allow('').optional(),
  corrige: Joi.string().allow('').optional(),
  discipline_id: Joi.string().required(),
  numero_page: Joi.number().integer().min(1).required()
});

const updateExerciceSchema = Joi.object({
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
  enonce: Joi.string().allow(''),
  corrige: Joi.string().allow(''),
  discipline_id: Joi.string(),
  numero_page: Joi.number().integer().min(1)
}).min(1);

const validateCreateExercice = (req, res, next) => {
  const { error } = createExerciceSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }
  next();
};

const validateUpdateExercice = (req, res, next) => {
  console.log(req.body)
  const { error } = updateExerciceSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.log(error)
    console.log(error.details)
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }
  next();
};

module.exports = {
  validateCreateExercice,
  validateUpdateExercice
};
