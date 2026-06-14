const { body, validationResult } = require('express-validator');
const Joi = require('joi');

//Logiques de validation des inscriptoins d'administrateur
const adminSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/),
  email: Joi.string()
    .email()
    .required()
    .max(255),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
  confirmPassword: Joi.ref('password'),
  role: Joi.string()
    .valid('admin', 'super_admin')
    .required(),
  adminKey1: Joi.string()
    .required()
    .min(8)
    .max(50),
  adminKey2: Joi.string()
    .required()
    .min(8)
    .max(50)
});

exports.validateAdmin = [
  body().custom((value, { req }) => {
    const { error } = adminSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw new Error(error.details.map(detail => detail.message).join(', '));
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

//Logiques de validation des connexions d'administrateur
const loginSchema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .max(255)
      .trim(),
    password: Joi.string()
      .required()
      .max(100)
      .trim()
  });
  
  exports.validateLogin = [
    body().custom((value, { req }) => {
      const { error } = loginSchema.validate(req.body, { abortEarly: false });
      if (error) {
        throw new Error(error.details.map(detail => detail.message).join(', '));
      }
      return true;
    }),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];
  