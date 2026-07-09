import { createContext, useState, useEffect } from 'react';
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
  auth
} from '../config/firebase';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';

import { getOrCreateUser, checkIfAdmin } from '../services/firestoreService';
import { toast } from 'react-toastify';

export const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛡️ Écoute des changements d'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Crée ou récupère l'utilisateur dans Firestore directement
          const firestoreUser = await getOrCreateUser(firebaseUser);
          
          // Vérifie si l'utilisateur est aussi admin (même UID peut être dans les 2 collections)
          const adminData = await checkIfAdmin(firebaseUser.uid);
          
          setUser({
            id: firebaseUser.uid,
            ...firestoreUser,
            email: firebaseUser.email,
            username: firestoreUser.username || firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
            provider: firestoreUser.provider || 'firebase',
            isAdmin: !!adminData,
            adminRole: adminData?.role || null
          });
          localStorage.setItem('userData', JSON.stringify({ ...firestoreUser, isAdmin: !!adminData, adminRole: adminData?.role }));
        } catch (error) {
          console.error('Erreur Firestore:', error);
          // Session dégradée
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
            provider: 'firebase',
            isPartial: true,
            isAdmin: false
          });
        }
      } else {
        localStorage.removeItem('userData');
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 📂 Chargement localStorage (fallback pour les rechargements)
  useEffect(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser && !user) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur restauration utilisateur:', error);
        localStorage.removeItem('userData');
      }
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();

      if (result.success) {
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (firebaseUser) await signOutUser();
      localStorage.removeItem('userData');
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const signup = async (email, password, username) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (result.user) {
        await updateProfile(auth.currentUser, { displayName: username });
        await sendEmailVerification(auth.currentUser);
        toast.success("Inscription réussie ! Vérifiez votre email.");
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmailAndPassword = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);

      if (result.user) {
        if (!auth.currentUser.emailVerified) {
          await signOutUser();
          toast.error("Veuillez vérifier votre email.");
          return { success: false, error: "Email non vérifié" };
        }

        setUser(result.user);
        return { success: true, user: result.user };
      }

      return { success: false, error: "Erreur inconnue" };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setLoading(true);
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success('Email de vérification renvoyé !');
        return { success: true };
      }
      return { success: false, error: 'Aucun utilisateur connecté' };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Erreur reset password:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return null;
  };

  const isAuthenticated = () => !!user && !!firebaseUser;

  const getFirebaseToken = async () => {
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return null;
  };

  const reloadFirebaseUser = async () => {
    await auth.currentUser?.reload();
    return auth.currentUser;
  };

  return (
    <UserAuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      login,
      loginWithGoogle,
      logout,
      getAuthToken,
      getFirebaseToken,
      reloadFirebaseUser,
      isAuthenticated,
      isLoggedIn: isAuthenticated(),
      signup,
      loginWithEmailAndPassword,
      resendVerificationEmail,
      resetPassword,
    }}>
      {children}
    </UserAuthContext.Provider>
  );
};