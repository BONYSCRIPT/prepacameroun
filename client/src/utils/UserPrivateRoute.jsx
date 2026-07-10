import { Navigate, Outlet } from 'react-router-dom';
import { useUserAuth } from '../contexts/useUserAuth';
import { useEffect, useState } from 'react';
import EmailVerificationModal from '../Composants/EmailVerificationModal'; // Import du modal

const UserPrivateRoute = () => {
  const { user, firebaseUser, loading } = useUserAuth();
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);

  // Fallback depuis le localStorage pour éviter le flash de redirection
  const [localUser] = useState(() => {
    try {
      const saved = localStorage.getItem('userData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user && firebaseUser && !firebaseUser.emailVerified) {
      setShowEmailVerificationModal(true);
    } else {
      setShowEmailVerificationModal(false);
    }
  }, [firebaseUser, user]);

  if (loading) {
    // Même en chargement, si localStorage a l'utilisateur, on laisse passer
    if (localUser) {
      return <Outlet />;
    }
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
      {user || localUser ? <Outlet /> : <Navigate to="/" />}
    </>
  );
};

export default UserPrivateRoute;