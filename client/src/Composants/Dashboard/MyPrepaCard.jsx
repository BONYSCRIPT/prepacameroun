import { MdLibraryBooks, MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SauvegarderBtn from "./SauvegarderBtn";

const MyPrepaCard = ({ inscription, onClick }) => {
    // Thème de couleurs pour la cohérence avec le reste de l'application
    const theme = {
        primary: '#0274d9',
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

    const prepa_nom = inscription.nom || inscription.prepa_nom || 'Sans nom';
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    // Détection de la taille de l'écran
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Styles adaptés selon le mode d'affichage
    const cardStyle = {
        boxShadow: theme.cardShadow,
        width: isMobile ? '100%' : '90%',
        maxWidth: isMobile ? 'none' : '280px',
        margin: isMobile ? '0 0 12px 0' : '0 auto 16px auto',
        transition: theme.transition,
        borderRadius: theme.borderRadius,
        border: 'none',
        cursor: 'pointer'
    };

    const headerStyle = {
        backgroundColor: theme.primary,
        color: 'white',
        borderRadius: `${theme.borderRadius} ${theme.borderRadius} 0 0`,
        padding: '12px 15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const buttonStyle = {
        backgroundColor: theme.success,
        color: 'white',
        borderRadius: theme.buttonBorderRadius,
        border: 'none',
        padding: '8px 16px',
        fontWeight: '600',
        boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)',
        transition: theme.transition,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        marginTop: '12px'
    };

    return (
        <div
            className="d-flex flex-column flex-shrink-0 bg-white rounded overflow-hidden"
            style={cardStyle}
            onClick={() => onClick && onClick(inscription)}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.cardShadow;
            }}
        >
            <div className="w-100">
                <div style={headerStyle}>
                    <MdLibraryBooks size={18} />
                    <span className={isMobile ? "fs-6" : "text-truncate"} style={{ maxWidth: '160px', color: 'white', flex: 1 }}>
                        {prepa_nom}
                    </span>
                    <span className="badge ms-auto" style={{ backgroundColor: '#D4AF37', color: '#333', fontSize: '0.65rem', fontWeight: 700, borderRadius: '12px', padding: '4px 8px' }}>
                        Inscrit
                    </span>
                </div>
                <div className="p-3 pt-1">
                    <Link
                        to={`/user/prepa/${inscription.prepa_id}`}
                        className="btn"
                        style={buttonStyle}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = theme.successDark;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = theme.success;
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Continuer <MdArrowForward />
                    </Link>
                    <div className="mt-2">
                        <SauvegarderBtn
                            prepaId={inscription.prepa_id}
                            expirationDate={inscription.date_expiration?.toDate ? inscription.date_expiration.toDate() : (inscription.date_expiration || null)}
                            prepaNom={prepa_nom}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPrepaCard;