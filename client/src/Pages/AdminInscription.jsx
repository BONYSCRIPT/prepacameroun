import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createAdmin } from '../services/firestoreService';
import 'bootstrap/dist/css/bootstrap.css';
import AdminNavbar from '../Composants/Admin/AdminNavbar';
import { useState } from 'react';
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdKey,
  MdAdminPanelSettings,
  MdHowToReg
} from 'react-icons/md';
import { toast } from 'react-toastify';

// Thème pour maintenir la cohérence visuelle
const theme = {
  colors: {
    primary: '#0d6efd',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
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
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Le nom d'utilisateur est requis")
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur ne doit pas dépasser 30 caractères")
    .matches(/^[a-zA-Z0-9_]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores"),
  email: Yup.string()
    .email("Format d'email invalide")
    .required("L'email est requis")
    .max(255, "L'email ne doit pas dépasser 255 caractères"),
  password: Yup.string()
    .required("Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], "Les mots de passe doivent correspondre")
    .required("La confirmation du mot de passe est requise"),
  role: Yup.string()
    .oneOf(['admin', 'super_admin'], "Rôle invalide")
    .required("Le rôle est requis"),
  adminKey1: Yup.string()
    .required("La clé d'administration 1 est requise")
    .min(8, "La clé d'administration 1 doit contenir au moins 8 caractères")
    .max(50, "La clé d'administration 1 ne doit pas dépasser 50 caractères"),
  adminKey2: Yup.string()
    .required("La clé d'administration 2 est requise")
    .min(8, "La clé d'administration 2 doit contenir au moins 8 caractères")
    .max(50, "La clé d'administration 2 ne doit pas dépasser 50 caractères")
});

const AdminInscription = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Valeurs initiales du formulaire
  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    adminKey1: '',
    adminKey2: ''
  };

  // Fonction pour basculer l'affichage du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Fonction pour basculer l'affichage de la confirmation du mot de passe
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsLoading(true);
    try {
      console.log('Sending data to server:', values);
      // Créer l'utilisateur Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;

      // Créer le document admin dans Firestore
      await createAdmin({
        username: values.username,
        email: values.email,
        firebaseUid: firebaseUser.uid,
        role: values.role || 'admin'
      });

      console.log('Registration successful, navigating to login page');
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/admin/connexion');
    } catch (error) {
      console.error('Error during registration:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription.';
      if (error.message) {
        errorMessage = error.message;
      }
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    }
    setIsLoading(false);
    setSubmitting(false);
  };

  // Fonction pour afficher les exigences du mot de passe
  const PasswordRequirements = () => (
    <div className="password-requirements mt-2 p-2 rounded" style={{
      backgroundColor: 'rgba(13, 110, 253, 0.05)',
      fontSize: '0.85rem',
      color: theme.colors.muted
    }}>
      <p className="mb-1 fw-semibold">Le mot de passe doit contenir :</p>
      <ul className="mb-0 ps-3">
        <li>Au moins 8 caractères</li>
        <li>Au moins une lettre majuscule</li>
        <li>Au moins une lettre minuscule</li>
        <li>Au moins un chiffre</li>
        <li>Au moins un caractère spécial</li>
      </ul>
    </div>
  );

  return (
    <>
      <AdminNavbar />
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: theme.colors.light,
          paddingTop: '56px' // Pour compenser la hauteur de la navbar
        }}>
        <div className="row w-100 justify-content-center">
          <div className="col-11 col-sm-10 col-md-8 col-lg-7 col-xl-6">
            <div className="card border-0"
              style={{
                borderRadius: theme.borderRadius.default,
                boxShadow: theme.shadows.card,
                overflow: 'hidden'
              }}>
              <div className="card-header text-center py-4"
                style={{
                  backgroundColor: theme.colors.success,
                  color: theme.colors.white,
                  border: 'none'
                }}>
                <h4 className="mb-0 fw-bold">Inscription Administrateur</h4>
                <p className="text-white-50 mb-0 mt-1">
                  Créez votre compte pour accéder à l&apos;espace d&apos;administration
                </p>
              </div>

              <div className="card-body p-4">
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
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

                      <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                        <div className="me-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-info-circle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                          </svg>
                        </div>
                        <div>
                          <strong>Important :</strong> Les clés d&apos;administration sont nécessaires pour créer un compte. Contactez l&apos;administrateur principal pour les obtenir.
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col-md-6 mb-3 mb-md-0">
                          <label htmlFor="adminKey1" className="form-label fw-semibold">Clé d&apos;administration 1</label>
                          <div className="input-group">
                            <span className="input-group-text" style={{ backgroundColor: theme.colors.light }}>
                              <MdKey />
                            </span>
                            <Field
                              type="password"
                              name="adminKey1"
                              id="adminKey1"
                              className={`form-control ${errors.adminKey1 && touched.adminKey1 ? 'is-invalid' : ''}`}
                              placeholder="Entrez la clé 1"
                              style={{
                                backgroundColor: theme.colors.inputBg,
                                boxShadow: theme.shadows.input,
                                borderRadius: `0 ${theme.borderRadius.input} ${theme.borderRadius.input} 0`,
                                padding: '0.75rem',
                                transition: theme.transitions.default
                              }}
                            />
                            <ErrorMessage name="adminKey1" component="div" className="invalid-feedback" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="adminKey2" className="form-label fw-semibold">Clé d&apos;administration 2</label>
                          <div className="input-group">
                            <span className="input-group-text" style={{ backgroundColor: theme.colors.light }}>
                              <MdKey />
                            </span>
                            <Field
                              type="password"
                              name="adminKey2"
                              id="adminKey2"
                              className={`form-control ${errors.adminKey2 && touched.adminKey2 ? 'is-invalid' : ''}`}
                              placeholder="Entrez la clé 2"
                              style={{
                                backgroundColor: theme.colors.inputBg,
                                boxShadow: theme.shadows.input,
                                borderRadius: `0 ${theme.borderRadius.input} ${theme.borderRadius.input} 0`,
                                padding: '0.75rem',
                                transition: theme.transitions.default
                              }}
                            />
                            <ErrorMessage name="adminKey2" component="div" className="invalid-feedback" />
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="username" className="form-label fw-semibold">Nom d&apos;utilisateur</label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ backgroundColor: theme.colors.light }}>
                            <MdPerson />
                          </span>
                          <Field
                            type="text"
                            name="username"
                            id="username"
                            className={`form-control ${errors.username && touched.username ? 'is-invalid' : ''}`}
                            placeholder="Entrez votre nom d'utilisateur"
                            style={{
                              backgroundColor: theme.colors.inputBg,
                              boxShadow: theme.shadows.input,
                              borderRadius: `0 ${theme.borderRadius.input} ${theme.borderRadius.input} 0`,
                              padding: '0.75rem',
                              transition: theme.transitions.default
                            }}
                          />
                          <ErrorMessage name="username" component="div" className="invalid-feedback" />
                        </div>
                        <small className="form-text text-muted">
                          Lettres, chiffres et underscores uniquement.
                        </small>
                      </div>

                      <div className="mb-3">
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

                      <div className="mb-3">
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
                            placeholder="Créez un mot de passe"
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
                        <PasswordRequirements />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirmation du mot de passe</label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ backgroundColor: theme.colors.light }}>
                            <MdLock />
                          </span>
                          <Field
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            id="confirmPassword"
                            className={`form-control ${errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                            placeholder="Confirmez votre mot de passe"
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
                            onClick={toggleConfirmPasswordVisibility}
                            style={{
                              backgroundColor: theme.colors.light,
                              cursor: 'pointer',
                              borderRadius: `0 ${theme.borderRadius.input} ${theme.borderRadius.input} 0`,
                              border: `1px solid ${theme.colors.border}`,
                              borderLeft: 'none'
                            }}
                          >
                            {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                          </button>
                          <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="role" className="form-label fw-semibold">Rôle</label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ backgroundColor: theme.colors.light }}>
                            <MdAdminPanelSettings />
                          </span>
                          <Field
                            as="select"
                            name="role"
                            id="role"
                            className={`form-select ${errors.role && touched.role ? 'is-invalid' : ''}`}
                            style={{
                              backgroundColor: theme.colors.inputBg,
                              boxShadow: theme.shadows.input,
                              borderRadius: `0 ${theme.borderRadius.input} ${theme.borderRadius.input} 0`,
                              padding: '0.75rem',
                              transition: theme.transitions.default
                            }}
                          >
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </Field>
                          <ErrorMessage name="role" component="div" className="invalid-feedback" />
                        </div>
                        <small className="form-text text-muted">
                          Le rôle Super Admin dispose de privilèges supplémentaires.
                        </small>
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
                              Inscription en cours...
                            </>
                          ) : (
                            <>
                              <MdHowToReg size={20} /> S&apos;inscrire
                            </>
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>

                <div className="mt-4 text-center">
                  <p className="mb-0" style={{ color: theme.colors.muted }}>
                    Vous avez déjà un compte administrateur ?
                  </p>
                  <Link
                    to="/admin/connexion"
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
                    Se connecter
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

export default AdminInscription;
