const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { validateCreateLesson, validateUpdateLesson } = require('../middleware/leconValidation');

// Récupérer toutes les leçons
exports.getAllLecons = async (req, res) => {
    try {
        const [lecons] = await db.query('SELECT * FROM lecons');
        res.json(lecons);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des leçons" });
    }
};

// Récupérer une leçon spécifique par son ID
exports.getLecon = async (req, res) => {
    try {
        const [lecon] = await db.query('SELECT * FROM lecons WHERE id = ?', [req.params.id]);
        if (lecon.length > 0) {
            res.json(lecon[0]);
        } else {
            res.status(404).json({ message: "Leçon non trouvée" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la leçon" });
    }
};

// Récupérer toutes les leçons d'une discipline spécifique
exports.getLeconsByDiscipline = async (req, res) => {
    try {
        const disciplineId = req.params.disciplineId;
        const [lecons] = await db.query('SELECT * FROM lecons WHERE discipline_id = ? ORDER BY numero_page ASC', [disciplineId]);
        res.json(lecons);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des leçons de la discipline" });
    }
};


// Créer une nouvelle leçon
exports.createLecon = async (req, res) => {
    const { titre, contenu, discipline_id, numero_page } = req.body;
    const id = uuidv4();

    try {
        const [result] = await db.query(
            'INSERT INTO lecons (id, titre, contenu, discipline_id, numero_page) VALUES (?, ?, ?, ?, ?)',
            [id, titre, contenu, discipline_id, numero_page]
        );
        res.status(201).json({ id, titre, contenu, discipline_id, numero_page });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de la leçon" });
    }
};

// Mettre à jour une leçon existante
exports.updateLecon = async (req, res) => {
    const { titre, contenu, discipline_id, numero_page } = req.body;
    try {
        await db.query(
            'UPDATE lecons SET titre = ?, contenu = ?, discipline_id = ?, numero_page = ? WHERE id = ?',
            [titre, contenu, discipline_id, numero_page, req.params.id]
        );
        res.json({ message: "Leçon mise à jour avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la leçon" });
    }
};

// Supprimer une leçon
exports.deleteLecon = async (req, res) => {
    try {
        await db.query('DELETE FROM lecons WHERE id = ?', [req.params.id]);
        res.json({ message: "Leçon supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la leçon" });
    }
};
