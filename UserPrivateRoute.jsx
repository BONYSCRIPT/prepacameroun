import { Navigate, Outlet } from 'react-router-dom';
import { useUserAuth } from '../contexts/useUserAuth';
import { useEffect, useState } from 'react';
import EmailVerificationModal from '../Composants/EmailVerificationModal'; // Import du modal

const UserPrivateRoute = () => {
  const { user, firebaseUser } = useUserAuth();
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false); // État pour le modal

  useEffect(() => {
    // Afficher le modal si l'utilisateur Firebase existe, que l'email n'est pas vérifié, et que l'utilisateur a des informations dans le contexte
    if (user && firebaseUser && !firebaseUser.emailVerified) {
      setShowEmailVerificationModal(true);
    } else {
      setShowEmailVerificationModal(false);
    }
  }, [firebaseUser, user]);

  return (
    <>
      {/* Afficher le modal de vérification d'email */}
      <EmailVerificationModal
        show={showEmailVerificationModal}
        onHide={() => setShowEmailVerificationModal(false)} // Empêcher la fermeture manuelle
        userEmail={firebaseUser?.email}
      />
      {/* Afficher les routes protégées si l'utilisateur est authentifié */}
      {user ? <Outlet /> : <Navigate to="/" />}
    </>
  );
};

export default UserPrivateRoute;