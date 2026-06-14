const Joi = require('joi');

const createAncienSujetSchema = Joi.object({
  titre: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .required(),
  annee: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required(),
  contenu: Joi.string().allow('').optional(),
  corrige: Joi.string().allow('').optional(),
  discipline_id: Joi.string().required(),
  numero_page: Joi.number().integer().min(1).required()
});

const updateAncienSujetSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv4' }).optional(),
  titre: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/),
  annee: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear()),
  contenu: Joi.string().allow(''),
  corrige: Joi.string().allow(''),
  discipline_id: Joi.string(),
  numero_page: Joi.number().integer().min(1)
}).min(1);

const validateCreateAncienSujet = (req, res, next) => {
  const { error } = createAncienSujetSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }
  next();
};

const validateUpdateAncienSujet = (req, res, next) => {
  const { error } = updateAncienSujetSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }
  next();
};

module.exports = {
  validateCreateAncienSujet,
  validateUpdateAncienSujet
};
