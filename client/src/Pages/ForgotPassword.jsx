import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../contexts/useUserAuth';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import theme from '../utils/theme';

const ForgotPassword = () => {
  const { resetPassword, loading } = useUserAuth();
  const navigate = useNavigate();

  // Sch ma de validation avec Yup
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('L\'adresse email n\'est pas valide')
      .required('L\'adresse email est requise')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await resetPassword(values.email);
      if (result.success) {
        toast.success('Un email de réinitialisation de mot de passe a été envoyé à votre adresse.');
        resetForm();
        navigate('/'); // Rediriger vers la page d'accueil
      } else {
        toast.error(result.error || 'Erreur lors de la demande de réinitialisation.');
      }
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      toast.error(error.message || 'Erreur lors de la demande de réinitialisation.');
    } finally {
      setSubmitting(false);
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
                  R initialisation du mot de passe
                </h2>
                <Formik
                  initialValues={{ email: '' }}
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
                      <Form.Group className="mb-4" controlId="email">
                        <Form.Label style={{ fontWeight: 'bold', color: theme.colors.secondary }}>Adresse Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          isInvalid={touched.email && errors.email}
                          placeholder="Entrez votre adresse email"
                          style={{ borderRadius: theme.borderRadius.md }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
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
                              Envoi en cours...
                            </>
                          ) : 'R initialiser le mot de passe'}
                        </Button>
                      </div>
                      <div className="mt-3 text-center">
                        <Link to="/" style={{ color: theme.colors.secondary, textDecoration: 'none' }}>
                          Retour   la connexion
                        </Link>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;