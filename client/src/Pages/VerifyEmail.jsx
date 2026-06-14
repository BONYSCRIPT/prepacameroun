import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../contexts/useUserAuth';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import theme from '../utils/theme';
import { toast } from 'react-toastify';


const VerifyEmail = () => {
  const { loginWithEmailAndPassword, firebaseUser, resendVerificationEmail, reloadFirebaseUser, loading } = useUserAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!firebaseUser) {
      navigate('/');
    }
  }, [firebaseUser, navigate]);

  const handleResendVerificationEmail = async () => {
    try {
      await resendVerificationEmail();
      toast.success('Email de vérification renvoyé avec succès !');
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email de vérification");
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      const user = await reloadFirebaseUser();
      const email = localStorage.getItem('pendingEmail');
      const password = localStorage.getItem('pendingPassword');

      if (user && user.emailVerified) {
        // Connexion automatique après vérification
        if (email && password) {
          const result = await loginWithEmailAndPassword(email, password);
          if (result.success) {
            localStorage.removeItem('pendingEmail');
            localStorage.removeItem('pendingPassword');
            toast.success("Votre email a bien été vérifié et vous êtes connecté !");
            navigate('/user/dashboard');
          } else {
            toast.error(result.error || "Erreur lors de la connexion automatique.");
          }
        } else {
          toast.success("Votre email a bien été vérifié !");
          navigate('/user/dashboard');
        }
      } else if (!user) {
        // Si l'utilisateur n'est pas connecté, propose la connexion manuelle
        toast.info("Veuillez vous connecter pour accéder à votre espace.");
        navigate('/login');
      } else {
        toast.info("Votre email n'est pas encore vérifié. Veuillez cliquer sur le lien reçu par email.");
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification de l'état de l'email.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0" style={{ borderRadius: theme.borderRadius.xl }}>
              <Card.Body className="p-5 text-center">
                <h2 style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: '20px' }}>
                  Vérification de l'email
                </h2>
                <p style={{ color: theme.colors.secondary, lineHeight: '1.6', marginBottom: '30px' }}>
                  Un email de vérification a été envoyé à votre adresse email. Veuillez cliquer sur le lien dans l'email pour vérifier votre adresse.
                </p>
                {loading && <Spinner animation="border" variant="primary" />}
                <p style={{ color: theme.colors.gray, fontSize: theme.fonts.sizes.sm }}>
                  Si vous n'avez pas reçu l'email, veuillez vérifier votre dossier spam.
                </p>
                <Button
                  variant="outline-primary"
                  onClick={handleResendVerificationEmail}
                  disabled={loading}
                  style={{ marginBottom: 16 }}
                >
                  Renvoyer l'email de vérification
                </Button>
                <br />
                <Button
                  variant="success"
                  onClick={handleCheckVerification}
                  disabled={checking || loading}
                >
                  J'ai vérifié mon email, continuer
                  {checking && <Spinner animation="border" size="sm" className="ms-2" />}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VerifyEmail;