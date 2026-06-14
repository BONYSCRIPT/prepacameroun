import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validation de la configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement Firebase manquantes:', missingVars);
  throw new Error(`Variables Firebase manquantes: ${missingVars.join(', ')}`);
}

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Configuration du provider Google
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Fonction de connexion Google
export const signInWithGoogle = async () => {
  try {
    console.log('🔄 Tentative de connexion Google...');

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log('✅ Connexion Google réussie:', user.email);

    // Récupérer le token ID pour l'envoyer au backend
    const idToken = await user.getIdToken();

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      },
      idToken
    };
  } catch (error) {
    console.error('❌ Erreur lors de la connexion Google:', error);

    // Gestion des erreurs spécifiques
    let errorMessage = 'Erreur lors de la connexion Google';

    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Connexion annulée par l\'utilisateur';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Popup bloquée par le navigateur';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Demande de connexion annulée';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Erreur de réseau. Vérifiez votre connexion internet';
        break;
      default:
        errorMessage = error.message || 'Erreur inconnue';
    }

    return {
      success: false,
      error: errorMessage,
      code: error.code
    };
  }
};

// Fonction de déconnexion
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('✅ Déconnexion Firebase réussie');
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion Firebase:', error);
    return { success: false, error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  if (auth) return onAuthStateChanged(auth, callback);
  console.warn("onAuthStateChange: Firebase non initialisé");
  return () => { }; // Retourne une fonction de nettoyage vide
};

export const getCurrentUser = () => {
  return auth ? auth.currentUser : null;
};

export const getCurrentUserToken = async () => {
  const user = auth ? auth.currentUser : null;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

/**
 * Fonction pour créer un utilisateur avec email et mot de passe
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: any, error?: string, code?: string}>}
 */
export const createUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Fonction pour connecter un utilisateur avec email et mot de passe
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: any, error?: string, code?: string}>}
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Fonction pour envoyer un email de réinitialisation de mot de passe
 * @param {string} email
 * @returns {Promise<{success: boolean, error?: string, code?: string}>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Fonction pour envoyer un email de vérification d'email
 * @returns {Promise<{success: boolean, error?: string, code?: string}>}
 */
export const verifyEmail = async () => {
  try {
    await sendEmailVerification(auth.currentUser, { url: import.meta.env.VITE_APP_CONFIRMATION_EMAIL_REDIRECT });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
};

// Export des objets Firebase pour usage avancé
export { auth, db, storage, googleProvider, updateProfile };

// Export par défaut
export default {
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
  getCurrentUser,
  getCurrentUserToken,
  auth,
  db,
  storage,
  // Ajout des fonctions pour l'authentification email/mot de passe
  createUser,
  signInUser,
  resetPassword,
  verifyEmail,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
};