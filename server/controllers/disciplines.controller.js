const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { validateCreateDiscipline, validateUpdateDiscipline } = require('../middleware/disciplineValidation');

// Récupérer toutes les disciplines
exports.getAllDisciplines = async (req, res) => {
    try {
        const [disciplines] = await db.query('SELECT * FROM disciplines');
        console.log(disciplines);
        res.json(disciplines);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des disciplines" });
    }
};

// Récupérer une discipline spécifique par son ID
exports.getDiscipline = async (req, res) => {
    try {
        const [discipline] = await db.query('SELECT * FROM disciplines WHERE id = ?', [req.params.id]);
        if (discipline.length > 0) {
            res.json(discipline[0]);
        } else {
            res.status(404).json({ message: "Discipline non trouvée" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la discipline" });
    }
};

// Récupérer toutes les disciplines pour une prépa concours spécifique
exports.getDisciplinesByPrepa = async (req, res) => {
    try {
        const [disciplines] = await db.query('SELECT * FROM disciplines WHERE prepa_concours_id = ?', [req.params.prepaId]);
        res.json(disciplines);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur lors de la récupération des disciplines pour cette prépa" });
    }
};


// Créer une nouvelle discipline
exports.createDiscipline = async (req, res) => {
    try {
        const { nom, description, prepa_concours_id } = req.body;
        const id = uuidv4();
        const imageUrl = req.file ? `/uploads/images/disciplines/${req.file.filename}` : null;

        const [result] = await db.query(
        'INSERT INTO disciplines (id, nom, description, prepa_concours_id, image_url) VALUES (?, ?, ?, ?, ?)',
        [id, nom, description, prepa_concours_id, imageUrl]
        );
        res.status(201).json({ id, nom, description, prepa_concours_id, imageUrl });
    } catch (error) {
        console.error('Erreur lors de la création de la discipline:', error);
        res.status(500).json({ message: "Erreur lors de la création de la discipline" });
    }
};
  
// Mettre à jour une discipline existante
exports.updateDiscipline = async (req, res) => {
    try {
        const { nom, description } = req.body;
        const updateFields = { nom, description };

        if (req.file) {
        updateFields.image_url = `/uploads/images/disciplines/${req.file.filename}`;
        }

        const [result] = await db.query(
        'UPDATE disciplines SET ? WHERE id = ?',
        [updateFields, req.params.id]
        );

        if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Discipline non trouvée" });
        }

        res.json({ message: "Discipline mise à jour avec succès", updatedFields: updateFields });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la discipline:', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la discipline" });
    }
};  

// Supprimer une discipline
exports.deleteDiscipline = async (req, res) => {
    try {
        await db.query('DELETE FROM disciplines WHERE id = ?', [req.params.id]);
        res.json({ message: "Discipline supprimée avec succès" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur lors de la suppression de la discipline" });
    }
};
