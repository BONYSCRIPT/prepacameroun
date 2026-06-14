import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdCancel, MdHome, MdArrowBack } from 'react-icons/md';
import NavbarApp from '../Composants/Dashboard/NavbarApp';

// Thème pour maintenir la cohérence visuelle
const theme = {
  colors: {
    primary: '#0d6efd',
    warning: '#ffc107',
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

const PaymentCancel = () => {
  const { prepaId } = useParams();
  const navigate = useNavigate();

  // Effet pour la redirection automatique
  useEffect(() => {
    toast.info('Paiement annulé. Vous allez être redirigé vers votre tableau de bord.');
    const timer = setTimeout(() => {
      navigate('/user/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Compteur pour la redirection
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

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
              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <MdCancel size={50} style={{ color: theme.colors.warning }} />
            </div>
            <h2 className="mb-3" style={{ color: theme.colors.warning, fontWeight: '600' }}>
              Paiement annulé
            </h2>
            <p className="mb-2 lead" style={{ color: theme.colors.text }}>
              Votre paiement a été annulé. Vous allez être redirigé vers votre tableau de bord dans <span style={{ fontWeight: 'bold' }}>{countdown}</span> secondes.
            </p>
            <p className="mb-4" style={{ color: theme.colors.muted }}>
              ID de la préparation : <span style={{ fontWeight: '500' }}>{prepaId}</span>
            </p>
            <div className="alert" style={{ 
              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
              color: theme.colors.text,
              border: 'none',
              borderRadius: theme.borderRadius.default
            }}>
              <p className="mb-0">
                Vous pouvez réessayer l&apos;inscription à tout moment depuis votre tableau de bord.
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
            
            <Link 
              to={`/user/prepa/consultation/${prepaId}`} 
              className="btn d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.primary,
                borderRadius: theme.borderRadius.pill,
                padding: '0.75rem 1.5rem',
                border: `1px solid ${theme.colors.primary}`,
                fontWeight: '500',
                transition: theme.transitions.default
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <MdArrowBack /> Retour à la préparation
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentCancel;
