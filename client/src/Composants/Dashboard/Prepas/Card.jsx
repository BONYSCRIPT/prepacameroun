import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdPayment, MdArrowForward } from 'react-icons/md';
import ZitopayButton from './ZitopayButton';
import useDeviceSize from '../../../hooks/useDeviceSize';

const Card = ({ id, image, titre, prix, description, theme, isInscribed, onPaymentSuccess }) => {
  const { isMobile } = useDeviceSize();

  // Couleurs de secours si le thème est manquant
  const colors = {
    primary: '#be0050',
    success: '#28a745',
    secondary: '#333',
    background: '#ffffff',
    text: '#333333',
    muted: '#666666',
    border: '#eeeeee'
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    backgroundColor: colors.background,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    margin: '0 0 20px 0',
    padding: '0',
    overflow: 'hidden',
    width: '100%',
    minHeight: '180px'
  };

  const imageStyle = {
    width: isMobile ? '100%' : '200px',
    height: isMobile ? '160px' : 'auto',
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  };

  const contentStyle = {
    flex: '1',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const buttonBaseStyle = {
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    minWidth: '130px'
  };

  return (
    <div style={cardStyle}>
      {/* Zone Image */}
      <div style={imageStyle}>
        <img
          src={image ? (image.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL}${image}` : image) : 'https://via.placeholder.com/200x150?text=Pas+d+image'}
          alt={titre}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = "https://placehold.co/400x300?text=Image+non+disponible";
          }}
        />
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: isInscribed ? colors.success : colors.primary,
          color: 'white',
          padding: '4px 10px',
          borderRadius: '50px',
          fontSize: '0.75rem',
          fontWeight: '900',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          {isInscribed ? 'INSCRIT' : `${prix} XAF`}
        </div>
      </div>

      {/* Zone Contenu */}
      <div style={contentStyle}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: colors.text }}>{titre}</h3>
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '0.85rem',
            color: colors.muted,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {description}
          </p>
        </div>

        {/* Zone Boutons - Toujours visibles */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isInscribed ? (
            <Link to={`/user/prepa/${id}`} style={{ ...buttonBaseStyle, backgroundColor: colors.success, flex: '1' }}>
              <MdArrowForward /> Accéder à la préparation
            </Link>
          ) : (
            <>
              <div style={{ flex: '1', minWidth: '130px' }}>
                <ZitopayButton
                  prix={prix}
                  prepaId={id}
                  prepaNom={titre}
                  buttonText="S'inscrire"
                  buttonStyle={{ ...buttonBaseStyle, backgroundColor: colors.primary, width: '100%' }}
                  onSuccess={onPaymentSuccess}
                />
              </div>
              <Link to={`/user/prepa/consultation/${id}`} style={{ ...buttonBaseStyle, backgroundColor: colors.secondary, flex: isMobile ? '1' : '0 0 auto' }}>
                <MdVisibility /> Consulter
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Card);
