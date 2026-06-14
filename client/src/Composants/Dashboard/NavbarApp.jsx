import { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap';
import logo from '../images/prepalogo.png';
import axios from 'axios';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useUserAuth } from '../../contexts/useUserAuth';
import { MdAccountCircle, MdOutlineNotifications, MdPersonOutline, MdClose, MdLogout, MdSettings, MdHome } from 'react-icons/md';
import NotificationBell from './NavbarApp/NotificationBell';

const NavbarApp = () => {
  // Thème de couleurs pour la cohérence avec le reste de l'application
  const theme = {
    primary: '#be0050',
    primaryDark: '#770033',
    secondary: '#212529',
    secondaryDark: '#0d1114',
    success: '#28a745',
    successDark: '#1e7e34',
    danger: '#dc3545',
    dangerDark: '#bd2130',
    light: '#f8f9fa',
    dark: '#212529',
    transition: 'all 0.3s ease',
    buttonBorderRadius: '30px',
    cardShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    buttonShadow: '0 4px 6px rgba(190, 0, 80, 0.2)',
    borderRadius: '8px'
  };

  const { user, login, logout } = useUserAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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

  // Schémas de validation existants...
  const signupSchema = Yup.object().shape({
    username: Yup.string()
      .required('Le nom d\'utilisateur est requis')
      .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
      .max(30, 'Le nom d\'utilisateur ne doit pas dépasser 30 caractères')
      .matches(/^[a-zA-Z0-9_]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, des chiffres et des underscores'),
    email: Yup.string()
      .required('L\'email est requis')
      .email('Email invalide')
      .test('allowed-domain', 'Domaine d\'email non autorisé', (value) => {
        const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        return allowedDomains.includes(value.split('@')[1]);
      }),
    password: Yup.string()
      .required("Le mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], "Les mots de passe doivent correspondre")
      .required("La confirmation du mot de passe est requise"),
  });

  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .required('L\'email est requis')
      .email('Email invalide'),
    password: Yup.string()
      .required('Le mot de passe est requis')
  });

  // Gestionnaires d'événements existants...
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signupSchema.validate(formData, { abortEarly: false });
      const response = await axios.post('/api/users/register', formData);
      toast.success('Inscription réussie !');
      setShowSignupModal(false);
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        toast.error('Erreur lors de l\'inscription');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginSchema.validate(loginData, { abortEarly: false });
      const response = await axios.post('/api/users/login', loginData);
      login(response.data.user);
      toast.success('Connexion réussie !');
      setShowLoginModal(false);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        toast.error('Erreur lors de la connexion');
      }
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleSignupClick = () => {
    setShowSignupModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setShowNotifications(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  return (
    <nav className="navbar navbar-expand-lg"
      style={{
        backgroundColor: 'white',
        boxShadow: theme.cardShadow,
        padding: '10px 16px'
      }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="Logo"
            width="40"
            height="40"
            style={{
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: theme.transition
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          {user ? (
            <div className="d-flex flex-column flex-lg-row align-items-center">
              <NotificationBell theme={theme} />

              <div className="btn-group me-lg-3 mt-2 mt-lg-0">
                <button
                  type="button"
                  className="btn rounded-circle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    backgroundColor: theme.primary,
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.buttonShadow,
                    transition: theme.transition
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryDark;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primary;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <MdPersonOutline className='fs-4' />
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end shadow"
                  style={{
                    width: 'min(18vw, 250px)',
                    borderRadius: theme.borderRadius,
                    border: 'none',
                    padding: '12px 0'
                  }}
                >
                  <li>
                    <div className="dropdown-item d-flex align-items-center" style={{ color: theme.dark }}>
                      <MdSettings className="me-2" />
                      <span>Profil</span>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li className='d-flex justify-content-center py-2'>
                    <div
                      style={{
                        backgroundColor: theme.light,
                        borderRadius: '50%',
                        padding: '10px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    >
                      <MdAccountCircle
                        style={{
                          fontSize: 'min(20vh, 120px)',
                          color: theme.primary
                        }}
                      />
                    </div>
                  </li>
                  <li className='p-2 ps-4 pe-4'>
                    <input
                      className='form-control text-center fw-bold'
                      value={user ? user.username : "Utilisateur"}
                      readOnly
                      style={{
                        borderRadius: theme.borderRadius,
                        backgroundColor: theme.light,
                        border: 'none',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    />
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center justify-content-center"
                      onClick={handleLogout}
                      style={{
                        color: theme.danger,
                        fontWeight: '500',
                        transition: theme.transition
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = theme.light;
                        e.currentTarget.style.color = theme.dangerDark;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = theme.danger;
                      }}
                    >
                      <MdLogout className="me-2" />
                      <span>Déconnexion</span>
                    </button>
                  </li>
                </ul>
              </div>

              <Link
                to="/"
                className="btn btn-outline-primary me-lg-3 mb-2 mb-lg-0 d-flex align-items-center justify-content-center shadow-sm"
                style={{
                  borderRadius: theme.buttonBorderRadius,
                  padding: '8px 16px',
                  fontWeight: '600',
                  transition: theme.transition,
                  borderColor: theme.primary,
                  color: theme.primary,
                  backgroundColor: 'white'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = theme.primary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <MdHome className="me-2" size={20} />
                Accueil
              </Link>

              <button
                className="btn mt-2 mt-lg-0"
                onClick={handleLogout}
                style={{
                  backgroundColor: theme.danger,
                  color: 'white',
                  borderRadius: theme.buttonBorderRadius,
                  padding: '8px 16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px rgba(220, 53, 69, 0.2)',
                  transition: theme.transition
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.dangerDark;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.danger;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column flex-lg-row align-items-center">
              <button
                className="btn mb-2 mb-lg-0 me-lg-2"
                onClick={handleLoginClick}
                style={{
                  backgroundColor: theme.primary,
                  color: 'white',
                  borderRadius: theme.buttonBorderRadius,
                  padding: '8px 16px',
                  fontWeight: '600',
                  boxShadow: theme.buttonShadow,
                  transition: theme.transition
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primaryDark;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Connexion
              </button>

              <Link
                to="/"
                className="btn btn-outline-primary mb-2 mb-lg-0 me-lg-3 d-flex align-items-center justify-content-center shadow-sm"
                style={{
                  borderRadius: theme.buttonBorderRadius,
                  padding: '8px 16px',
                  fontWeight: '600',
                  transition: theme.transition,
                  borderColor: theme.primary,
                  color: theme.primary,
                  backgroundColor: 'white'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = theme.primary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <MdHome className="me-2" size={20} />
                Accueil
              </Link>

              <button
                className="btn"
                onClick={handleSignupClick}
                style={{
                  backgroundColor: theme.success,
                  color: 'white',
                  borderRadius: theme.buttonBorderRadius,
                  padding: '8px 16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)',
                  transition: theme.transition
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.successDark;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.success;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Inscription
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de connexion */}
      {showLoginModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
            <div className="modal-content" style={{ borderRadius: theme.borderRadius, overflow: 'hidden' }}>
              <div className="modal-header" style={{ backgroundColor: theme.light, borderBottom: 'none' }}>
                <h5 className="modal-title fw-bold" style={{ color: theme.dark }}>Connexion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  style={{ transition: theme.transition }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
                ></button>
              </div>
              <div className="modal-body" style={{ backgroundColor: theme.light, padding: '20px 30px' }}>
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-medium">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder='Entrez votre email'
                      id="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginInputChange}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 12px',
                        border: '1px solid #ced4da',
                        transition: theme.transition
                      }}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium">Mot de passe</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder='Entrez votre mot de passe'
                      id="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginInputChange}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 12px',
                        border: '1px solid #ced4da',
                        transition: theme.transition
                      }}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn"
                      style={{
                        backgroundColor: theme.primary,
                        color: 'white',
                        borderRadius: theme.buttonBorderRadius,
                        padding: '10px',
                        fontWeight: '600',
                        boxShadow: theme.buttonShadow,
                        transition: theme.transition
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = theme.primaryDark;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = theme.primary;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Connexion
                    </button>
                  </div>
                </form>
              </div>
              <div className="modal-footer justify-content-center" style={{ backgroundColor: theme.light, borderTop: 'none', paddingBottom: '20px' }}>
                <p className="text-center mb-0">
                  Pas encore de compte?{' '}
                  <button
                    className="btn btn-link p-0"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowSignupModal(true);
                    }}
                    style={{
                      color: theme.primary,
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: theme.transition
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = theme.primaryDark;
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = theme.primary;
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    S&apos;inscrire
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'inscription */}
      {showSignupModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
            <div className="modal-content" style={{ borderRadius: theme.borderRadius, overflow: 'hidden' }}>
              <div className="modal-header" style={{ backgroundColor: theme.light, borderBottom: 'none' }}>
                <h5 className="modal-title fw-bold" style={{ color: theme.dark }}>Inscription</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  style={{ transition: theme.transition }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
                ></button>
              </div>
              <div className="modal-body" style={{ backgroundColor: theme.light, padding: '20px 30px' }}>
                <form onSubmit={handleSignup}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-medium">Nom d&apos;utilisateur</label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      placeholder="Choisissez un nom d'utilisateur"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 12px',
                        border: '1px solid #ced4da',
                        transition: theme.transition
                      }}
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="signupEmail" className="form-label fw-medium">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder='Entrez votre email'
                      id="signupEmail"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 12px',
                        border: '1px solid #ced4da',
                        transition: theme.transition
                      }}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="signupPassword" className="form-label fw-medium">Mot de passe</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder='Créez un mot de passe'
                      id="signupPassword"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 12px',
                        border: '1px solid #ced4da',
                        transition: theme.transition
                      }}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    <small className="form-text text-muted mt-1">
                      Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                    </small>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-medium">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder='Confirmez votre mot de passe'
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      style={{
                        borderRadius: '8px',
                        padding: '10px 12px',
                        border: '1px solid #ced4da',
                        transition: theme.transition
                      }}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn"
                      style={{
                        backgroundColor: theme.success,
                        color: 'white',
                        borderRadius: theme.buttonBorderRadius,
                        padding: '10px',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)',
                        transition: theme.transition
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = theme.successDark;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = theme.success;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Inscription
                    </button>
                  </div>
                </form>
              </div>
              <div className="modal-footer justify-content-center" style={{ backgroundColor: theme.light, borderTop: 'none', paddingBottom: '20px' }}>
                <p className="text-center mb-0">
                  Déjà un compte?{' '}
                  <button
                    className="btn btn-link p-0"
                    onClick={() => {
                      setShowSignupModal(false);
                      setShowLoginModal(true);
                    }}
                    style={{
                      color: theme.primary,
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: theme.transition
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = theme.primaryDark;
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = theme.primary;
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarApp;
