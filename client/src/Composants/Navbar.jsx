import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import logo from './images/prepalogo.png';
import axios from 'axios';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useUserAuth } from '../contexts/useUserAuth';
import { Link, useNavigate } from 'react-router-dom';
import GoogleSignInButton from './GoogleSignInButton';

const Navbar = () => {
  const navigate = useNavigate();

  axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

  const theme = {
    primary: '#be0050',
    primaryDark: '#770033',
    secondary: '#212529',
    secondaryDark: '#0d1114',
    success: '#28a745',
    successDark: '#1e7e34',
    light: '#f8f9fa',
    dark: '#212529',
    transition: 'all 0.3s ease',
    buttonBorderRadius: '30px',
    cardShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    buttonShadow: '0 4px 6px rgba(190, 0, 80, 0.2)',
    borderRadius: '8px'
  };

  const { user, login, logout, signup, loginWithEmailAndPassword } = useUserAuth();

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
  const [isGoogleLoading, setIsLoading] = useState(false);

  const signupSchema = Yup.object().shape({
    username: Yup.string()
      .required('Le nom d\'utilisateur est requis')
      .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caract res')
      .max(30, 'Le nom d\'utilisateur ne doit pas d passer 30 caract res')
      .matches(/^[a-zA-Z0-9_]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores"),
    email: Yup.string()
      .required("L'email est requis")
      .email('Email invalide')
      .test('allowed-domain', "Domaine d'email non autorisé", (value) => {
        const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        return allowedDomains.includes(value.split('@')[1]);
      }),
    password: Yup.string()
      .required("Le mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caract res")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], "Les mots de passe doivent correspondre")
      .required("La confirmation du mot de passe est requise"),
  });

  const loginSchema = Yup.object().shape({
    email: Yup.string().required('L\'email est requis').email('Email invalide'),
    password: Yup.string().required('Le mot de passe est requis')
  });

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await signupSchema.validate(formData, { abortEarly: false });
      const result = await signup(formData.email, formData.password, formData.username);
      if (result.success) {
        toast.success('Inscription réussie!');
        setShowSignupModal(false);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        navigate('/user/dashboard');
      } else {
        toast.error(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (validationError) {
      const newErrors = {};
      validationError.inner.forEach(err => { newErrors[err.path] = err.message; });
      setErrors(newErrors);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await loginSchema.validate(loginData, { abortEarly: false });
      const result = await loginWithEmailAndPassword(loginData.email, loginData.password);
      if (result.success) {
        toast.success('Connexion réussie !');
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
        login(result.user);
        // Redirection immédiate vers le dashboard (rechargement complet pour que UserPrivateRoute lise localStorage)
        window.location.href = '/user/dashboard';
      } else {
        if (result.error === "Email non vérifié") {
          toast.error("Veuillez vérifier votre email avant de vous connecter.");
        } else {
          toast.error(result.error || 'Erreur lors de la connexion');
        }
      }
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const newErrors = {};
        err.inner.forEach((error) => { newErrors[error.path] = error.message; });
        setErrors(newErrors);
      } else {
        toast.error(err.message || 'Erreur lors de la connexion');
      }
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  const handleLoginClick = () => { setShowLoginModal(true); setErrors({}); };
  const handleSignupClick = () => { setShowSignupModal(true); setErrors({}); };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setErrors({});
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setLoginData({ email: '', password: '' });
  };

  const switchToSignup = () => { setShowLoginModal(false); setShowSignupModal(true); setErrors({}); };
  const switchToLogin = () => { setShowSignupModal(false); setShowLoginModal(true); setErrors({}); };

  const handleGoogleSuccess = (firebaseUser) => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    const userName = firebaseUser.displayName || firebaseUser.email.split('@')[0];
    login({
      id: firebaseUser.uid,
      email: firebaseUser.email,
      username: userName,
      photoURL: firebaseUser.photoURL,
      provider: 'google.com',
      isAdmin: false
    });
    window.location.href = '/user/dashboard';
  };

  const handleGoogleError = (error) => {
    console.error('Erreur Google Auth:', error);
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{ backgroundColor: theme.secondary, boxShadow: theme.cardShadow }}>
      <div className="container-fluid">
        <a className="navbar-brand" href="#" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo" width="40" height="40"
            style={{ borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: theme.transition }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} />
          <span className="ms-2 fw-bold text-white">PrepaCameroun</span>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none' }}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          {user ? (
            <>
              <span className="navbar-text text-light me-3 d-flex align-items-center">
                <div className="bg-white text-dark rounded-circle me-2 d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                </div>
                <span>Bienvenue, <strong>{user.username || 'Utilisateur'}</strong></span>
              </span>
              <button className="btn" onClick={handleLogout}
                style={{ backgroundColor: theme.primary, color: 'white', borderRadius: theme.buttonBorderRadius,
                  padding: '8px 16px', fontWeight: '600', boxShadow: theme.buttonShadow, transition: theme.transition }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.primaryDark; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = theme.primary; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button className="btn me-2" onClick={handleLoginClick}
                style={{ backgroundColor: theme.primary, color: 'white', borderRadius: theme.buttonBorderRadius,
                  padding: '8px 16px', fontWeight: '600', boxShadow: theme.buttonShadow, transition: theme.transition }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.primaryDark; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = theme.primary; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Connexion
              </button>
              <button className="btn" onClick={handleSignupClick}
                style={{ backgroundColor: theme.success, color: 'white', borderRadius: theme.buttonBorderRadius,
                  padding: '8px 16px', fontWeight: '600', boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)', transition: theme.transition }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.successDark; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = theme.success; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Inscription
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modale de connexion */}
      {showLoginModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: theme.borderRadius, overflow: 'hidden' }}>
              <div className="modal-header" style={{ backgroundColor: theme.light, borderBottom: 'none' }}>
                <h5 className="modal-title w-100 text-center fw-bold" style={{ color: theme.dark }}>Connexion</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}
                  style={{ transition: theme.transition }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}></button>
              </div>
              <div className="modal-body" style={{ backgroundColor: theme.light, padding: '20px 30px' }}>
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-medium">Email</label>
                    <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} id="email" name="email"
                      value={loginData.email} onChange={handleLoginInputChange}
                      style={{ borderRadius: '8px', padding: '10px 12px', border: '1px solid #ced4da', transition: theme.transition }}
                      placeholder="Entrez votre email" />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium">Mot de passe</label>
                    <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} id="password" name="password"
                      value={loginData.password} onChange={handleLoginInputChange}
                      style={{ borderRadius: '8px', padding: '10px 12px', border: '1px solid #ced4da', transition: theme.transition }}
                      placeholder="Entrez votre mot de passe" />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  <div className="mb-3 text-end">
                    <Link to="/forgot-password" className="text-decoration-none small" style={{ color: theme.primary }}
                      onClick={() => setShowLoginModal(false)}>Mot de passe oubli ?</Link>
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button type="submit" className="btn"
                      style={{ backgroundColor: theme.primary, color: 'white', borderRadius: theme.buttonBorderRadius,
                        padding: '10px', fontWeight: '600', boxShadow: theme.buttonShadow, transition: theme.transition }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.primaryDark; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = theme.primary; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      Connexion
                    </button>
                    <div className="my-3 d-flex align-items-center">
                      <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                      <span style={{ margin: "0 12px", color: "#888" }}>ou</span>
                      <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                    </div>
                    <GoogleSignInButton variant="login" onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={isGoogleLoading} />
                  </div>
                </form>
              </div>
              <div className="modal-footer justify-content-center" style={{ backgroundColor: theme.light, borderTop: 'none', paddingBottom: '20px' }}>
                <p className="text-center mb-0">
                  Pas encore de compte?{' '}
                  <button className="btn btn-link p-0" onClick={switchToSignup}
                    style={{ color: theme.primary, textDecoration: 'none', fontWeight: '500', transition: theme.transition }}
                    onMouseOver={(e) => { e.currentTarget.style.color = theme.primaryDark; e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = theme.primary; e.currentTarget.style.textDecoration = 'none'; }}>
                    S'inscrire
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'inscription */}
      {showSignupModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: theme.borderRadius, overflow: 'hidden' }}>
              <div className="modal-header" style={{ backgroundColor: theme.light, borderBottom: 'none' }}>
                <h5 className="modal-title w-100 text-center fw-bold" style={{ color: theme.dark }}>Inscription</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}
                  style={{ transition: theme.transition }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}></button>
              </div>
              <div className="modal-body" style={{ backgroundColor: theme.light, padding: '20px 30px' }}>
                <form onSubmit={handleSignup}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-medium">Nom d'utilisateur</label>
                    <input type="text" className={`form-control ${errors.username ? 'is-invalid' : ''}`} id="username" name="username"
                      value={formData.username} onChange={handleInputChange}
                      style={{ borderRadius: '8px', padding: '10px 12px', border: '1px solid #ced4da', transition: theme.transition }}
                      placeholder="Choisissez un nom d'utilisateur" />
                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="signupEmail" className="form-label fw-medium">Email</label>
                    <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} id="signupEmail" name="email"
                      value={formData.email} onChange={handleInputChange}
                      style={{ borderRadius: '8px', padding: '10px 12px', border: '1px solid #ced4da', transition: theme.transition }}
                      placeholder="Entrez votre email" />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="signupPassword" className="form-label fw-medium">Mot de passe</label>
                    <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} id="signupPassword" name="password"
                      value={formData.password} onChange={handleInputChange}
                      style={{ borderRadius: '8px', padding: '10px 12px', border: '1px solid #ced4da', transition: theme.transition }}
                      placeholder="Créez un mot de passe" />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    <small className="form-text text-muted mt-1">
                      Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                    </small>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-medium">Confirmer le mot de passe</label>
                    <input type="password" className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} id="confirmPassword" name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleInputChange}
                      style={{ borderRadius: '8px', padding: '10px 12px', border: '1px solid #ced4da', transition: theme.transition }}
                      placeholder="Confirmez votre mot de passe" />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button type="submit" className="btn"
                      style={{ backgroundColor: theme.success, color: 'white', borderRadius: theme.buttonBorderRadius,
                        padding: '10px', fontWeight: '600', boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)', transition: theme.transition }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.successDark; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = theme.success; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      Inscription
                    </button>
                    <div className="my-3 d-flex align-items-center">
                      <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                      <span style={{ margin: "0 12px", color: "#888" }}>ou</span>
                      <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                    </div>
                    <GoogleSignInButton variant="signup" onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={isGoogleLoading} />
                  </div>
                </form>
              </div>
              <div className="modal-footer justify-content-center" style={{ backgroundColor: theme.light, borderTop: 'none', paddingBottom: '20px' }}>
                <p className="text-center mb-0">
                  Déjà un compte ?{' '}
                  <button className="btn btn-link p-0" onClick={switchToLogin}
                    style={{ color: theme.primary, textDecoration: 'none', fontWeight: '500', transition: theme.transition }}
                    onMouseOver={(e) => { e.currentTarget.style.color = theme.primaryDark; e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = theme.primary; e.currentTarget.style.textDecoration = 'none'; }}>
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

export default Navbar;