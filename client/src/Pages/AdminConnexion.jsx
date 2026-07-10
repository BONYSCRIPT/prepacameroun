import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAdminAuth } from '../contexts/useAdminAuth';
import 'bootstrap/dist/css/bootstrap.css';
import AdminNavbar from '../Composants/Admin/AdminNavbar';
import { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdLogin } from 'react-icons/md';
import { toast } from 'react-toastify';

// Thème pour maintenir la cohérence visuelle
const theme = {
  colors: {
    primary: '#0d6efd',
    success: '#28a745',
    danger: '#dc3545',
    light: '#f8f9fa',
    white: '#ffffff',
    text: '#212529',
    muted: '#6c757d',
    border: '#dee2e6',
    inputBg: '#f9f9f9'
  },
  shadows: {
    card: '0 10px 25px rgba(0, 0, 0, 0.1)',
    input: 'inset 0 1px 2px rgba(0, 0, 0, 0.075)',
    button: '0 4px 6px rgba(40, 167, 69, 0.25)'
  },
  borderRadius: {
    default: '0.5rem',
    input: '0.375rem',
    button: '0.375rem'
  },
  transitions: {
    default: 'all 0.3s ease'
  }
};

// Schéma de validation avec Yup
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Format d'email invalide")
    .required("L'email est requis")
    .max(255, "L'email ne doit pas dépasser 255 caractères")
    .trim(),
  password: Yup.string()
    .required("Le mot de passe est requis")
    .max(100, "Le mot de passe ne doit pas dépasser 100 caractères")
    .trim(),
});

const AdminConnexion = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour basculer l'affichage du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsLoading(true);
    try {
      // 🔥 CORRECTION : utiliser la fonction login du contexte AdminAuthContext
      const result = await login(values.email, values.password);

      if (result.success) {
        toast.success('Connexion réussie !');
        navigate('/admin/dashboard');
      } else {
        setErrors({ submit: result.error });
        toast.error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur de connexion au serveur.';
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    }
    setIsLoading(false);
    setSubmitting(false);
  };

  return (
    <>
      <AdminNavbar />
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: theme.colors.light,
          paddingTop: '56px' // Pour compenser la hauteur de la navbar
        }}>
        <div className="row w-100 justify-content-center">
          <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
            <div className="card border-0"
              style={{
                borderRadius: theme.borderRadius.default,
                boxShadow: theme.shadows.card,
                overflow: 'hidden'
              }}>
              <div className="card-header text-center py-4"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.white,
                  border: 'none'
                }}>
                <h4 className="mb-0 fw-bold">Connexion Administrateur</h4>
                <p className="text-white-50 mb-0 mt-1">
                  Accédez à votre espace d&apos;administration
                </p>
              </div>

              <div className="card-body p-4 p-lg-5">
                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={loginSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      {errors.submit && (
                        <div className="alert alert-danger d-flex align-items-center" role="alert">
                          <div className="me-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                            </svg>
                          </div>
                          <div>{errors.submit}</div>
                        </div>
                      )}

                      <div className="mb-4">
                        <label htmlFor="email" className="form-label fw-semibold">Email</label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ backgroundColor: theme.colors.light }}>
                            <MdEmail />
                          </span>
                          <Field
                            type="email"
                            name="email"
                            id="email"
                            className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                            placeholder="Entrez votre email"
                            style={{
                              backgroundColor: theme.colors.inputBg,
                              boxShadow: theme.shadows.input,
                              borderRadius: `0 ${theme.borderRadius.input} ${theme.borderRadius.input} 0`,
                              padding: '0.75rem',
                              transition: theme.transitions.default
                            }}
                          />
                          <ErrorMessage name="email" component="div" className="invalid-feedback" />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="password" className="form-label fw-semibold">Mot de passe</label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ backgroundColor: theme.colors.light }}>
                            <MdLock />
                          </span>
                          <Field
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            id="password"
                            className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                            placeholder="Entrez votre mot de passe"
                            style={{
                              backgroundColor: theme.colors.inputBg,
                              boxShadow: theme.shadows.input,
                              borderRadius: '0',
                              padding: '0.75rem',
                              transition: theme.transitions.default
                            }}
                          />
                          <button
                            type="button"
                            className="input-group-text"
                            onClick={togglePasswordVisibility}
                            style={{
                              backgroundColor: theme.colors.light,
                              cursor: 'pointer',
                              borderRadius: `0 ${theme.borderRadius.input} ${theme.borderRadius.input} 0`,
                              border: `1px solid ${theme.colors.border}`,
                              borderLeft: 'none'
                            }}
                          >
                            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                          </button>
                          <ErrorMessage name="password" component="div" className="invalid-feedback" />
                        </div>
                      </div>

                      <div className="d-grid gap-2 mt-4">
                        <button
                          type="submit"
                          className="btn btn-success py-3 d-flex align-items-center justify-content-center gap-2"
                          disabled={isSubmitting || isLoading}
                          style={{
                            backgroundColor: theme.colors.success,
                            border: 'none',
                            borderRadius: theme.borderRadius.button,
                            boxShadow: theme.shadows.button,
                            fontWeight: '500',
                            transition: theme.transitions.default
                          }}
                          onMouseOver={(e) => {
                            if (!isSubmitting && !isLoading) {
                              e.currentTarget.style.backgroundColor = '#218838';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 10px rgba(40, 167, 69, 0.3)';
                            }
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.success;
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = theme.shadows.button;
                          }}
                        >
                          {isSubmitting || isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Connexion en cours...
                            </>
                          ) : (
                            <>
                              <MdLogin size={20} /> Se connecter
                            </>
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>

                <div className="mt-4 text-center">
                  <p className="mb-0" style={{ color: theme.colors.muted }}>
                    Vous n&apos;avez pas de compte administrateur ?
                  </p>
                  <Link
                    to="/admin/inscription"
                    className="fw-semibold"
                    style={{
                      color: theme.colors.primary,
                      textDecoration: 'none',
                      transition: theme.transitions.default
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#0a58ca';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = theme.colors.primary;
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link
                to="/"
                className="text-decoration-none"
                style={{
                  color: theme.colors.muted,
                  transition: theme.transitions.default
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = theme.colors.text;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = theme.colors.muted;
                }}
              >
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminConnexion;
