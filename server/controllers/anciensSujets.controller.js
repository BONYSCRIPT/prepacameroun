const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Récupérer tous les anciens sujets
exports.getAllAnciensSujets = async (req, res) => {
    try {
        const [anciensSujets] = await db.query('SELECT * FROM anciens_sujets');
        res.json(anciensSujets);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des anciens sujets" });
    }
};

// Récupérer un ancien sujet spécifique par son ID
exports.getAncienSujet = async (req, res) => {
    try {
        const [ancienSujet] = await db.query('SELECT * FROM anciens_sujets WHERE id = ?', [req.params.id]);
        if (ancienSujet.length > 0) {
            res.json(ancienSujet[0]);
        } else {
            res.status(404).json({ message: "Ancien sujet non trouvé" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'ancien sujet" });
    }
};

// Récupérer tous les anciens sujets d'une discipline spécifique
exports.getExamensByDiscipline = async (req, res) => {
    try {
        const disciplineId = req.params.disciplineId;
        const [exercices] = await db.query('SELECT * FROM anciens_sujets WHERE discipline_id = ? ORDER BY numero_page ASC', [disciplineId]);
        res.json(exercices);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des anciens sujets de la discipline" });
    }
};

// Créer un nouvel ancien sujet
exports.createAncienSujet = async (req, res) => {
    const { annee, titre, contenu, corrige, discipline_id, numero_page } = req.body;
    const id = uuidv4();
    try {
        const [result] = await db.query(
            'INSERT INTO anciens_sujets (id, annee, titre, contenu, corrige, discipline_id, numero_page) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, annee, titre, contenu, corrige, discipline_id, numero_page]
        );
        res.status(201).json({ id, annee, titre, contenu, corrige, discipline_id, numero_page });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de l'ancien sujet" });
    }
};

// Mettre à jour un ancien sujet existant
exports.updateAncienSujet = async (req, res) => {
    const { annee, titre, contenu, corrige, discipline_id, numero_page } = req.body;
    try {
        await db.query(
            'UPDATE anciens_sujets SET annee = ?, titre = ?, contenu = ?, corrige = ?, discipline_id = ?, numero_page = ? WHERE id = ?',
            [annee, titre, contenu, corrige, discipline_id, numero_page, req.params.id]
        );
        res.json({ message: "Ancien sujet mis à jour avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'ancien sujet" });
    }
};

// Supprimer un ancien sujet
exports.deleteAncienSujet = async (req, res) => {
    try {
        await db.query('DELETE FROM anciens_sujets WHERE id = ?', [req.params.id]);
        res.json({ message: "Ancien sujet supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'ancien sujet" });
    }
};
