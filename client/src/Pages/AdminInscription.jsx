import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createAdmin } from '../services/firestoreService';
import 'bootstrap/dist/css/bootstrap.css';
import AdminNavbar from '../Composants/Admin/AdminNavbar';
import { useState } from 'react';
import {
  MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff,
  MdKey, MdAdminPanelSettings, MdHowToReg
} from 'react-icons/md';
import { toast } from 'react-toastify';

// Schémas
const signupSchema = Yup.object().shape({
  displayName: Yup.string().required("Le nom d'affichage est requis").min(2, 'Minimum 2 caractères').max(50).trim(),
  email: Yup.string().email("Email invalide").required("L'email est requis").max(255).trim(),
  password: Yup.string().required("Le mot de passe est requis")
    .min(8, 'Minimum 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Doit contenir majuscule, minuscule et chiffre'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre').required('Requis'),
  adminKey: Yup.string().required("La clé admin est requise"),
});

const AdminInscription = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSignup = async (values, { setSubmitting }) => {
    try {
      // Étape 1: Créer le compte Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;

      // Étape 2: Enregistrer dans Firestore
      await createAdmin({
        uid: firebaseUser.uid,
        email: values.email,
        displayName: values.displayName,
        adminKey: values.adminKey,
        role: 'admin',
      });

      // Connexion auto
      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      toast.success('Compte admin créé avec succès !');
      navigate('/admin/dashboard');
    } catch (error) {
      let msg = "Erreur lors de l'inscription";
      if (error.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé";
      else if (error.code === 'auth/weak-password') msg = "Mot de passe trop faible";
      else if (error.message) msg = error.message;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d1114 0%, #1a1f2e 50%, #28a74522 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '440px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <MdAdminPanelSettings style={{ color: 'white', fontSize: '1.8rem' }} />
            </div>
            <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>Inscription Admin</h4>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: 0 }}>
              Créez un compte pour gérer la plateforme
            </p>
          </div>

          <Formik
            initialValues={{ displayName: '', email: '', password: '', confirmPassword: '', adminKey: '' }}
            validationSchema={signupSchema}
            onSubmit={handleSignup}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                {/* Nom */}
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ color: '#495057', fontSize: '0.9rem' }}>Nom complet</label>
                  <div style={{ position: 'relative' }}>
                    <MdPerson style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd', zIndex: 2 }} />
                    <Field name="displayName" className="form-control" placeholder="Admin PrepaCameroun"
                      style={{ paddingLeft: '40px', borderRadius: '12px', height: '48px',
                        border: `1.5px solid ${errors.displayName && touched.displayName ? '#dc3545' : '#e9ecef'}`,
                        background: '#f8f9fc', fontSize: '0.95rem' }} />
                  </div>
                  <ErrorMessage name="displayName" component="div" className="text-danger small mt-1" />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ color: '#495057', fontSize: '0.9rem' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <MdEmail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd', zIndex: 2 }} />
                    <Field type="email" name="email" className="form-control" placeholder="admin@prepacameroun.com"
                      style={{ paddingLeft: '40px', borderRadius: '12px', height: '48px',
                        border: `1.5px solid ${errors.email && touched.email ? '#dc3545' : '#e9ecef'}`,
                        background: '#f8f9fc', fontSize: '0.95rem' }} />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                </div>

                {/* Mot de passe */}
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ color: '#495057', fontSize: '0.9rem' }}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <MdLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd', zIndex: 2 }} />
                    <Field type={showPassword ? 'text' : 'password'} name="password" className="form-control" placeholder="••••••••"
                      style={{ paddingLeft: '40px', paddingRight: '40px', borderRadius: '12px', height: '48px',
                        border: `1.5px solid ${errors.password && touched.password ? '#dc3545' : '#e9ecef'}`,
                        background: '#f8f9fc', fontSize: '0.95rem' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', padding: 0 }}>
                      {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                </div>

                {/* Confirmation */}
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ color: '#495057', fontSize: '0.9rem' }}>Confirmer le mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <MdLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd', zIndex: 2 }} />
                    <Field type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="form-control" placeholder="••••••••"
                      style={{ paddingLeft: '40px', paddingRight: '40px', borderRadius: '12px', height: '48px',
                        border: `1.5px solid ${errors.confirmPassword && touched.confirmPassword ? '#dc3545' : '#e9ecef'}`,
                        background: '#f8f9fc', fontSize: '0.95rem' }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', padding: 0 }}>
                      {showConfirm ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="text-danger small mt-1" />
                </div>

                {/* Clé admin */}
                <div className="mb-4">
                  <label className="form-label fw-medium" style={{ color: '#495057', fontSize: '0.9rem' }}>Clé administrateur</label>
                  <div style={{ position: 'relative' }}>
                    <MdKey style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd', zIndex: 2 }} />
                    <Field type={showKey ? 'text' : 'password'} name="adminKey" className="form-control" placeholder="••••••••"
                      style={{ paddingLeft: '40px', paddingRight: '40px', borderRadius: '12px', height: '48px',
                        border: `1.5px solid ${errors.adminKey && touched.adminKey ? '#dc3545' : '#e9ecef'}`,
                        background: '#f8f9fc', fontSize: '0.95rem' }} />
                    <button type="button" onClick={() => setShowKey(!showKey)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', padding: 0 }}>
                      {showKey ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                  <ErrorMessage name="adminKey" component="div" className="text-danger small mt-1" />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="btn w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white', borderRadius: '12px', height: '48px',
                    fontWeight: 600, fontSize: '1rem', border: 'none',
                    boxShadow: '0 4px 16px rgba(40,167,69,0.3)',
                    transition: 'all 0.3s ease',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(40,167,69,0.4)'; }}}
                  onMouseOut={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(40,167,69,0.3)'; }}}
                >
                  {isSubmitting ? (
                    <div className="spinner-border spinner-border-sm" role="status" />
                  ) : (
                    <><MdHowToReg /> Créer le compte</>
                  )}
                </button>

                <div className="text-center mt-4">
                  <Link to="/admin/connexion"
                    style={{ color: '#28a745', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                    Déjà un compte ? Se connecter
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

export default AdminInscription;