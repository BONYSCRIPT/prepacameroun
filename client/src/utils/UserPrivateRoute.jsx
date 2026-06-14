import { Navigate, Outlet } from 'react-router-dom';
import { useUserAuth } from '../contexts/useUserAuth';
import { useEffect, useState } from 'react';
import EmailVerificationModal from '../Composants/EmailVerificationModal'; // Import du modal

const UserPrivateRoute = () => {
  const { user, firebaseUser, loading } = useUserAuth();
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false); // État pour le modal

  useEffect(() => {
    // Afficher le modal si l'utilisateur a accès au dashboard et que l'email n'est pas vérifié
    if (user && firebaseUser && !firebaseUser.emailVerified) {
      setShowEmailVerificationModal(true);
    } else {
      setShowEmailVerificationModal(false);
    }
  }, [firebaseUser, user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <EmailVerificationModal
        show={showEmailVerificationModal}
        onHide={() => setShowEmailVerificationModal(false)}
        userEmail={firebaseUser?.email}
      />
      {user ? <Outlet /> : <Navigate to="/" />}
    </>
  );
};

export default UserPrivateRoute;