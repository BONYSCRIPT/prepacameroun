import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useUserAuth } from '../contexts/useUserAuth';
import theme from '../utils/theme';
import { useNavigate } from 'react-router-dom';

const EmailVerificationModal = ({ show, onHide, userEmail }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'verified', 'error'
  const { reloadFirebaseUser, resendVerificationEmail } = useUserAuth();
  const navigate = useNavigate();

  // Vérifier le statut de vérification périodiquement
  useEffect(() => {
    let interval;

    const checkVerification = async () => {
      try {
        const user = await reloadFirebaseUser();
        if (user && user.emailVerified) {
          setVerificationStatus('verified');
          toast.success('Email vérifié avec succès !');
          setTimeout(() => {
            navigate('/user/dashboard'); // Rediriger vers le dashboard
            onHide(); // Fermer le modal
          }, 2000);
        } else {
          // **Ajouter cette condition pour gérer le cas où l'email n'est pas encore vérifié**
          setVerificationStatus('pending');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        //toast.error('Erreur lors de la vérification de l\'email'); // **Commenter cette ligne**
        //setVerificationStatus('error'); // **Commenter cette ligne**
      }
    };

    if (show && verificationStatus === 'pending') {
      checkVerification(); // Vérification initiale

      interval = setInterval(checkVerification, 5000); // Vérifier toutes les 5 secondes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [show, reloadFirebaseUser, navigate, onHide]);

  const handleResendEmail = async () => {
    setIsVerifying(true);
    try {
      const result = await resendVerificationEmail();
      if (result.success) {
        toast.success('Email de vérification renvoyé ! Vérifiez votre boîte de réception (et votre dossier spam).');
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi');
        //setVerificationStatus('error'); // **Commenter cette ligne**
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
      //setVerificationStatus('error'); // **Commenter cette ligne**
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAlreadyVerified = async () => {
    setIsVerifying(true);
    try {
      const user = await reloadFirebaseUser();
      if (user && user.emailVerified) {
        setVerificationStatus('verified');
        toast.success('Email vérifié avec succès !');
        setTimeout(() => {
          navigate('/user/dashboard'); // Rediriger vers le dashboard
          onHide(); // Fermer le modal
        }, 2000);
      } else {
        toast.warn("L'adresse email n'a pas encore été vérifiée. Veuillez vérifier votre boîte de réception et/ou spam.");
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      toast.error('Erreur lors de la vérification de l\'email');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => { }} // Empêcher la fermeture manuelle
      backdrop="static"
      keyboard={false}
      centered
      size="md"
    >
      <Modal.Header style={{
        backgroundColor: theme.colors.primary,
        color: 'white',
        border: 'none'
      }}>
        <Modal.Title className="d-flex align-items-center gap-2">
          <FaEnvelope />
          Vérification de votre email
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center py-4">
        {/* Affichez toujours le contenu de 'pending' sauf si le status est 'verified' */}
        {verificationStatus !== 'verified' && (
          <>
            <div className="mb-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: theme.colors.lightAccent,
                  borderRadius: '50%',
                  color: theme.colors.secondary
                }}
              >
                <FaEnvelope size={40} />
              </div>
              <h5 className="fw-bold mb-3">Vérifiez votre adresse email</h5>

              {/* Ajout d'un message explicite pour consulter les emails */}
              <Alert variant="info" className="d-flex align-items-center gap-2">
                <FaExclamationTriangle />
                Vérifiez votre boîte de réception et votre dossier spam pour trouver l'email de vérification.
              </Alert>

              <p className="text-muted mb-4">
                Un email de vérification a été envoyé à :<br />
                <strong style={{ color: theme.colors.primary }}>{userEmail}</strong>
              </p>
            </div>

            <div className="d-grid gap-2">
              <Button
                variant="outline-primary"
                onClick={handleResendEmail}
                disabled={isVerifying}
                style={{
                  borderRadius: theme.borderRadius.md
                }}
              >
                {isVerifying ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Envoi...
                  </>
                ) : (
                  "Renvoyer l'email"
                )}
              </Button>

              {/* Ajout du bouton "J'ai déjà vérifié" */}
              <Button
                variant="success"
                onClick={handleAlreadyVerified}
                disabled={isVerifying}
                style={{
                  borderRadius: theme.borderRadius.md
                }}
              >
                {isVerifying ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Vérification...
                  </>
                ) : (
                  "J'ai déjà vérifié mon adresse email"
                )}
              </Button>
            </div>
          </>
        )}

        {verificationStatus === 'verified' && (
          <div>
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#d4edda',
                borderRadius: '50%',
                color: '#155724'
              }}
            >
              <FaCheckCircle size={40} />
            </div>
            <h5 className="fw-bold text-success mb-3">Email vérifié !</h5>
            <p className="text-muted">
              Votre email a été vérifié avec succès. Redirection vers votre tableau de bord...
            </p>
          </div>
        )}
      </Modal.Body>

      {verificationStatus !== 'verified' && (
        <Modal.Footer style={{ border: 'none', justifyContent: 'center' }}>
          <small className="text-muted">
            Cette fenêtre se fermera automatiquement après vérification
          </small>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default EmailVerificationModal;
