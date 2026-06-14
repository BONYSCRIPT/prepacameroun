const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
    req.user = {
      id: decoded.userId,
      firebase_uid: decoded.firebase_uid, // Ajout du UID Firebase pour la récupération
      email_verified: decoded.email_verified
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Session expirée. Veuillez vous reconnecter.",
        expired: true
      });
    }
    res.status(401).json({ message: "Token invalide." });
  }
};

module.exports = authMiddleware;