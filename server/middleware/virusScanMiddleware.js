const NodeClam = require('clamscan');
const logger = require('../utils/logger');
const fs = require('fs');

// Initialisation de ClamAV
const clamscan = new NodeClam().init({
  clamdscan: {
    socket: '/var/run/clamav/clamd.ctl',
    host: 'localhost',
    port: 3310,
    timeout: 60000,
    local_fallback: true,
  },
  preference: 'clamdscan'
});

/**
 * Middleware pour scanner les fichiers téléchargés à la recherche de virus
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const virusScanMiddleware = async (req, res, next) => {
  try {
    // Si aucun fichier n'a été téléchargé, passez au middleware suivant
    if (!req.file) {
      return next();
    }

    // Scan du fichier avec ClamAV
    const clamInstance = await clamscan;
    const { isInfected, file, viruses } = await clamInstance.scanFile(req.file.path);

    if (isInfected) {
      logger.error(`Virus détecté dans le fichier ${req.file.originalname}: ${viruses}`);
      
      // Supprimez le fichier infecté
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({ 
        message: "Le fichier contient un virus et a été rejeté.",
        details: process.env.NODE_ENV === 'development' ? viruses : undefined
      });
    }

    // Si tout va bien, passez au middleware suivant
    next();
  } catch (error) {
    logger.error('Erreur lors de l\'analyse antivirus:', error);
    
    // En cas d'erreur, supprimez le fichier par précaution
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        logger.error('Erreur lors de la suppression du fichier après échec de l\'analyse:', unlinkError);
      }
    }
    
    // Selon la politique de sécurité, on peut soit rejeter, soit accepter
    return res.status(500).json({ 
      message: "Erreur lors de l'analyse antivirus. Le fichier a été rejeté par mesure de sécurité." 
    });
  }
};

module.exports = virusScanMiddleware;
