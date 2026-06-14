import { createContext, useState, useEffect } from 'react';
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
  auth
} from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { checkIfAdmin } from '../services/firestoreService';
import { toast } from 'react-toastify';

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [firebaseAdmin, setFirebaseAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛡️ Écoute des changements d'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseAdmin(firebaseUser);

      if (firebaseUser) {
        try {
          // Vérifier si l'utilisateur Firebase est un admin dans Firestore
          const adminData = await checkIfAdmin(firebaseUser.uid);
          if (adminData) {
            setAdmin({
              id: firebaseUser.uid,
              ...adminData,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL
            });
            localStorage.setItem('adminData', JSON.stringify(adminData));
          } else {
            // Utilisateur Firebase mais pas admin → déconnexion
            console.warn('Utilisateur non administrateur');
            await signOutUser();
            setAdmin(null);
            localStorage.removeItem('adminData');
          }
        } catch (error) {
          console.error('Erreur vérification admin:', error);
          setAdmin(null);
          localStorage.removeItem('adminData');
        }
      } else {
        localStorage.removeItem('adminData');
        setAdmin(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 📂 Chargement localStorage (fallback)
  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminData');
    if (savedAdmin && !admin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        console.error('Erreur restauration admin:', error);
        localStorage.removeItem('adminData');
      }
    }
  }, [admin]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);

      if (result.user) {
        const adminData = await checkIfAdmin(result.user.uid);
        if (adminData) {
          setAdmin({
            id: result.user.uid,
            ...adminData,
            email: result.user.email
          });
          localStorage.setItem('adminData', JSON.stringify(adminData));
          return { success: true };
        } else {
          await signOutUser();
          return { success: false, error: 'Accès non autorisé' };
        }
      }
      return { success: false, error: 'Email ou mot de passe incorrect' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();

      if (result.success) {
        const adminData = await checkIfAdmin(result.user.uid);
        if (adminData) {
          setAdmin({
            id: result.user.uid,
            ...adminData,
            email: result.user.email,
            photoURL: result.user.photoURL
          });
          localStorage.setItem('adminData', JSON.stringify(adminData));
          return { success: true };
        } else {
          await signOutUser();
          return { success: false, error: 'Accès non autorisé' };
        }
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (firebaseAdmin) await signOutUser();
      localStorage.removeItem('adminData');
      setAdmin(null);
      setFirebaseAdmin(null);
    } catch (error) {
      console.error('Erreur déconnexion admin:', error);
    }
  };

  const isAuthenticated = () => !!admin && !!firebaseAdmin;

  return (
    <AdminAuthContext.Provider value={{
      admin,
      firebaseAdmin,
      loading,
      login,
      loginWithGoogle,
      logout,
      isAuthenticated,
      isLoggedIn: isAuthenticated()
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};