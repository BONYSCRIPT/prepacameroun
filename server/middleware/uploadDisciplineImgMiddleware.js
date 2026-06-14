const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/disciplines/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

// Configuration des filtres pour les types de fichiers
const fileFilter = (req, file, cb) => {
  // Accepter uniquement les images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Le fichier doit être une image valide.'), false);
  }
};

// Configuration de multer avec des limites de taille
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5MB
  }
});

// Middleware de validation de fichier basique
const validateFileMiddleware = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Vérification de l'extension du fichier
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  if (!allowedExtensions.includes(fileExtension)) {
    // Supprimer le fichier non autorisé
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ 
      message: "Type de fichier non autorisé. Seules les images sont acceptées."
    });
  }

  // Vérification de la taille du fichier (double vérification)
  const fileSize = req.file.size;
  if (fileSize > 5 * 1024 * 1024) {
    // Supprimer le fichier trop volumineux
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ 
      message: "Le fichier est trop volumineux. La taille maximale est de 5MB."
    });
  }

  logger.info(`Fichier de discipline téléchargé avec succès: ${req.file.originalname}`);
  next();
};

// Exporter une fonction qui retourne un tableau de middlewares
module.exports = {
  single: (fieldName) => [upload.single(fieldName), validateFileMiddleware],
  // Si vous avez besoin de la version originale
  uploadMiddleware: upload
};
