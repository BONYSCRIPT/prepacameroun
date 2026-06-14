import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MdError, MdHome, MdRefresh } from 'react-icons/md';
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import { toast } from 'react-toastify';

// Thème pour maintenir la cohérence visuelle
const theme = {
  colors: {
    primary: '#0d6efd',
    danger: '#dc3545',
    light: '#f8f9fa',
    white: '#ffffff',
    text: '#212529',
    muted: '#6c757d',
    border: '#dee2e6'
  },
  shadows: {
    card: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    button: '0 4px 6px rgba(13, 110, 253, 0.2)'
  },
  borderRadius: {
    default: '0.5rem',
    pill: '50rem'
  },
  transitions: {
    default: 'all 0.3s ease'
  }
};

const PaymentFailure = () => {
  const navigate = useNavigate();
  
  // Notification d'erreur
  useEffect(() => {
    toast.error('Une erreur est survenue lors du traitement de votre paiement.');
  }, []);
  
  // Fonction pour réessayer
  const handleRetry = () => {
    navigate(-1); // Retour à la page précédente
  };

  return (
    <>
      <NavbarApp />
      <div className="container" style={{ marginTop: '120px', maxWidth: '800px' }}>
        <div className="card border-0 p-4 p-md-5" style={{ 
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.default,
          boxShadow: theme.shadows.card
        }}>
          <div className="text-center mb-4">
            <div style={{ 
              backgroundColor: 'rgba(220, 53, 69, 0.1)', 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <MdError size={50} style={{ color: theme.colors.danger }} />
            </div>
            <h2 className="mb-3" style={{ color: theme.colors.danger, fontWeight: '600' }}>
              Échec du paiement
            </h2>
            <p className="mb-4 lead" style={{ color: theme.colors.text }}>
              Une erreur est survenue lors du traitement de votre paiement.
            </p>
            <div className="alert" style={{ 
              backgroundColor: 'rgba(220, 53, 69, 0.1)', 
              color: theme.colors.text,
              border: 'none',
              borderRadius: theme.borderRadius.default
            }}>
              <p className="mb-0">
                Veuillez vérifier vos informations de paiement et réessayer, ou contacter notre service client si le problème persiste.
              </p>
            </div>
          </div>
          
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-2">
            <Link 
              to="/user/dashboard" 
              className="btn d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.white,
                borderRadius: theme.borderRadius.pill,
                padding: '0.75rem 1.5rem',
                border: 'none',
                fontWeight: '500',
                boxShadow: theme.shadows.button,
                transition: theme.transitions.default
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0b5ed7';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <MdHome /> Tableau de bord
            </Link>
            
            <button 
              onClick={handleRetry}
              className="btn d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.danger,
                borderRadius: theme.borderRadius.pill,
                padding: '0.75rem 1.5rem',
                border: `1px solid ${theme.colors.danger}`,
                fontWeight: '500',
                transition: theme.transitions.default
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <MdRefresh /> Réessayer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailure;
