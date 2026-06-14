const crypto = require('crypto');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { verifyFirebaseToken } = require('../config/firebase-admin');
const logger = require('../utils/logger');
const { sendPasswordResetEmail } = require('../utils/emailService');

exports.firebaseLogin = async (req, res) => {
    logger.info('firebaseLogin appel');

    const { idToken } = req.body;

    try {
        const firebaseResult = await verifyFirebaseToken(idToken);

        if (!firebaseResult.success) {
            return res.status(400).json({
                success: false,
                message: "Token Firebase invalide",
                error: firebaseResult.error
            });
        }

        const firebaseUser = firebaseResult.user;
        const { email, name, picture, uid, email_verified, firebase } = firebaseUser;
        const provider = firebase?.sign_in_provider || 'firebase';
        const providerName = typeof provider === 'string' ? provider.replace('.com', '') : 'firebase';
        const safeEmail = email || `${uid}@no-email.firebase`;

        // Rechercher l'utilisateur dans la base
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE email = ? OR firebase_uid = ?',
            [email, uid]
        );

        let user;
        let userId;

        if (existingUsers.length > 0) {
            user = existingUsers[0];
            userId = user.id;

            const updateFields = {
                firebase_uid: uid,
                last_login: new Date(),
                provider: providerName,
                email_verified: email_verified ? 1 : 0,
                google_id: provider === 'google.com' ? uid : null,
                avatar_url: provider === 'google.com' ? picture : null
            };

            const updateQuery = 'UPDATE users SET ' +
                Object.keys(updateFields).map(k => `${k} = ?`).join(', ') +
                ' WHERE id = ?';

            const values = [...Object.values(updateFields), userId];
            await db.query(updateQuery, values);
        } else {
            userId = uuidv4();

            const baseUsername = name || safeEmail.split('@')[0];
            const safeUsername = `${baseUsername.replace(/[^a-zA-Z0-9_]/g, '')}_${uid.substring(0, 5)}`;

            const insertFields = {
                id: userId,
                username: safeUsername,
                email: safeEmail,
                password: 'FIREBASE_AUTH',
                firebase_uid: uid,
                provider: providerName,
                created_at: new Date(),
                last_login: new Date(),
                email_verified: email_verified ? 1 : 0,
                google_id: provider === 'google.com' ? uid : null,
                avatar_url: provider === 'google.com' ? picture : null
            };

            const insertColumns = Object.keys(insertFields).join(', ');
            const insertValues = Object.values(insertFields);
            const placeholders = insertValues.map(() => '?').join(', ');

            await db.query(
                `INSERT INTO users (${insertColumns}) VALUES (${placeholders})`,
                insertValues
            );

            user = {
                id: userId,
                username: insertFields.username,
                email: safeEmail,
                provider: providerName,
                avatar_url: picture,
                email_verified
            };
        }

        // Generer un JWT local
        const token = jwt.sign(
            {
                userId: userId,
                provider: providerName,
                firebase_uid: uid,
                email_verified: email_verified
            },
            process.env.JWT_USER_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            success: true,
            message: "Connexion Firebase reussie",
            user: {
                id: userId,
                username: user.username,
                email: safeEmail,
                provider: providerName,
                avatar_url: picture,
                email_verified: email_verified
            },
            token: token
        });
    } catch (error) {
        logger.error('Erreur firebaseLogin: %O', error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de l'authentification Firebase",
            error: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [user] = await db.query('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
        if (user.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouve" });
        }
        res.json(user[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la recuperation du profil" });
    }
};

exports.updateProfile = async (req, res) => {
    const { username, email } = req.body;
    try {
        await db.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.user.id]);
        res.json({ message: "Profil mis a jour avec succes" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise a jour du profil" });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [user] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const isPasswordValid = await argon2.verify(user[0].password, currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe actuel incorrect" });
        }
        const hashedNewPassword = await argon2.hash(newPassword);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);
        res.json({ message: "Mot de passe change avec succes" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors du changement de mot de passe" });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Token de verification invalide ou expire"
            });
        }

        const user = users[0];

        await db.query(
            'UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?',
            [user.id]
        );

        res.json({
            success: true,
            message: "Email verifie avec succes ! Vous pouvez maintenant vous connecter.",
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Erreur verify email:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la verification de l'email"
        });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Token invalide ou expire. Veuillez refaire une demande de reinitialisation."
            });
        }

        const user = users[0]; // BUG#1 CORRIGE: suppression du 'e' parasite

        const hashedPassword = await argon2.hash(newPassword);

        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({
            success: true,
            message: "Votre mot de passe a ete reinitialise avec succes. Vous pouvez maintenant vous connecter."
        });

    } catch (error) {
        logger.error('Erreur reset password:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la reinitialisation. Veuillez reessayer."
        });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.json({
                success: true,
                message: "Si cet email existe dans notre systeme, vous recevrez un lien de reinitialisation dans quelques minutes."
            });
        }

        const user = users[0];

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 heure

        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [resetToken, resetTokenExpires, user.id]
        );

        await sendPasswordResetEmail(user.email, resetToken, user.username);

        res.json({
            success: true,
            message: "Email de reinitialisation envoye avec succes. Verifiez votre boite mail."
        });

    } catch (error) {
        logger.error('Erreur forgot password:', error);
        res.status(500).json({
            success: false,
            message: "Une erreur est survenue. Veuillez reessayer plus tard."
        });
    }
};

exports.verifyUser = (req, res) => {
    res.json({ id: req.user.id, username: req.user.username, email: req.user.email });
};
