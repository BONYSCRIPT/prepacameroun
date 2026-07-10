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
  FaEnvelope,
  FaCheckCircle,
  FaStar,
  FaChevronRight,
  FaPlayCircle,
  FaShieldAlt,
  FaClock,
  FaMobileAlt,
  FaInfinity,
  FaAward,
  FaRocket,
  FaBullseye,
  FaBrain,
  FaChalkboardTeacher,
  FaHandshake
} from 'react-icons/fa';
import { getPublishedPrepas } from '../services/firestoreService';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

// ══════════════════════════════════════════════
//  1. HERO SECTION – style moderne avec dégradé
// ══════════════════════════════════════════════
const HeroSection = ({ user, onSignupClick, onLoginClick }) => {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, #0d1114 0%, #1a1f2e 40%, ${theme.colors.primary}99 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Motif géométrique animé en arrière-plan */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.08,
        backgroundImage: `
          radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
          radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
          radial-gradient(circle at 40% 80%, white 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Cercle lumineux décoratif */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.colors.primary}44 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.colors.secondary}33 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="row align-items-center">
          <div className="col-lg-7">
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              padding: '6px 16px',
              borderRadius: '50px',
              marginBottom: '24px',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <FaAward style={{ color: theme.colors.primary, fontSize: '14px' }} />
              <span style={{ color: '#ccc', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                Plateforme n°1 au Cameroun
              </span>
            </div>

            <h1
              className="fw-bold mb-4"
              style={{
                color: 'white',
                fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Préparez-vous à réussir{' '}
              <span style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, #ff6b9d)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                vos concours
              </span>{' '}
              au Cameroun
            </h1>

            <p
              className="mb-5"
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                maxWidth: '600px',
                lineHeight: 1.8,
              }}
            >
              Des ressources pédagogiques complètes, des exercices corrigés et des sujets d'annales
              pour maximiser vos chances de réussite aux concours administratifs et grandes écoles.
            </p>

            {user ? (
              <Link
                to="/user/dashboard"
                className="btn d-inline-flex align-items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, #e00060)`,
                  color: 'white',
                  borderRadius: '50px',
                  padding: '16px 40px',
                  fontWeight: '600',
                  fontSize: '1.05rem',
                  border: 'none',
                  boxShadow: `0 8px 30px ${theme.colors.primary}55`,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${theme.colors.primary}77`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 8px 30px ${theme.colors.primary}55`;
                }}
              >
                Accéder à mon espace <FaArrowRight />
              </Link>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                <button
                  onClick={onSignupClick}
                  className="btn d-inline-flex align-items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, #e00060)`,
                    color: 'white',
                    borderRadius: '50px',
                    padding: '16px 40px',
                    fontWeight: '600',
                    fontSize: '1.05rem',
                    border: 'none',
                    boxShadow: `0 8px 30px ${theme.colors.primary}55`,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 12px 40px ${theme.colors.primary}77`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 8px 30px ${theme.colors.primary}55`;
                  }}
                >
                  Commencer maintenant <FaRocket />
                </button>
                <button
                  onClick={onLoginClick}
                  className="btn d-inline-flex align-items-center gap-2"
                  style={{
                    background: 'transparent',
                    color: 'white',
                    borderRadius: '50px',
                    padding: '16px 32px',
                    fontWeight: '500',
                    fontSize: '1.05rem',
                    border: '2px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'white';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Se connecter <FaChevronRight style={{ fontSize: '12px' }} />
                </button>
              </div>
            )}

            {/* Statistiques en bas du hero */}
            <div className="d-flex flex-wrap gap-4 mt-5 pt-3" style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}>
              {[
                { icon: <FaGraduationCap />, label: '15+ Préparations' },
                { icon: <FaUsers />, label: '1000+ Étudiants' },
                { icon: <FaChartLine />, label: '85% Réussite' },
              ].map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  <span style={{ color: theme.colors.primary, fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-5 d-none d-lg-flex justify-content-center">
            <div style={{
              width: '400px',
              height: '400px',
              borderRadius: '30px',
              background: `linear-gradient(135deg, ${theme.colors.primary}33, ${theme.colors.secondary}44)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Icônes flottantes décoratives */}
              <FaGraduationCap style={{ fontSize: '120px', color: 'rgba(255,255,255,0.08)', position: 'absolute' }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <FaPlayCircle style={{ fontSize: '64px', color: theme.colors.primary, cursor: 'pointer', opacity: 0.6 }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '16px', fontSize: '0.9rem' }}>
                  Découvrir la plateforme
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════
//  2. STATS BANNER – horizontal, impactant
// ══════════════════════════════════════════════
const StatsBanner = () => (
  <section style={{
    background: `linear-gradient(135deg, ${theme.colors.primary}, #e00060)`,
    padding: '48px 0',
  }}>
    <div className="container">
      <div className="row g-4">
        {[
          { icon: <FaGraduationCap />, count: '15+', label: 'Préparations' },
          { icon: <FaBook />, count: '500+', label: 'Leçons & Exercices' },
          { icon: <FaUsers />, count: '1 000+', label: 'Étudiants satisfaits' },
          { icon: <FaChartLine />, count: '85%', label: 'Taux de réussite' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-lg-3 text-center">
            <div style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
              {s.icon}
            </div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', lineHeight: 1.2 }}>
              {s.count}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ══════════════════════════════════════════════
//  3. AVANTAGES – grille d'icônes
// ══════════════════════════════════════════════
const AvantagesSection = () => {
  const items = [
    { icon: <FaBrain />, title: 'Cours complets', desc: 'Des programmes structurés par des experts camerounais pour chaque concours.' },
    { icon: <FaChalkboardTeacher />, title: 'Exercices corrigés', desc: 'Testez vos connaissances avec des exercices pratiques et corrigés en détail.' },
    { icon: <FaBullseye />, title: 'Annales & sujets', desc: 'Entraînez-vous avec les vrais sujets des années précédentes.' },
    { icon: <FaClock />, title: 'Accès 30 jours', desc: 'Un accès illimité à tout le contenu pendant 30 jours après inscription.' },
    { icon: <FaMobileAlt />, title: 'Accessible partout', desc: 'Sur téléphone, tablette ou ordinateur où que vous soyez.' },
    { icon: <FaHandshake />, title: 'Support réactif', desc: 'Une équipe à votre écoute pour répondre à toutes vos questions.' },
  ];

  return (
    <section style={{ padding: '80px 0', background: '#f8f9fc' }}>
      <div className="container">
        <div className="text-center mb-5">
          <span style={{
            display: 'inline-block',
            color: theme.colors.primary,
            fontWeight: 600,
            fontSize: '0.85rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Pourquoi nous choisir
          </span>
          <h2 className="fw-bold" style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            color: '#1a1a2e',
          }}>
            Tout ce qu'il vous faut pour réussir
          </h2>
          <p style={{ color: '#6c757d', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
            Une plateforme complète conçue pour maximiser vos chances aux concours.
          </p>
        </div>

        <div className="row g-4">
          {items.map((item, i) => (
            <div key={i} className="col-md-6 col-lg-4">
              <div
                className="p-4 h-100"
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.04)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.primary}08)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: theme.colors.primary,
                  marginBottom: '20px',
                }}>
                  {item.icon}
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#1a1a2e', fontSize: '1.1rem' }}>
                  {item.title}
                </h5>
                <p className="mb-0" style={{ color: '#6c757d', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ══════════════════════════════════════════════
//  4. PRÉPARATIONS POPULAIRES
// ══════════════════════════════════════════════
const PrepaCard = ({ prepa, user, onLoginClick }) => (
  <div className="col-md-6 col-lg-4 mb-4">
    <div
      className="card h-100 border-0"
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
      }}
    >
      {prepa.image_url && (
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <img
            src={prepa.image_url}
            className="card-img-top"
            alt={prepa.nom}
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            loading="lazy"
          />
        </div>
      )}
      <div className="card-body p-4">
        <h5 className="card-title fw-bold mb-2" style={{ color: '#1a1a2e' }}>
          {prepa.nom}
        </h5>
        <p className="card-text mb-3" style={{
          color: '#6c757d',
          fontSize: '0.9rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {prepa.description}
        </p>

        <div className="d-flex align-items-center gap-2 mb-3">
          <FaStar style={{ color: '#ffc107', fontSize: '0.85rem' }} />
          <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>4.8 (120 avis)</span>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <span
            className="badge rounded-pill px-3 py-2"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, #e00060)`,
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {prepa.prix.toLocaleString()} FCFA
          </span>

          {user ? (
            <Link
              to={`/user/prepa/${prepa.id}`}
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              style={{
                background: 'transparent',
                color: theme.colors.primary,
                border: `1.5px solid ${theme.colors.primary}`,
                borderRadius: '50px',
                padding: '6px 16px',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme.colors.primary;
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.colors.primary;
              }}
            >
              Découvrir <FaArrowRight style={{ fontSize: '11px' }} />
            </Link>
          ) : (
            <button
              onClick={onLoginClick}
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              style={{
                background: 'transparent',
                color: theme.colors.primary,
                border: `1.5px solid ${theme.colors.primary}`,
                borderRadius: '50px',
                padding: '6px 16px',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme.colors.primary;
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.colors.primary;
              }}
            >
              Découvrir <FaArrowRight style={{ fontSize: '11px' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════
//  5. TÉMOIGNAGES
// ══════════════════════════════════════════════
const Testimonial = ({ name, role, text, rating }) => (
  <div className="col-md-4 mb-4">
    <div
      className="p-4 h-100"
      style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.08)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Étoiles */}
      <div className="mb-3 d-flex gap-1" style={{ color: '#ffc107', fontSize: '0.9rem' }}>
        {[...Array(rating || 5)].map((_, i) => <FaStar key={i} />)}
      </div>

      <FaQuoteLeft style={{ color: `${theme.colors.primary}22`, fontSize: '1.5rem', marginBottom: '12px' }} />
      <p className="mb-4" style={{ color: '#495057', fontStyle: 'italic', lineHeight: 1.7, fontSize: '0.95rem' }}>
        {text}
      </p>

      <div className="d-flex align-items-center mt-auto">
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.colors.primary}, #e00060)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1rem',
          marginRight: '12px',
          flexShrink: 0,
        }}>
          {name.charAt(0)}
        </div>
        <div>
          <div className="fw-bold" style={{ color: '#1a1a2e', fontSize: '0.95rem' }}>{name}</div>
          <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>{role}</div>
        </div>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════
//  6. FAQ
// ══════════════════════════════════════════════
const FAQSection = () => (
  <section style={{ padding: '80px 0', background: '#f8f9fc' }}>
    <div className="container">
      <div className="text-center mb-5">
        <span style={{
          display: 'inline-block',
          color: theme.colors.primary,
          fontWeight: 600,
          fontSize: '0.85rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Questions fréquentes
        </span>
        <h2 className="fw-bold" style={{
          fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
          color: '#1a1a2e',
        }}>
          Vous avez des questions ?
        </h2>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Accordion>
            {[
              {
                q: 'Comment accéder aux cours et exercices ?',
                r: 'Créez un compte gratuitement, choisissez une préparation, effectuez le paiement et accédez immédiatement à tout le contenu pendant 30 jours.',
              },
              {
                q: 'Combien coûte une préparation ?',
                r: 'Les prix varient selon la préparation choisie. Ils sont clairement affichés sur chaque fiche. Nous proposons des tarifs accessibles pour tous.',
              },
              {
                q: 'Puis-je accéder aux contenus hors ligne ?',
                r: 'Une connexion internet est nécessaire pour la plateforme, mais vous pouvez télécharger certains documents PDF pour les consulter hors ligne.',
              },
              {
                q: 'Comment renouveler mon abonnement ?',
                r: 'Rendez-vous dans votre tableau de bord après expiration des 30 jours pour effectuer un nouveau paiement et prolonger votre accès.',
              },
              {
                q: 'Y a-t-il un support pédagogique ?',
                r: 'Nos contenus sont conçus pour être autonomes. Un support technique est disponible pour vous assister en cas de besoin.',
              },
            ].map((item, i) => (
              <Accordion.Item eventKey={String(i)} key={i} style={{
                marginBottom: '12px',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '16px !important',
                overflow: 'hidden',
              }}>
                <Accordion.Header style={{ fontWeight: 600, color: '#1a1a2e' }}>
                  {item.q}
                </Accordion.Header>
                <Accordion.Body style={{ color: '#6c757d', lineHeight: 1.7 }}>
                  {item.r}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  </section>
);

// ══════════════════════════════════════════════
//  7. CTA FINAL
// ══════════════════════════════════════════════
const CTASection = ({ user, onSignupClick }) => (
  <section style={{
    padding: '80px 0',
    background: `linear-gradient(135deg, #0d1114 0%, ${theme.colors.primary}99 100%)`,
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)',
    }} />
    <div className="container position-relative" style={{ zIndex: 1 }}>
      <div className="row justify-content-center text-center">
        <div className="col-lg-8">
          <h2 className="fw-bold mb-4" style={{
            color: 'white',
            fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
          }}>
            Prêt à commencer votre préparation ?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}>
            Rejoignez des milliers d'étudiants qui ont déjà fait confiance à PrepaCameroun
            pour réussir leurs concours. Inscrivez-vous dès aujourd'hui !
          </p>
          {user ? (
            <Link
              to="/user/dashboard"
              className="btn d-inline-flex align-items-center gap-2"
              style={{
                background: 'white',
                color: theme.colors.primary,
                borderRadius: '50px',
                padding: '16px 40px',
                fontWeight: 700,
                fontSize: '1.05rem',
                border: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Accéder à mon espace <FaArrowRight />
            </Link>
          ) : (
            <button
              onClick={onSignupClick}
              className="btn d-inline-flex align-items-center gap-2"
              style={{
                background: 'white',
                color: theme.colors.primary,
                borderRadius: '50px',
                padding: '16px 40px',
                fontWeight: 700,
                fontSize: '1.05rem',
                border: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              S'inscrire maintenant <FaRocket />
            </button>
          )}
        </div>
      </div>
    </div>
  </section>
);

// ══════════════════════════════════════════════
//  8. FOOTER MODERNE
// ══════════════════════════════════════════════
const Footer = () => (
  <footer style={{
    background: '#0d1114',
    color: 'rgba(255,255,255,0.7)',
    padding: '60px 0 30px',
  }}>
    <div className="container">
      <div className="row g-5">
        <div className="col-lg-4">
          <h5 className="fw-bold mb-3" style={{ color: 'white', fontSize: '1.2rem' }}>
            PrepaCameroun
          </h5>
          <p style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
            Votre partenaire pour réussir les concours administratifs et grandes écoles au Cameroun.
            Des ressources pédagogiques de qualité pour maximiser vos chances.
          </p>
          <div className="d-flex gap-3 mt-4">
            {[
              { icon: <FaFacebookF />, href: '#' },
              { icon: <FaTwitter />, href: '#' },
              { icon: <FaInstagram />, href: '#' },
              { icon: <FaLinkedinIn />, href: '#' },
            ].map((s, i) => (
              <a key={i} href={s.href}
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '1rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme.colors.primary;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="col-lg-4">
          <h5 className="fw-bold mb-3" style={{ color: 'white', fontSize: '1.2rem' }}>
            Liens rapides
          </h5>
          <ul className="list-unstyled">
            {['Accueil', 'Préparations', 'À propos', 'Contact', "Conditions d'utilisation"].map((item, i) => (
              <li key={i} className="mb-2">
                <a href="#"
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    fontSize: '0.95rem',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = theme.colors.primary}
                  onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-lg-4">
          <h5 className="fw-bold mb-3" style={{ color: 'white', fontSize: '1.2rem' }}>
            Contact
          </h5>
          <ul className="list-unstyled">
            <li className="mb-3 d-flex align-items-center gap-3">
              <FaMapMarkerAlt style={{ color: theme.colors.primary, flexShrink: 0 }} />
              <span style={{ fontSize: '0.95rem' }}>Yaoundé, Cameroun</span>
            </li>
            <li className="mb-3 d-flex align-items-center gap-3">
              <FaPhone style={{ color: theme.colors.primary, flexShrink: 0 }} />
              <span style={{ fontSize: '0.95rem' }}>+237 654 38 39 99</span>
            </li>
            <li className="mb-3 d-flex align-items-center gap-3">
              <FaEnvelope style={{ color: theme.colors.primary, flexShrink: 0 }} />
              <span style={{ fontSize: '0.95rem' }}>prepacameroun@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <hr style={{ backgroundColor: 'rgba(255,255,255,0.08)', margin: '40px 0 24px' }} />
      <div className="text-center">
        <p className="mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} PrepaCameroun. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
);

// ══════════════════════════════════════════════
//  COMPOSANT PRINCIPAL – Menu
// ══════════════════════════════════════════════
function Menu() {
  const navigate = useNavigate();
  const { user, signup, loginWithEmailAndPassword } = useUserAuth();
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const signupSchema = Yup.object().shape({
    username: Yup.string()
      .required("Le nom d'utilisateur est requis")
      .min(3, 'Minimum 3 caractères')
      .max(30, 'Maximum 30 caractères')
      .matches(/^[a-zA-Z0-9_]+$/, 'Lettres, chiffres et underscores uniquement'),
    email: Yup.string()
      .required("L'email est requis")
      .email('Email invalide')
      .test('allowed-domain', 'Domaine email non autorisé', (value) => {
        if (!value) return true;
        const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        return allowedDomains.includes(value.split('@')[1]);
      }),
    password: Yup.string()
      .required('Le mot de passe est requis')
      .min(8, 'Minimum 8 caractères')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
        'Doit contenir majuscule, minuscule, chiffre et caractère spécial'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
      .required('La confirmation est requise'),
  });

  const loginSchema = Yup.object().shape({
    email: Yup.string().required("L'email est requis").email('Email invalide'),
    password: Yup.string().required('Le mot de passe est requis'),
  });

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setErrors({});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await loginSchema.validate(loginData, { abortEarly: false });
      const result = await loginWithEmailAndPassword(loginData.email, loginData.password);

      if (result.success) {
        localStorage.setItem('pendingEmail', loginData.email);
        localStorage.setItem('pendingPassword', loginData.password);
        toast.success('Connexion réussie !');
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
        navigate('/user/dashboard');
      } else {
        if (result.error === "Email non vérifié") {
          toast.error("Veuillez vérifier votre email avant de vous connecter.");
          navigate('/verify-email-info');
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await signupSchema.validate(formData, { abortEarly: false });
      const result = await signup(formData.email, formData.password, formData.username);

      if (result.success) {
        toast.success('Inscription réussie !');
        setShowSignupModal(false);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        navigate('/user/dashboard');
      } else {
        toast.error(result.error || "Erreur lors de l'inscription");
      }
    } catch (validationError) {
      const newErrors = {};
      validationError.inner.forEach(err => { newErrors[err.path] = err.message; });
      setErrors(newErrors);
    }
  };

  const handleGoogleSuccess = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    navigate('/user/dashboard');
  };

  const handleGoogleError = (error) => {
    console.error('Erreur Google Auth:', error);
  };

  const fetchPrepas = useCallback(async () => {
    try {
      const data = await getPublishedPrepas();
      setPrepas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des préparations:', error);
      setPrepas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrepas();
  }, [fetchPrepas]);

  // Police Poppins
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Inter', sans-serif";
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

      {/* HERO */}
      <HeroSection
        user={user}
        onSignupClick={() => setShowSignupModal(true)}
        onLoginClick={() => setShowLoginModal(true)}
      />

      {/* STATS BANNER */}
      <StatsBanner />

      {/* AVANTAGES */}
      <AvantagesSection />

      {/* PRÉPARATIONS POPULAIRES */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5">
            <div>
              <span style={{
                display: 'inline-block',
                color: theme.colors.primary,
                fontWeight: 600,
                fontSize: '0.85rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Nos programmes
              </span>
              <h2 className="fw-bold mb-0" style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                color: '#1a1a2e',
              }}>
                Préparations populaires
              </h2>
            </div>
            {user ? (
              <Link to="/user/dashboard"
                className="btn d-inline-flex align-items-center gap-2 mt-3 mt-md-0"
                style={{
                  background: 'transparent',
                  color: theme.colors.primary,
                  border: `1.5px solid ${theme.colors.primary}`,
                  borderRadius: '50px',
                  padding: '10px 24px',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme.colors.primary;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = theme.colors.primary;
                }}
              >
                Voir tout <FaArrowRight />
              </Link>
            ) : (
              <button onClick={() => setShowLoginModal(true)}
                className="btn d-inline-flex align-items-center gap-2 mt-3 mt-md-0"
                style={{
                  background: 'transparent',
                  color: theme.colors.primary,
                  border: `1.5px solid ${theme.colors.primary}`,
                  borderRadius: '50px',
                  padding: '10px 24px',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme.colors.primary;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = theme.colors.primary;
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
            <div className="row g-4">
              {Array.isArray(prepas) && prepas.length > 0 ? (
                prepas.slice(0, isMobile ? 2 : 3).map(prepa => (
                  <PrepaCard
                    key={prepa.id}
                    prepa={prepa}
                    user={user}
                    onLoginClick={() => setShowLoginModal(true)}
                  />
                ))
              ) : (
                <div className="col-12 text-center py-4">
                  <p style={{ color: '#6c757d' }}>Aucune préparation disponible pour le moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section style={{ padding: '80px 0', background: '#f8f9fc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span style={{
              display: 'inline-block',
              color: theme.colors.primary,
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}>
              Témoignages
            </span>
            <h2 className="fw-bold" style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              color: '#1a1a2e',
            }}>
              Ce que disent nos étudiants
            </h2>
          </div>
          <div className="row g-4">
            <Testimonial
              name="Kamdem Jean"
              role="Étudiant en Droit"
              rating={5}
              text="Grâce à PrepaCameroun, j'ai réussi le concours d'entrée à l'ENAM. Les cours sont clairs et les exercices m'ont vraiment aidé à comprendre les concepts difficiles."
            />
            <Testimonial
              name="Ngo Bassa Marie"
              role="Étudiante en Sciences Économiques"
              rating={5}
              text="La plateforme est intuitive et les ressources sont de grande qualité. J'ai pu me préparer efficacement pour mon concours tout en continuant mes études."
            />
            <Testimonial
              name="Mbarga Paul"
              role="Diplômé en Informatique"
              rating={4}
              text="Les anciens sujets m'ont permis de comprendre le format des examens et de mieux gérer mon temps le jour J. Je recommande vivement !"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <CTASection
        user={user}
        onSignupClick={() => setShowSignupModal(true)}
      />

      {/* FOOTER */}
      <Footer />

      {/* LOGIN MODAL */}
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
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="d-grid gap-2 mt-4">
              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: theme.colors.secondary,
                  color: 'white',
                  borderRadius: '50px',
                  fontWeight: '500',
                  padding: '10px',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.colors.secondaryDark; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = theme.colors.secondary; }}
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
              onClick={() => { setShowLoginModal(false); setShowSignupModal(true); }}
            >
              S'inscrire
            </button>
          </p>
        </Modal.Footer>
      </Modal>

      {/* SIGNUP MODAL */}
      <Modal show={showSignupModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: theme.colors.light }}>
          <Modal.Title style={{ color: theme.colors.dark, fontWeight: '600' }}>Inscription</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.colors.light }}>
          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
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
                placeholder="Créez un mot de passe"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              <small className="form-text text-muted">
                Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
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
                  borderRadius: '50px',
                  fontWeight: '500',
                  padding: '10px',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primaryDark; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = theme.colors.primary; }}
              >
                S'inscrire
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
            Déjà un compte ?{' '}
            <button
              className="btn btn-link p-0"
              style={{ color: theme.colors.secondary, textDecoration: 'none' }}
              onClick={() => { setShowSignupModal(false); setShowLoginModal(true); }}
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