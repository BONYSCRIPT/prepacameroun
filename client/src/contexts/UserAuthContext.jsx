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
  updateProfile,
  fetchSignInMethodsForEmail
} from 'firebase/auth';

import { toast } from 'react-toastify';

export const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛡️ Écoute des changements d'état d'authentification Firebase
  // ⚡ Version ultra-rapide : pas d'appel Firestore, juste localStorage
  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Utilisateur Firebase connecté → on le met dans le state immédiatement
        const localData = localStorage.getItem('userData');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            setUser(parsed);
          } catch {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL,
              provider: 'firebase',
              isAdmin: false
            });
          }
        } else {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
            provider: 'firebase',
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

        const newUser = {
          id: result.user.uid,
          email: result.user.email,
          username: username || result.user.displayName || email.split('@')[0],
          photoURL: result.user.photoURL,
          provider: 'email',
          isAdmin: false
        };
        setUser(newUser);
        localStorage.setItem('userData', JSON.stringify(newUser));

        toast.success("Inscription réussie !");
        return { success: true, user: newUser };
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

      // Vérifier les méthodes d'authentification disponibles
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length > 0 && !methods.includes('password')) {
        const provider = methods.includes('google.com') ? 'Google' : methods[0];
        toast.error(`Ce compte est lié à ${provider}. Veuillez vous connecter avec ${provider}.`);
        return { success: false, error: `${provider}` };
      }

      if (methods.length === 0) {
        toast.error("Aucun compte trouvé avec cet email.");
        return { success: false, error: "Aucun compte trouvé" };
      }

      const result = await signInWithEmailAndPassword(auth, email, password);

      if (result.user) {
        if (!auth.currentUser.emailVerified) {
          await signOutUser();
          toast.error("Veuillez vérifier votre email avant de vous connecter.");
          return { success: false, error: "Email non vérifié" };
        }

        const formattedUser = {
          id: result.user.uid,
          email: result.user.email,
          username: result.user.displayName || email.split('@')[0],
          photoURL: result.user.photoURL,
          provider: 'email',
          isAdmin: false
        };
        setUser(formattedUser);
        localStorage.setItem('userData', JSON.stringify(formattedUser));
        return { success: true, user: formattedUser };
      }

      return { success: false, error: "Erreur inconnue" };
    } catch (error) {
      let message = "Email ou mot de passe incorrect";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Email ou mot de passe incorrect";
      } else if (error.code === 'auth/user-disabled') {
        message = "Ce compte a été désactivé";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Trop de tentatives. Réessayez plus tard.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Format d'email invalide";
      } else {
        message = error.message || "Erreur de connexion";
      }
      toast.error(message);
      return { success: false, error: message };
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