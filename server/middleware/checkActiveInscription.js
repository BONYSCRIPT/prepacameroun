const db = require('../config/database');

const checkActiveInscription = async (req, res, next) => {
    const userId = req.user.id;
    const prepaId = req.params.prepaId;

    try {
        const [inscriptions] = await db.query(
            'SELECT * FROM inscriptions WHERE user_id = ? AND prepa_id = ? AND statut = "active"',
            [userId, prepaId]
        );

        if (inscriptions.length === 0) {
            return res.status(403).json({ message: "Accès refusé. Inscription expirée ou inexistante." });
        }

        next();
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'inscription:', error);
        res.status(500).json({ message: "Erreur lors de la vérification de l'accès" });
    }
};

module.exports = checkActiveInscription;
