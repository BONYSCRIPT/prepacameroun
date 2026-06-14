const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      'string.empty': 'Le nom d\'utilisateur est requis',
      'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
      'string.max': 'Le nom d\'utilisateur ne doit pas dépasser 30 caractères',
      'string.pattern.base': 'Le nom d\'utilisateur ne peut contenir que des lettres, des chiffres et des underscores'
    }),
  email: Joi.string()
    .required()
    .email()
    .custom((value, helpers) => {
      const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const domain = value.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        return helpers.error('email.domain');
      }
      return value;
    })
    .messages({
      'string.empty': 'L\'email est requis',
      'string.email': 'Email invalide',
      'email.domain': 'Domaine d\'email non autorisé'
    }),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .messages({
      'string.empty': 'Le mot de passe est requis',
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Les mots de passe doivent correspondre',
      'any.required': 'La confirmation du mot de passe est requise'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'L\'adresse email n\'est pas valide',
      'any.required': 'L\'adresse email est requise'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Le mot de passe est requis'
    })
});


const validateRegister = (req, res, next) => {
  console.log(req.body);
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    console.log(errors);
    return res.status(400).json({ errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({ errors });
  }
  next();
};


// Validation pour mot de passe oublié
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'L\'adresse email n\'est pas valide',
      'any.required': 'L\'adresse email est requise'
    })
});

// Validation pour réinitialisation
const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token de réinitialisation requis'
  }),
  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .messages({
      'string.empty': 'Le nouveau mot de passe est requis',
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    })
});

const validateForgotPassword = (req, res, next) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateResetPassword = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
};

