const admin = require('firebase-admin');
const path = require('path');
const logger = require('../utils/logger');

// Configuration Firebase Admin
let firebaseApp;

try {
  // Méthode 1: Utiliser le fichier de service account
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    logger.info('✅ Firebase Admin initialisé avec le fichier de service account');
  } 
  // Méthode 2: Utiliser les variables d'environnement
  else if (process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    logger.info('✅ Firebase Admin initialisé avec les variables d\'environnement');
  } else {
    logger.warn('⚠️ Configuration Firebase manquante. Les fonctionnalités Firebase seront désactivées.');
  }
} catch (error) {
  logger.error('❌ Erreur lors de l\'initialisation de Firebase Admin:', error);
  // process.exit(1); // Ne pas arrêter le serveur en local
}

// Fonction pour vérifier un token Firebase
const verifyFirebaseToken = async (idToken) => {
  try {
    logger.debug('🔑 verifyFirebaseToken: idToken =', idToken);
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    logger.debug('🔑 verifyFirebaseToken: decodedToken =', decodedToken);
    return {
      success: true,
      user: decodedToken
    };
  } catch (error) {
    logger.error('❌ Erreur lors de la vérification du token Firebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction pour créer un utilisateur Firebase personnalisé
const createFirebaseUser = async (userData) => {
  try {
    const userRecord = await admin.auth().createUser({
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      emailVerified: userData.emailVerified || false
    });
    
    return {
      success: true,
      user: userRecord
    };
  } catch (error) {
    logger.error('Erreur lors de la création de l\'utilisateur Firebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction pour mettre à jour un utilisateur Firebase
const updateFirebaseUser = async (uid, updateData) => {
  try {
    const userRecord = await admin.auth().updateUser(uid, updateData);
    return {
      success: true,
      user: userRecord
    };
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'utilisateur Firebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction pour supprimer un utilisateur Firebase
const deleteFirebaseUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
    return {
      success: true,
      message: 'Utilisateur supprimé avec succès'
    };
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'utilisateur Firebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  admin,
  firebaseApp,
  verifyFirebaseToken,
  createFirebaseUser,
  updateFirebaseUser,
  deleteFirebaseUser
};
