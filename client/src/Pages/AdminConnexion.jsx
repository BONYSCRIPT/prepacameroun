import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAdminAuth } from '../contexts/useAdminAuth';
import 'bootstrap/dist/css/bootstrap.css';
import AdminNavbar from '../Composants/Admin/AdminNavbar';
import { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdLogin, MdAdminPanelSettings } from 'react-icons/md';
import { toast } from 'react-toastify';

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

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Format d'email invalide").required("L'email est requis").max(255).trim(),
  password: Yup.string().required("Le mot de passe est requis").max(100).trim(),
});

const AdminConnexion = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        toast.success('Connexion admin réussie !');
        navigate('/admin/dashboard');
      } else {
        toast.error(result.error || 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d1114 0%, #1a1f2e 50%, #0d6efd22 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d6efd, #6610f2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <MdAdminPanelSettings style={{ color: 'white', fontSize: '1.8rem' }} />
            </div>
            <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>Administration</h4>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: 0 }}>
              Connectez-vous pour gérer la plateforme
            </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ color: '#495057', fontSize: '0.9rem' }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MdEmail style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: '#adb5bd', zIndex: 2, fontSize: '1.1rem'
                    }} />
                    <Field
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="admin@prepacameroun.com"
                      style={{
                        paddingLeft: '40px', borderRadius: '12px', height: '48px',
                        border: `1.5px solid ${errors.email && touched.email ? '#dc3545' : '#e9ecef'}`,
                        background: '#f8f9fc', fontSize: '0.95rem',
                      }}
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-medium" style={{ color: '#495057', fontSize: '0.9rem' }}>
                    Mot de passe
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MdLock style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: '#adb5bd', zIndex: 2, fontSize: '1.1rem'
                    }} />
                    <Field
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-control"
                      placeholder="••••••••"
                      style={{
                        paddingLeft: '40px', paddingRight: '40px', borderRadius: '12px', height: '48px',
                        border: `1.5px solid ${errors.password && touched.password ? '#dc3545' : '#e9ecef'}`,
                        background: '#f8f9fc', fontSize: '0.95rem',
                      }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', padding: 0,
                      }}>
                      {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="btn w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #0d6efd, #6610f2)',
                    color: 'white', borderRadius: '12px', height: '48px',
                    fontWeight: 600, fontSize: '1rem', border: 'none',
                    boxShadow: '0 4px 16px rgba(13,110,253,0.3)',
                    transition: 'all 0.3s ease',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,110,253,0.4)'; }}}
                  onMouseOut={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,110,253,0.3)'; }}}
                >
                  {isSubmitting ? (
                    <div className="spinner-border spinner-border-sm" role="status" />
                  ) : (
                    <><MdLogin /> Se connecter</>
                  )}
                </button>

                <div className="text-center mt-4">
                  <Link to="/admin/inscription"
                    style={{ color: '#0d6efd', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                    Créer un compte administrateur
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default AdminConnexion;