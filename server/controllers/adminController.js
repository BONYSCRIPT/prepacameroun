const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger'); 
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

// Inscription d'un nouvel administrateur
exports.registerAdmin = async (req, res) => {
    const { username, email, password, role, adminKey1, adminKey2 } = req.body;
    const adminId = uuidv4();

    console.log('Données reçues:', { username, email, role, adminKey1, adminKey2 });

    try {
        const isKey1Valid = await argon2.verify(process.env.ADMIN_KEY_1, adminKey1);
        const isKey2Valid = await argon2.verify(process.env.ADMIN_KEY_2, adminKey2);

        if (!isKey1Valid || !isKey2Valid) {
            logger.warn(`Tentative d'inscription avec des clés invalides pour l'email: ${email}`);
            return res.status(403).json({ message: "Clés d'administration invalides" });
        }

        const hashedPassword = await argon2.hash(password);
        await db.query(
            'INSERT INTO admins (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [adminId, username, email, hashedPassword, role]
        );

        logger.info(`Nouvel administrateur créé: ${username}, ID: ${adminId}`);
        res.status(201).json({ message: "Administrateur créé avec succès", adminId });
    } catch (error) {
        logger.error('Erreur lors de la création de l\'administrateur:', error);
        res.status(500).json({ message: "Erreur lors de la création de l'administrateur", error: error.message });
    }
};

// Connexion d'un administrateur
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    console.log('Données reçues pour la connexion:', { email, password });
    try {
        // Vérification des erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (admins.length === 0) {
            logger.warn(`Tentative de connexion échouée pour l'email: ${email}`);
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const admin = admins[0];
        const isMatch = await argon2.verify(admin.password, password);
        if (!isMatch) {
            logger.warn(`Tentative de connexion échouée pour l'admin ID: ${admin.id}`);
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const token = jwt.sign({ adminId: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '3h' });
        logger.info(`Connexion réussie pour l'admin ID: ${admin.id}`);
        res.json({ token, adminId: admin.id, role: admin.role });
    } catch (error) {
        logger.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
    }
};

// Déconnexion d'un administrateur
exports.logoutAdmin = (req, res) => {
    const adminId = req.admin.id; // Supposons que l'ID de l'admin est stocké dans le token
    logger.info(`Déconnexion de l'admin ID: ${adminId}`);
    res.json({ message: "Déconnexion réussie" });
};

// Réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [admin] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (admin.length === 0) {
            logger.warn(`Tentative de réinitialisation de mot de passe pour un email non existant: ${email}`);
            return res.status(404).json({ message: "Aucun administrateur trouvé avec cet email" });
        }
        // Ici, vous implémenteriez la logique pour envoyer un email de réinitialisation
        // Par exemple, générer un token de réinitialisation et l'envoyer par email
        logger.info(`Demande de réinitialisation de mot de passe pour l'admin ID: ${admin[0].id}`);
        res.json({ message: "Instructions de réinitialisation du mot de passe envoyées par email" });
    } catch (error) {
        logger.error('Erreur lors de la réinitialisation du mot de passe:', error);
        res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe", error: error.message });
    }
};

// Récupération des informations d'un administrateur
exports.getAdminInfo = async (req, res) => {
    try {
        const [admin] = await db.query('SELECT id, username, email, role FROM admins WHERE id = ?', [req.params.id]);
        if (admin.length === 0) {
            logger.warn(`Tentative d'accès aux informations d'un admin non existant, ID: ${req.params.id}`);
            return res.status(404).json({ message: "Administrateur non trouvé" });
        }
        logger.info(`Informations récupérées pour l'admin ID: ${req.params.id}`);
        res.json(admin[0]);
    } catch (error) {
        logger.error('Erreur lors de la récupération des informations de l\'administrateur:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des informations de l'administrateur", error: error.message });
    }
};

// Mise à jour des informations d'un administrateur
exports.updateAdmin = async (req, res) => {
    const { username, email, role } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE admins SET username = ?, email = ?, role = ? WHERE id = ?',
            [username, email, role, req.params.id]
        );
        if (result.affectedRows === 0) {
            logger.warn(`Tentative de mise à jour d'un admin non existant, ID: ${req.params.id}`);
            return res.status(404).json({ message: "Administrateur non trouvé" });
        }
        logger.info(`Informations mises à jour pour l'admin ID: ${req.params.id}`);
        res.json({ message: "Informations de l'administrateur mises à jour avec succès" });
    } catch (error) {
        logger.error('Erreur lors de la mise à jour des informations de l\'administrateur:', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour des informations de l'administrateur", error: error.message });
    }
};

// Suppression d'un administrateur
exports.deleteAdmin = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM admins WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            logger.warn(`Tentative de suppression d'un admin non existant, ID: ${req.params.id}`);
            return res.status(404).json({ message: "Administrateur non trouvé" });
        }
        logger.info(`Administrateur supprimé, ID: ${req.params.id}`);
        res.json({ message: "Administrateur supprimé avec succès" });
    } catch (error) {
        logger.error('Erreur lors de la suppression de l\'administrateur:', error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'administrateur", error: error.message });
    }
};

// Liste de tous les administrateurs
exports.getAllAdmins = async (req, res) => {
    try {
        const [admins] = await db.query('SELECT id, username, email, role FROM admins');
        logger.info(`Liste des administrateurs récupérée, nombre d'admins: ${admins.length}`);
        res.json(admins);
    } catch (error) {
        logger.error('Erreur lors de la récupération de la liste des administrateurs:', error);
        res.status(500).json({ message: "Erreur lors de la récupération de la liste des administrateurs", error: error.message });
    }
};
