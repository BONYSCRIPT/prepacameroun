const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./utils/logger');
const app = express();
const errorHandler = require('./utils/errorHandler');
const rateLimit = require('express-rate-limit');

// Limiteur de requêtes global (protection DDoS et Brute Force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 2000, // Plus permissif en dév
  message: { success: false, message: 'Trop de requêtes provenant de cette adresse IP, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur de requêtes strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 60 * 60 * 1000 : 1 * 60 * 1000, // 1 heure en prod, 1 min en dév
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 en prod, 100 en dév
  message: { success: false, message: 'Trop de tentatives, veuillez patienter.' }
});

// Appliquer le limiteur global à toutes les requêtes
app.use(limiter);

// Application de Helmet pour la sécurité avec configuration étendue pour Google Auth
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://zitopay.africa", "https://apis.google.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", "https://zitopay.africa", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com"],
      frameSrc: ["'self'", "https://accounts.google.com"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' } // Ajout pour Google Auth
}));

// Application de la compression pour améliorer les performances
app.use(compression({
  level: 6,
  threshold: 0
}));

// Utiliser Morgan pour logger les requêtes HTTP
app.use(morgan('dev', { stream: { write: message => logger.info(message.trim()) } }));

// Configuration des origines CORS autorisées avec nettoyage des espaces
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['https://www.prepacameroun.com', 'https://prepacameroun.com'];

// Log des origines autorisées pour débogage
logger.debug('Origines CORS autorisées:', allowedOrigins);

// Middleware de débogage CORS (à retirer en production)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.debug('?? Requête CORS:', {
      origin: req.headers.origin,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent']?.substring(0, 50)
    });
    next();
  });
}

// Configuration CORS stricte pour la production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true, // Restreint en prod, ouvert localement
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Middleware pour servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware pour parser le JSON (déplacé avant les routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Importation des routes existantes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const prepaConcoursRoutes = require('./routes/prepaConcours.routes');
const disciplinesRoutes = require('./routes/disciplines.routes');
const disciplinesUserRoutes = require('./routes/disciplinesUser.routes');
const leconsRoutes = require('./routes/lecons.routes');
const exercicesRoutes = require('./routes/exercices.routes');
const anciensSujetsRoutes = require('./routes/anciensSujets.routes');
const paymentRoutes = require('./routes/paymentRoutes');
const inscriptionRoutes = require('./routes/inscriptionRoutes');
const zitoPayRoutes = require('./routes/zitoPayRoutes');

// Middleware pour gérer les erreurs CORS spécifiquement
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    logger.error('? Erreur CORS:', err.message);
    return res.status(403).json({
      message: 'Accès non autorisé: origine non autorisée',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      origin: req.headers.origin,
      allowedOrigins: process.env.NODE_ENV === 'development' ? allowedOrigins : undefined
    });
  }
  next(err);
});

// Route de santé pour vérifier le statut du serveur
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Utilisation des routes existantes avec protections supplémentaires
app.use('/api/admin', adminRoutes);
app.use('/api/users', authLimiter, userRoutes); // Protection brute-force sur /users
app.use('/api/prepas', prepaConcoursRoutes);
app.use('/api/disciplines', disciplinesRoutes);
app.use('/api/disciplines-user', disciplinesUserRoutes);
app.use('/api/lecons', leconsRoutes);
app.use('/api/exercices', exercicesRoutes);
app.use('/api/anciens-sujets', anciensSujetsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/inscriptions', inscriptionRoutes);
app.use('/api/payment/zitopay', zitoPayRoutes);

// Middleware pour gérer les routes non trouvées
app.use('*', (req, res, next) => { // Utilise next pour propager l'erreur
  const error = new Error('Route non trouvée');
  error.status = 404;
  logger.warn('Route non trouvée:', req.originalUrl);
  next(error); // Passe l'erreur au gestionnaire d'erreurs
});

// Gestionnaire d'erreurs global (doit être en dernier)
app.use(errorHandler);

module.exports = app;
