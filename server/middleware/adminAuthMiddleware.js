const jwt = require('jsonwebtoken');
const db = require('../config/database');

const adminAuthMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token received:', token);

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [admin] = await db.query('SELECT * FROM admins WHERE id = ?', [decoded.adminId]);

        if (admin.length === 0) {
            throw new Error('Non autorisé');
        }

        req.admin = admin[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('Token expired');
            return res.status(401).json({ 
                message: "Session expirée. Veuillez vous reconnecter.",
                expired: true
            });
        }
        console.error(error);
        res.status(401).json({ message: "Non autorisé. Accès administrateur requis." });
    }
};

module.exports = adminAuthMiddleware;
