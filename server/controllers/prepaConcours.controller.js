const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// Ajouter cette nouvelle méthode
exports.togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [prepa] = await db.query('SELECT is_published FROM prepa_concours WHERE id = ?', [id]);

    if (prepa.length === 0) {
      return res.status(404).json({ message: "Préparation non trouvée" });
    }

    const newStatus = !prepa[0].is_published;
    await db.query('UPDATE prepa_concours SET is_published = ? WHERE id = ?', [newStatus, id]);

    res.json({ message: `Préparation ${newStatus ? 'publiée' : 'dépubliée'} avec succès`, is_published: newStatus });
  } catch (error) {
    console.error('Erreur lors du changement de statut de publication:', error);
    res.status(500).json({ message: "Erreur lors du changement de statut de publication" });
  }
};

// Garder getAllPrepaConcours inchangée
exports.getAllPrepaConcours = async (req, res) => {
  try {
    const [prepaConcours] = await db.query('SELECT * FROM prepa_concours');
    res.json(prepaConcours);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur lors de la récupération des préparations aux concours" });
  }
};

// Nouvelle fonction pour récupérer les préparations publiées
exports.getPublishedPrepaConcours = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Tentative de récupération du userId et firebase_uid si le token est présent
    let userId = null;
    let firebaseUid = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
        userId = decoded.userId;
        firebaseUid = decoded.firebase_uid;
      } catch (err) {
        console.warn('Token invalide ou expiré dans getPublishedPrepaConcours');
      }
    }

    // Requête modifiée pour inclure l'état d'inscription (vérifie les deux IDs possibles)
    const [publishedPrepaConcours] = await db.query(
      `SELECT p.*, 
       CASE WHEN i.id IS NOT NULL THEN TRUE ELSE FALSE END as is_inscribed
       FROM prepa_concours p
       LEFT JOIN inscriptions i ON p.id = i.prepa_id AND (i.user_id = ? OR i.user_id = ?) AND i.statut = 'active' AND i.date_expiration > NOW()
       WHERE p.is_published = TRUE 
       LIMIT ? OFFSET ?`,
      [userId, firebaseUid, limit, offset]
    );

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM prepa_concours WHERE is_published = TRUE'
    );

    const formattedData = publishedPrepaConcours.map(prepa => ({
      ...prepa,
      is_inscribed: !!prepa.is_inscribed
    }));

    res.json({
      data: formattedData,
      pagination: {
        total: countResult[0].total,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Erreur dans getPublishedPrepaConcours:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des préparations aux concours publiées" });
  }
};


// Récupérer une préparation aux concours spécifique par son ID
exports.getPrepaConcours = async (req, res) => {
  try {
    const { id } = req.params;

    // Tentative de récupération du userId si le token est présent
    let userId = null;
    let firebaseUid = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
        userId = decoded.userId;
        firebaseUid = decoded.firebase_uid;
      } catch (err) {
        // Token optionnel pour ce point d'accès
      }
    }

    const [prepaConcours] = await db.query(
      `SELECT p.*, 
       CASE WHEN i.id IS NOT NULL THEN TRUE ELSE FALSE END as is_inscribed
       FROM prepa_concours p
       LEFT JOIN inscriptions i ON p.id = i.prepa_id AND (i.user_id = ? OR i.user_id = ?) AND i.statut = 'active' AND i.date_expiration > NOW()
       WHERE p.id = ?`,
      [userId, firebaseUid, id]
    );

    if (prepaConcours.length > 0) {
      const data = {
        ...prepaConcours[0],
        is_inscribed: !!prepaConcours[0].is_inscribed
      };
      res.json(data);
    } else {
      res.status(404).json({ message: "Préparation aux concours non trouvée" });
    }
  } catch (error) {
    console.error('Erreur getPrepaConcours:', error);
    res.status(500).json({ message: "Erreur lors de la récupération de la préparation aux concours" });
  }
};

// Créer une nouvelle préparation aux concours
exports.createPrepaConcours = async (req, res) => {
  try {
    const { nom, description, prix, auteur } = req.body;
    const id = uuidv4();

    if (!req.file) {
      return res.status(400).json({ message: "L'image est obligatoire" });
    }

    const imageUrl = `/uploads/images/prepas/${req.file.filename}`;

    const [result] = await db.query(
      'INSERT INTO prepa_concours (id, nom, description, prix, created_by, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nom, description, prix, auteur, imageUrl]
    );

    res.status(201).json({ id, nom, description, prix, auteur, imageUrl });
  } catch (error) {
    console.error('Erreur lors de la création de la préparation aux concours:', error);
    res.status(500).json({ message: "Erreur lors de la création de la préparation aux concours" });
  }
};


// Mettre à jour une préparation aux concours existante
exports.updatePrepaConcours = async (req, res) => {
  try {
    const { nom, description, prix } = req.body;

    const updateFields = {};
    if (nom !== undefined) updateFields.nom = nom;
    if (description !== undefined) updateFields.description = description;
    if (prix !== undefined) updateFields.prix = prix;

    // Gestion de la nouvelle image si elle est fournie
    if (req.file) {
      updateFields.image_url = `/uploads/images/prepas/${req.file.filename}`;
    }

    const [result] = await db.query(
      'UPDATE prepa_concours SET ? WHERE id = ?',
      [updateFields, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Préparation aux concours non trouvée" });
    }

    res.json({ message: "Préparation aux concours mise à jour avec succès", updatedFields: updateFields });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la préparation aux concours:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la préparation aux concours" });
  }
};


// Supprimer une préparation aux concours
exports.deletePrepaConcours = async (req, res) => {
  console.log("Suppression de la préparation aux concours avec l'ID :", req.params.id);
  try {
    await db.query('DELETE FROM prepa_concours WHERE id = ?', [req.params.id]);
    res.json({ message: "Préparation aux concours supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur lors de la suppression de la préparation aux concours" });
  }
};
