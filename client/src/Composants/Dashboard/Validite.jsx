import React, { useState, useEffect } from 'react';
import { MdCalendarToday, MdOutlineHourglassTop } from 'react-icons/md';
import theme from '../../utils/theme';

const Validite = ({ userPrepas, selectedPrepa, onPrepaSelect }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    // Détection de la taille de l'écran
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePrepaChange = (e) => {
        const selected = userPrepas.find(prepa => String(prepa.prepa_id) === String(e.target.value));
        if (selected) {
            onPrepaSelect(selected);
        }
    };

    // Styles adaptés selon le mode d'affichage et la nouvelle charte graphique
    const containerStyle = {
        boxShadow: theme.shadows.card,
        width: isMobile ? '100%' : '90%',
        maxWidth: isMobile ? 'none' : '280px',
        margin: isMobile ? '0 0 12px 0' : '0 auto 16px auto',
        borderRadius: theme.borderRadius.card,
        backgroundColor: theme.colors.white,
        transition: theme.transitions.default
    };

    const selectStyle = {
        borderRadius: theme.borderRadius.input,
        borderColor: theme.colors.light,
        backgroundColor: theme.colors.light,
        color: theme.colors.dark,
        fontFamily: theme.fonts.primary,
        fontSize: '0.9rem',
        transition: theme.transitions.default,
        boxShadow: 'none'
    };

    const badgeStyle = {
        fontWeight: 500,
        borderRadius: theme.borderRadius.badge,
        fontSize: '0.8rem',
        padding: '0.35em 0.65em',
        transition: theme.transitions.default
    };

    const labelStyle = {
        fontSize: '0.9rem',
        color: theme.colors.darkGray,
        fontWeight: 500
    };

    // Formatage des dates (Timestamp Firestore ou string)
    const formatDate = (dateValue) => {
        if (!dateValue) return '-';
        try {
            // Si c'est un Timestamp Firestore (objet avec toDate())
            if (dateValue.toDate && typeof dateValue.toDate === 'function') {
                return dateValue.toDate().toLocaleDateString('fr-FR');
            }
            // Si c'est une string ou un Date
            return new Date(dateValue).toLocaleDateString('fr-FR');
        } catch (error) {
            console.error('Erreur de formatage de date:', error);
            return '-';
        }
    };

    return (
        <div 
            className="d-flex flex-column flex-shrink-0 border rounded p-3"
            style={containerStyle}
            onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = theme.shadows.cardHover;
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = theme.shadows.card;
            }}
        >
            <select
                className="form-select"
                style={selectStyle}
                value={selectedPrepa ? selectedPrepa.prepa_id : ''}
                onChange={handlePrepaChange}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 0.2rem ${theme.colors.primaryLight}`;
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.light;
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <option value="">Sélectionnez une préparation</option>
                {userPrepas.map(prepa => (
                    <option key={prepa.prepa_id} value={prepa.prepa_id}>{prepa.nom || prepa.prepa_nom || 'Sans nom'}</option>
                ))}
            </select>
            
            <div className="mt-4">
                {/* Version desktop - Améliorée avec un meilleur alignement */}
                <div className={`d-${isMobile ? 'none' : 'block'}`}>
                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <MdCalendarToday style={{ color: theme.colors.success, marginRight: '8px' }} />
                            <span style={labelStyle}>Date d&apos;inscription</span>
                            <span 
                                className="badge ms-1 justify-content-center" 
                                style={{
                                    ...badgeStyle,
                                    backgroundColor: theme.colors.success,
                                    color: theme.colors.white
                                }}
                            >
                                {selectedPrepa ? formatDate(selectedPrepa.date_inscription) : '-'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="d-flex align-items-center mb-2">
                            <MdOutlineHourglassTop style={{ color: theme.colors.primary, marginRight: '8px' }} />
                            <span style={labelStyle}>Date d&apos;expiration</span>
                            <span 
                                className="badge ms-2" 
                                style={{
                                    ...badgeStyle,
                                    backgroundColor: theme.colors.primary,
                                    color: theme.colors.white
                                }}
                            >
                                {selectedPrepa ? formatDate(selectedPrepa.date_expiration) : '-'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Version mobile (plus compacte) */}
                <div className={`d-${isMobile ? 'block' : 'none'}`}>
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <MdCalendarToday style={{ color: theme.colors.success, marginRight: '8px' }} />
                                <span style={labelStyle}>Inscription:</span>
                            </div>
                            <span 
                                className="badge" 
                                style={{
                                    ...badgeStyle,
                                    backgroundColor: theme.colors.success,
                                    color: theme.colors.white
                                }}
                            >
                                {selectedPrepa ? formatDate(selectedPrepa.date_inscription) : '-'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <MdOutlineHourglassTop style={{ color: theme.colors.primary, marginRight: '8px' }} />
                                <span style={labelStyle}>Expiration:</span>
                            </div>
                            <span 
                                className="badge" 
                                style={{
                                    ...badgeStyle,
                                    backgroundColor: theme.colors.primary,
                                    color: theme.colors.white
                                }}
                            >
                                {selectedPrepa ? formatDate(selectedPrepa.date_expiration) : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Message d'information si aucune préparation n'est sélectionnée */}
            {!selectedPrepa && (
                <div 
                    className="mt-3 p-2 text-center" 
                    style={{
                        backgroundColor: theme.colors.lightGray,
                        borderRadius: theme.borderRadius.card,
                        fontSize: '0.85rem',
                        color: theme.colors.darkGray
                    }}
                >
                    Sélectionnez une préparation pour voir ses dates de validité
                </div>
            )}
        </div>
    );
};

export default Validite;
