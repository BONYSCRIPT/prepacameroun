import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import theme from '../utils/theme';
import axiosInstance from '../utils/axiosConfig';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');


  // Schéma de validation avec Yup
  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required("Le nouveau mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], "Les mots de passe doivent correspondre")
      .required("La confirmation du mot de passe est requise"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setResetError('');
      setResetSuccess(false);

      // Envoi du nouveau mot de passe et du token au backend
      const response = await axiosInstance.post('/api/users/reset-password', {
        token: token,
        newPassword: values.newPassword
      });

      if (response.data.success) {
        setResetSuccess(true);
        toast.success(response.data.message || "Mot de passe réinitialisé avec succès!");
        // Rediriger vers la page de connexion après un délai
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setResetError(response.data.message || 'Erreur lors de la réinitialisation du mot de passe.');
        toast.error(response.data.message || 'Erreur lors de la réinitialisation du mot de passe.');
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      setResetError(error.message || 'Erreur lors de la réinitialisation du mot de passe.');
      toast.error(error.message || 'Erreur lors de la réinitialisation du mot de passe.');
    } finally {
      setSubmitting(false);
      setLoading(false);
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
              <Card.Body className="p-5">
                <h2 style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: '30px' }} className="text-center">
                  Réinitialiser le mot de passe
                </h2>
                <Formik
                  initialValues={{ newPassword: '', confirmPassword: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleSubmit,
                    isSubmitting,
                  }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                      <Form.Group className="mb-4" controlId="newPassword">
                        <Form.Label style={{ fontWeight: 'bold', color: theme.colors.secondary }}>Nouveau mot de passe</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={values.newPassword}
                          onChange={handleChange}
                          isInvalid={touched.newPassword && errors.newPassword}
                          placeholder="Entrez votre nouveau mot de passe"
                          style={{ borderRadius: theme.borderRadius.md }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.newPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-4" controlId="confirmPassword">
                        <Form.Label style={{ fontWeight: 'bold', color: theme.colors.secondary }}>Confirmer le nouveau mot de passe</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          isInvalid={touched.confirmPassword && errors.confirmPassword}
                          placeholder="Confirmez votre nouveau mot de passe"
                          style={{ borderRadius: theme.borderRadius.md }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <div className="d-grid gap-2 mt-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting || loading}
                          style={{
                            backgroundColor: theme.colors.primary,
                            borderColor: theme.colors.primary,
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: theme.borderRadius.pill,
                            boxShadow: theme.shadows.button,
                            transition: theme.transitions.default
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.primary;
                          }}
                        >
                          {isSubmitting || loading ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                              Réinitialisation en cours...
                            </>
                          ) : 'Réinitialiser le mot de passe'}
                        </Button>
                      </div>
                      <div className="mt-3 text-center">
                        <Link to="/" style={{ color: theme.colors.secondary, textDecoration: 'none' }}>
                          Retour à la connexion
                        </Link>
                      </div>
                    </Form>
                  )}
                </Formik>
                {resetError && (
                  <p className="text-danger mt-3">{resetError}</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;