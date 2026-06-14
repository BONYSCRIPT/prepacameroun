const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Récupérer tous les exercices
exports.getAllExercices = async (req, res) => {
    try {
        const [exercices] = await db.query('SELECT * FROM exercices');
        res.json(exercices);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des exercices" });
    }
};

// Récupérer un exercice spécifique par son ID
exports.getExercice = async (req, res) => {
    try {
        const [exercice] = await db.query('SELECT * FROM exercices WHERE id = ?', [req.params.id]);
        if (exercice.length > 0) {
            res.json(exercice[0]);
        } else {
            res.status(404).json({ message: "Exercice non trouvé" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'exercice" });
    }
};

// Récupérer tous les exercices d'une discipline spécifique
exports.getExercicesByDiscipline = async (req, res) => {
    try {
        const disciplineId = req.params.disciplineId;
        const [exercices] = await db.query('SELECT * FROM exercices WHERE discipline_id = ? ORDER BY numero_page ASC', [disciplineId]);
        res.json(exercices);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des exercices de la discipline" });
    }
};

// Créer un nouvel exercice
exports.createExercice = async (req, res) => {
    const { titre, enonce, corrige, discipline_id, numero_page } = req.body;
    const id = uuidv4();
    try {
        const [result] = await db.query(
            'INSERT INTO exercices (id, titre, enonce, corrige, discipline_id, numero_page) VALUES (?, ?, ?, ?, ?, ?)',
            [id, titre, enonce, corrige, discipline_id, numero_page]
        );
        res.status(201).json({ id, titre, enonce, corrige, discipline_id, numero_page });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de l'exercice" });
    }
};

// Mettre à jour un exercice existant
exports.updateExercice = async (req, res) => {
    const { titre, enonce, corrige, discipline_id, numero_page } = req.body;
    try {
        await db.query(
            'UPDATE exercices SET titre = ?, enonce = ?, corrige = ?, discipline_id = ?, numero_page = ? WHERE id = ?',
            [titre, enonce, corrige, discipline_id, numero_page, req.params.id]
        );
        res.json({ message: "Exercice mis à jour avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'exercice" });
    }
};

// Supprimer un exercice
exports.deleteExercice = async (req, res) => {
    try {
        await db.query('DELETE FROM exercices WHERE id = ?', [req.params.id]);
        res.json({ message: "Exercice supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'exercice" });
    }
};
