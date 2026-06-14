import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap';
import { useUserAuth } from '../contexts/useUserAuth';
import Navbar from '../Composants/Navbar';
import { Modal } from 'react-bootstrap';
import { Accordion } from 'react-bootstrap';
import theme from '../utils/theme';
import GoogleSignInButton from '../Composants/GoogleSignInButton';
import {
  FaGraduationCap,
  FaBook,
  FaLaptop,
  FaUsers,
  FaChartLine,
  FaArrowRight,
  FaQuoteLeft,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import axios from 'axios';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

// Composant pour les statistiques avec design am lior  et responsive
const StatCard = ({ icon, count, label }) => (
  <div className="col-6 col-md-3 mb-4">
    <div className="card border-0 h-100 text-center p-3 p-md-4"
      style={{
        boxShadow: theme.shadows.card,
        borderRadius: theme.borderRadius.lg,
        transition: theme.transitions.default,
        cursor: 'pointer'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div className="card-body">
        <div style={{
          color: theme.colors.secondary, // Chang  en bleu
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          marginBottom: '1rem'
        }}>
          {icon}
        </div>
        <h2 className="fw-bold"
          style={{
            color: theme.colors.primary, // Gard  en rouge
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
          }}
        >
          {count}
        </h2>
        <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
          {label}
        </p>
      </div>
    </div>
  </div>
);

// Composant pour les t moignages avec design am lior  et responsive
const Testimonial = ({ name, role, image, text }) => (
  <div className="col-md-4 mb-4">
    <div className="card h-100 border-0 p-3 p-md-4"
      style={{
        boxShadow: theme.shadows.card,
        borderRadius: theme.borderRadius.lg,
        transition: theme.transitions.default
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div className="card-body d-flex flex-column">
        <div className="mb-3 text-start" style={{ color: theme.colors.secondary }}> {/* Chang  en bleu */}
          <FaQuoteLeft size={24} />
        </div>
        <p className="card-text fst-italic mb-4 text-start flex-grow-1">{text}</p>
        <div className="d-flex align-items-center mt-auto">
          <img
            src={image}
            alt={name}
            className="rounded-circle me-3"
            width="50"
            height="50"
            style={{ objectFit: 'cover', border: `3px solid ${theme.colors.primary}` }}
            loading="lazy"
          />
          <div className="text-start">
            <h5 className="mb-0 fw-bold fs-6">{name}</h5>
            <p className="text-muted mb-0 small">{role}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Composant pour les fonctionnalit s avec design am lior  et responsive
const FeatureCard = ({ icon, title, description }) => (
  <div className="col-md-4 mb-4">
    <div className="card h-100 border-0 p-3 p-md-4"
      style={{
        boxShadow: theme.shadows.card,
        borderRadius: theme.borderRadius.lg,
        transition: theme.transitions.default
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div className="card-body text-center d-flex flex-column align-items-center">
        <div style={{
          color: theme.colors.secondary, // Chang  en bleu
          background: theme.colors.lightAccent,
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)'
        }}>
          {icon}
        </div>
        <h4 className="card-title fw-bold mb-3 fs-5">{title}</h4>
        <p className="card-text text-muted small">{description}</p>
      </div>
    </div>
  </div>
);

// Composant pour les pr parations populaires avec design am lior  et responsive
const PrepaCard = ({ prepa, user, onLoginClick }) => (
  <div className="col-md-6 col-lg-4 mb-4">
    <div className="card h-100 border-0"
      style={{
        boxShadow: theme.shadows.card,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        transition: theme.transitions.default
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {prepa.image_url && (
        <div style={{ height: '180px', overflow: 'hidden' }}>
          <img
            src={prepa.image_url}
            className="card-img-top"
            alt={prepa.nom}
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            loading="lazy"
          />
        </div>
      )}
      <div className="card-body p-3 p-md-4">
        <h5 className="card-title fw-bold mb-2 fs-5">{prepa.nom}</h5>
        <p className="card-text text-muted mb-3 small text-truncate">{prepa.description}</p>
        <div className="d-flex justify-content-between align-items-center">
          <span className="badge rounded-pill px-3 py-2" style={{
            backgroundColor: theme.colors.primary,
            color: 'white',
            fontSize: '0.8rem'
          }}>
            {prepa.prix.toLocaleString()} XAF
          </span>
          {user ? (
            <Link
              to={`/user/prepa/${prepa.id}`}
              className="btn btn-sm d-flex align-items-center gap-2"
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.secondary, // Chang  en bleu
                border: `1px solid ${theme.colors.secondary}`, // Chang  en bleu
                borderRadius: theme.borderRadius.pill,
                padding: '6px 12px',
                fontWeight: '500',
                transition: theme.transitions.default
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.secondary; // Chang  en bleu
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.secondary; // Chang  en bleu
              }}
            >
              D couvrir <FaArrowRight />
            </Link>
          ) : (
            <button
              onClick={onLoginClick}
              className="btn btn-sm d-flex align-items-center gap-2"
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.secondary, // Chang  en bleu
                border: `1px solid ${theme.colors.secondary}`, // Chang  en bleu
                borderRadius: theme.borderRadius.pill,
                padding: '6px 12px',
                fontWeight: '500',
                transition: theme.transitions.default
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.secondary; // Chang  en bleu
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.secondary; // Chang  en bleu
              }}
            >
              D couvrir <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Composant principal Menu
function Menu() {
  const navigate = useNavigate();
  const { user, login, signup, loginWithEmailAndPassword } = useUserAuth();
  const [prepas, setPrepas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // D tection du mode mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sch ma de validation pour l'inscription
  const signupSchema = Yup.object().shape({
    username: Yup.string()
      .required('Le nom d\'utilisateur est requis')
      .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caract res')
      .max(30, 'Le nom d\'utilisateur ne doit pas d passer 30 caract res')
      .matches(/^[a-zA-Z0-9_]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, des chiffres et des underscores'),
    email: Yup.string()
      .required('L\'email est requis')
      .email('Email invalide')
      .test('allowed-domain', 'Domaine d\'email non autoris ', (value) => {
        if (!value) return true;
        const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        return allowedDomains.includes(value.split('@')[1]);
      }),
    password: Yup.string()
      .required("Le mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caract res")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caract re sp cial"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], "Les mots de passe doivent correspondre")
      .required("La confirmation du mot de passe est requise"),
  });

  // Sch ma de validation pour la connexion
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .required('L\'email est requis')
      .email('Email invalide'),
    password: Yup.string()
      .required('Le mot de passe est requis')
  });

  // Gestion des changements dans le formulaire de connexion
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  // Gestion des changements dans le formulaire d'inscription
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fermeture des modales
  const handleCloseModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setErrors({});
  };

  // Soumission du formulaire de connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await loginSchema.validate(loginData, { abortEarly: false });
      // Utiliser la fonction loginWithEmailAndPassword du contexte d'authentification
      const result = await loginWithEmailAndPassword(loginData.email, loginData.password);

      if (result.success) {
        // Stocker les informations pour la connexion automatique après vérification
        localStorage.setItem('pendingEmail', loginData.email);
        localStorage.setItem('pendingPassword', loginData.password);

        toast.success('Connexion réussie !');
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
        navigate('/user/dashboard');
      } else {
        // Vérifier si l'erreur est due à un email non vérifié
        if (result.error === "Email non vérifié") {
          toast.error("Veuillez vérifier votre email avant de vous connecter.");
          navigate('/verify-email-info'); // Rediriger vers la page VerifyEmailInfo
        } else {
          toast.error(result.error || 'Erreur lors de la connexion');
        }
      }
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        toast.error(err.message || 'Erreur lors de la connexion');
      }
    }
  };

  // Soumission du formulaire d'inscription
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await signupSchema.validate(formData, { abortEarly: false });
      // Utiliser la fonction signup du contexte d'authentification
      const result = await signup(formData.email, formData.password, formData.username);

      if (result.success) {
        toast.success('Inscription réussie! Veuillez vérifier votre email pour confirmer votre compte.');
        setShowSignupModal(false);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        // Supprimer cette ligne:
        // navigate('/verify-email-info');
      } else {
        toast.error(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (validationError) {
      const newErrors = {};
      validationError.inner.forEach(err => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  // Callbacks pour GoogleSignInButton - AJOUT
  const handleGoogleSuccess = (firebaseUser) => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    // Mettre à jour directement l'état de l'utilisateur avec les données de Firebase
    // Le hook useEffect dans UserAuthContext se chargera d'envoyer le token au backend
    navigate('/user/dashboard');
  };

  const handleGoogleError = (error) => {
    console.error('Erreur Google Auth:', error);
  };

  const fetchPrepas = useCallback(async () => {
    try {
      const response = await axios.get('/api/prepas/published');
      // V rifier que la r ponse est un tableau
      if (Array.isArray(response.data)) {
        setPrepas(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Si la r ponse est un objet avec une propri t  data qui est un tableau
        setPrepas(response.data.data);
      } else {
        console.warn('La r ponse API n\'est pas un tableau:', response.data);
        setPrepas([]); // Initialiser avec un tableau vide en cas d'erreur
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la r cup ration des pr parations:', error);
      setPrepas([]); // Initialiser avec un tableau vide en cas d'erreur
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrepas();
  }, [fetchPrepas]);

  // Ajout de la police Poppins
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Appliquer la police   tout le document
    document.body.style.fontFamily = theme.fonts.primary;

    return () => {
      document.head.removeChild(link);
      document.body.style.fontFamily = '';
    };
  }, []);

  return (
    <>
      <Navbar style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000
      }} />

      {/* Hero Section - Responsive avec image d'arri re-plan */}
      <section
        style={{
          height: "100vh",
          width: "100%",
          margin: 0,
          padding: 0,
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("/images/prepacouverture.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Overlay avec d grad  pour am liorer la lisibilit  */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 1
          }}
        ></div>

        {/* Contenu du hero - D plac  apr s l'overlay et avec un z-index sup rieur */}
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row">
            <div className="col-lg-10 col-xl-8 mx-auto text-center">
              <h1
                className="fw-bold mb-4"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontSize: 'clamp(1.75rem, 5vw, 3.5rem)'
                }}
              >
                Pr parez-vous   r ussir vos concours au Cameroun
              </h1>
              <p
                className="mb-5"
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  maxWidth: '800px',
                  margin: '0 auto 2rem'
                }}
              >
                PrepaCameroun vous offre des ressources p dagogiques de qualit  pour maximiser vos chances de r ussite aux concours administratifs et grandes  coles.
              </p>
              {user ? (
                <Link
                  to="/user/dashboard"
                  className="btn btn-lg px-4 px-md-5 py-2 py-md-3"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: 'white',
                    borderRadius: theme.borderRadius.pill,
                    fontWeight: '600',
                    boxShadow: theme.shadows.button,
                    transition: theme.transitions.default
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 7px 14px rgba(191, 0, 81, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primary;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme.shadows.button;
                  }}
                >
                  Acc der   mon espace
                </Link>
              ) : (
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                  <button
                    className="btn btn-lg px-4 px-md-5 py-2 py-md-3 mb-3 mb-sm-0"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: 'white',
                      borderRadius: theme.borderRadius.pill,
                      fontWeight: '600',
                      boxShadow: theme.shadows.button,
                      transition: theme.transitions.default
                    }}
                    onClick={() => setShowSignupModal(true)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 7px 14px rgba(191, 0, 81, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primary;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = theme.shadows.button;
                    }}
                  >
                    S&apos;inscrire
                  </button>
                  <button
                    className="btn btn-lg px-4 px-md-5 py-2 py-md-3"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'white',
                      borderRadius: theme.borderRadius.pill,
                      fontWeight: '600',
                      border: '2px solid white',
                      transition: theme.transitions.default
                    }}
                    onClick={() => setShowLoginModal(true)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Se connecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Responsive */}
      <section className="py-4 py-md-5" style={{ backgroundColor: theme.colors.light }}>
        <div className="container py-3 py-md-4">
          <h2
            className="text-center mb-4 mb-md-5 fw-bold"
            style={{
              color: theme.colors.dark,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)'
            }}
          >
            Pourquoi choisir PrepaCameroun ?
          </h2>
          <div className="row g-3">
            <StatCard
              icon={<FaGraduationCap />}
              count="15+"
              label="Pr parations aux concours"
            />
            <StatCard
              icon={<FaBook />}
              count="500+"
              label="Le ons et exercices"
            />
            <StatCard
              icon={<FaUsers />}
              count="1000+"
              label=" tudiants satisfaits"
            />
            <StatCard
              icon={<FaChartLine />}
              count="85%"
              label="Taux de r ussite"
            />
          </div>
        </div>
      </section>

      {/* Features Section - Responsive */}
      <section className="py-4 py-md-5">
        <div className="container py-3 py-md-4">
          <h2
            className="text-center mb-4 mb-md-5 fw-bold"
            style={{
              color: theme.colors.dark,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)'
            }}
          >
            Nos fonctionnalit s
          </h2>
          <div className="row g-3">
            <FeatureCard
              icon={<FaBook />}
              title="Cours complets"
              description="Acc dez   des cours d taill s et structur s pour chaque mati re, r dig s par des experts acad miques camerounais."
            />
            <FeatureCard
              icon={<FaLaptop />}
              title="Exercices corrig s"
              description="Testez vos connaissances avec des exercices pratiques et consultez les corrections d taill es pour progresser rapidement."
            />
            <FeatureCard
              icon={<FaGraduationCap />}
              title="Anciens sujets"
              description="Entra nez-vous avec les sujets des ann es pr c dentes pour vous familiariser avec le format des examens et gagner en confiance."
            />
          </div>
        </div>
      </section>

      {/* Popular Prepas Section - Responsive */}
      <section className="py-4 py-md-5" style={{ backgroundColor: theme.colors.light }}>
        <div className="container py-3 py-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 mb-md-5">
            <h2
              className="fw-bold mb-3 mb-md-0"
              style={{
                color: theme.colors.dark,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)'
              }}
            >
              Pr parations populaires
            </h2>
            {user ? (
              <Link
                to="/user/dashboard"
                className="btn d-flex align-items-center gap-2"
                style={{
                  backgroundColor: theme.colors.secondary, // Chang  en bleu
                  color: 'white',
                  borderRadius: theme.borderRadius.pill,
                  padding: '8px 16px',
                  fontWeight: '500',
                  transition: theme.transitions.default
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.secondaryDark;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.secondary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Voir tout <FaArrowRight />
              </Link>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn d-flex align-items-center gap-2"
                style={{
                  backgroundColor: theme.colors.secondary, // Chang  en bleu
                  color: 'white',
                  borderRadius: theme.borderRadius.pill,
                  padding: '8px 16px',
                  fontWeight: '500',
                  transition: theme.transitions.default
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.secondaryDark;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.secondary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Voir tout <FaArrowRight />
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status" style={{ color: theme.colors.primary }}>
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {Array.isArray(prepas) ?
                prepas.slice(0, isMobile ? 2 : 3).map(prepa => (
                  <PrepaCard
                    key={prepa.id}
                    prepa={prepa}
                    user={user}
                    onLoginClick={() => setShowLoginModal(true)}
                  />
                )) :
                <div className="col-12 text-center">
                  <p>Aucune pr paration disponible pour le moment.</p>
                </div>
              }
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section - Responsive */}
      <section className="py-4 py-md-5">
        <div className="container py-3 py-md-4">
          <h2
            className="text-center mb-4 mb-md-5 fw-bold"
            style={{
              color: theme.colors.dark,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)'
            }}
          >
            Ce que disent nos  tudiants
          </h2>
          <div className="row g-3">
            <Testimonial
              name="Kamdem Jean"
              role=" tudiant en Droit"
              image="/images/testimonial1.jpg"
              text="Gr ce   PrepaCameroun, j'ai r ussi le concours d'entr e   l'ENAM. Les cours sont clairs et les exercices m'ont vraiment aid    comprendre les concepts difficiles."
            />
            <Testimonial
              name="Ngo Bassa Marie"
              role=" tudiante en Sciences  conomiques"
              image="/images/testimonial2.jpg"
              text="La plateforme est intuitive et les ressources sont de grande qualit . J'ai pu me pr parer efficacement pour mon concours tout en continuant mes  tudes."
            />
            <Testimonial
              name="Mbarga Paul"
              role="Dipl m  en Informatique"
              image="/images/testimonial3.jpg"
              text="Les anciens sujets disponibles sur PrepaCameroun m'ont permis de comprendre le format des examens et de mieux g rer mon temps le jour J. Je recommande vivement!"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section - Responsive */}
      <section className="py-4 py-md-5" style={{ backgroundColor: theme.colors.light }}>
        <div className="container py-3 py-md-4">
          <h2
            className="text-center mb-4 mb-md-5 fw-bold"
            style={{
              color: theme.colors.dark,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)'
            }}
          >
            Questions fr quentes
          </h2>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Comment acc der aux cours et exercices ?</Accordion.Header>
                  <Accordion.Body>
                    Pour acc der   nos ressources p dagogiques, vous devez d&apos;abord cr er un compte, puis souscrire   une pr paration sp cifique. Une fois inscrit, vous aurez acc s   tous les contenus de cette pr paration pendant 30 jours.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>Combien co te une pr paration ?</Accordion.Header>
                  <Accordion.Body>
                    Les prix varient selon la pr paration choisie. Ils sont clairement indiqu s sur la page de chaque pr paration. Nous proposons des tarifs abordables pour rendre l&apos; ducation accessible   tous.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                  <Accordion.Header>Puis-je acc der aux contenus hors ligne ?</Accordion.Header>
                  <Accordion.Body>
                    Actuellement, notre plateforme n cessite une connexion internet pour acc der aux contenus. Cependant, vous pouvez t l charger certains documents PDF pour les consulter hors ligne.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                  <Accordion.Header>Comment renouveler mon abonnement ?</Accordion.Header>
                  <Accordion.Body>
                    Votre abonnement est valable pour 30 jours.   l&apos;expiration, vous pouvez le renouveler en vous rendant dans votre tableau de bord et en effectuant un nouveau paiement pour la pr paration souhait e.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="4">
                  <Accordion.Header>Y a-t-il un support p dagogique disponible ?</Accordion.Header>
                  <Accordion.Body>
                    Nous n&apos;offrons pas encore de tutorat personnalis , mais nos contenus sont con us pour  tre auto-suffisants. Nous pr voyons d&apos;ajouter des fonctionnalit s de support dans le futur.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Responsive */}
      <section
        className="py-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("/images/cta-background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <div className="container py-4">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h2
                className="fw-bold mb-4"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)'
                }}
              >
                Pr t   commencer votre pr paration ?
              </h2>
              <p
                className="mb-4"
                style={{
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                  maxWidth: '700px',
                  margin: '0 auto 2rem'
                }}
              >
                Rejoignez des milliers d&apos; tudiants qui ont d j  fait confiance   PrepaCameroun pour r ussir leurs concours. Inscrivez-vous d s aujourd&apos;hui !
              </p>
              {user ? (
                <Link
                  to="/user/dashboard"
                  className="btn btn-lg px-4 px-md-5 py-2 py-md-3"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: 'white',
                    borderRadius: theme.borderRadius.pill,
                    fontWeight: '600',
                    boxShadow: theme.shadows.button,
                    transition: theme.transitions.default
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 7px 14px rgba(191, 0, 81, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primary;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme.shadows.button;
                  }}
                >
                  Acc der   mon espace
                </Link>
              ) : (
                <button
                  className="btn btn-lg px-4 px-md-5 py-2 py-md-3"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: 'white',
                    borderRadius: theme.borderRadius.pill,
                    fontWeight: '600',
                    boxShadow: theme.shadows.button,
                    transition: theme.transitions.default
                  }}
                  onClick={() => setShowSignupModal(true)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 7px 14px rgba(191, 0, 81, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primary;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme.shadows.button;
                  }}
                >
                  S&apos;inscrire maintenant
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Responsive */}
      <footer className="py-4 py-md-5" style={{ backgroundColor: theme.colors.dark, color: 'white' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="fw-bold mb-3">PrepaCameroun</h5>
              <p className="mb-3">Votre partenaire pour r ussir les concours administratifs et grandes  coles au Cameroun.</p>
              <div className="d-flex gap-3">
                <a href="#" className="text-white" style={{ fontSize: '1.5rem' }}><FaFacebookF /></a>
                <a href="#" className="text-white" style={{ fontSize: '1.5rem' }}><FaTwitter /></a>
                <a href="#" className="text-white" style={{ fontSize: '1.5rem' }}><FaInstagram /></a>
                <a href="#" className="text-white" style={{ fontSize: '1.5rem' }}><FaLinkedinIn /></a>
              </div>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold mb-3">Liens rapides</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-white text-decoration-none">Accueil</a></li>
                <li className="mb-2"><a href="#" className="text-white text-decoration-none">Pr parations</a></li>
                <li className="mb-2"><a href="#" className="text-white text-decoration-none">  propos</a></li>
                <li className="mb-2"><a href="#" className="text-white text-decoration-none">Contact</a></li>
                <li className="mb-2"><a href="#" className="text-white text-decoration-none">Conditions d&apos;utilisation</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold mb-3">Contact</h5>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-center gap-2">
                  <FaMapMarkerAlt /> <span>Yaound , Cameroun</span>
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <FaPhone /> <span>+237 6XX XXX XXX</span>
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <FaEnvelope /> <span>contact@prepacameroun.com</span>
                </li>
              </ul>
            </div>
          </div>
          <hr className="my-4" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} PrepaCameroun. Tous droits r serv s.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: theme.colors.light }}>
          <Modal.Title style={{ color: theme.colors.dark, fontWeight: '600' }}>Connexion</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.colors.light }}>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginInputChange}
                placeholder="Entrez votre email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                placeholder="Entrez votre mot de passe"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            <div className="mb-3 text-end">
              <Link
                to="/forgot-password"
                className="text-decoration-none small"
                style={{ color: theme.colors.secondary }}
                onClick={() => setShowLoginModal(false)}
              >
                Mot de passe oubli  ?
              </Link>
            </div>
            <div className="d-grid gap-2 mt-4">
              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: theme.colors.secondary,
                  color: 'white',
                  borderRadius: theme.borderRadius.pill,
                  fontWeight: '500',
                  transition: theme.transitions.default
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.secondaryDark;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.secondary;
                }}
              >
                Se connecter
              </button>

              <div className="my-3 d-flex align-items-center">
                <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                <span style={{ margin: "0 12px", color: "#888" }}>ou</span>
                <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
              </div>

              <GoogleSignInButton
                variant="login"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={isGoogleLoading}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.colors.light, borderTop: 'none' }}>
          <p className="w-100 text-center mb-0">
            Pas encore de compte ?{' '}
            <button
              className="btn btn-link p-0"
              style={{ color: theme.colors.primary, textDecoration: 'none' }}
              onClick={() => {
                setShowLoginModal(false);
                setShowSignupModal(true);
              }}
            >
              S&apos;inscrire
            </button>
          </p>
        </Modal.Footer>
      </Modal>

      {/* Signup Modal */}
      <Modal show={showSignupModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: theme.colors.light }}>
          <Modal.Title style={{ color: theme.colors.dark, fontWeight: '600' }}>Inscription</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.colors.light }}>
          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Nom d&apos;utilisateur</label>
              <input
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choisissez un nom d'utilisateur"
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="signupEmail" className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="signupEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Entrez votre email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="signupPassword" className="form-label">Mot de passe</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="signupPassword"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Cr ez un mot de passe"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              <small className="form-text text-muted">
                Le mot de passe doit contenir au moins 8 caract res, une majuscule, une minuscule, un chiffre et un caract re sp cial.
              </small>
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmez votre mot de passe"
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
            <div className="d-grid gap-2 mt-4">
              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  borderRadius: theme.borderRadius.pill,
                  fontWeight: '500',
                  transition: theme.transitions.default
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary;
                }}
              >
                S&apos;inscrire
              </button>

              <div className="my-3 d-flex align-items-center">
                <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                <span style={{ margin: "0 12px", color: "#888" }}>ou</span>
                <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
              </div>

              <GoogleSignInButton
                variant="signup"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={isGoogleLoading}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.colors.light, borderTop: 'none' }}>
          <p className="w-100 text-center mb-0">
            D j  un compte ?{' '}
            <button
              className="btn btn-link p-0"
              style={{ color: theme.colors.secondary, textDecoration: 'none' }} // Chang  en bleu
              onClick={() => {
                setShowSignupModal(false);
                setShowLoginModal(true);
              }}
            >
              Se connecter
            </button>
          </p>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Menu;



