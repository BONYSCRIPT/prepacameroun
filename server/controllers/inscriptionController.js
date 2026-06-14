const db = require('../config/database');

// Récupérer toutes les inscriptions d'un utilisateur
exports.getUserInscriptions = async (req, res) => {
    try {
        const [inscriptions] = await db.query(
            `SELECT i.*, p.nom as prepa_nom, p.description as prepa_description, p.prix as prepa_prix, p.image_url as prepa_image_url
             FROM inscriptions i
             JOIN prepa_concours p ON i.prepa_id = p.id
             WHERE (i.user_id = ? OR i.user_id = ?) AND i.statut = 'active'`,
            [req.user.id, req.user.firebase_uid]
        );
        res.json(inscriptions);
    } catch (error) {
        console.error('Erreur lors de la récupération des inscriptions:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des inscriptions" });
    }
};

// Créer une nouvelle inscription
exports.createInscription = async (req, res) => {
    const { prepa_id, transaction_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO inscriptions (id, user_id, prepa_id, transaction_id) VALUES (UUID(), ?, ?, ?)',
            [req.user.id, prepa_id, transaction_id]
        );
        res.status(201).json({ message: "Inscription créée avec succès", id: result.insertId });
    } catch (error) {
        console.error('Erreur lors de la création de l\'inscription:', error);
        res.status(500).json({ message: "Erreur lors de la création de l'inscription" });
    }
};

// Mettre à jour le statut d'une inscription
exports.updateInscriptionStatus = async (req, res) => {
    const { id, statut } = req.body;
    try {
        await db.query(
            'UPDATE inscriptions SET statut = ? WHERE id = ? AND user_id = ?',
            [statut, id, req.user.id]
        );
        res.json({ message: "Statut de l'inscription mis à jour avec succès" });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de l\'inscription:', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut de l'inscription" });
    }
};

exports.checkAndUpdateInscriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();

        // Mettre à jour les inscriptions expirées (pour les deux IDs possibles)
        await db.query(
            'UPDATE inscriptions SET statut = "expirée" WHERE (user_id = ? OR user_id = ?) AND date_expiration < ? AND statut = "active"',
            [userId, req.user.firebase_uid, currentDate]
        );

        // Récupérer les inscriptions avec les détails de la prépa
        const [updatedInscriptions] = await db.query(
            `SELECT i.*, p.nom as prepa_nom, p.description as prepa_description, p.prix as prepa_prix, p.image_url as prepa_image_url
             FROM inscriptions i
             JOIN prepa_concours p ON i.prepa_id = p.id
             WHERE i.user_id = ? OR i.user_id = ?`,
            [userId, req.user.firebase_uid]
        );

        res.json(updatedInscriptions);
    } catch (error) {
        console.error('Erreur lors de la vérification et mise à jour des inscriptions:', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour des inscriptions" });
    }
};

// Supprimer une inscription
exports.deleteInscription = async (req, res) => {
    try {
        await db.query('DELETE FROM inscriptions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Inscription supprimée avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'inscription:', error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'inscription" });
    }
};
