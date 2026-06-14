import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MdArrowForward } from "react-icons/md";

const DisciplineCard = ({ discipline }) => {
    // Thème de couleurs pour la cohérence avec le reste de l'application
    const theme = {
        primary: '#be0050',
        primaryDark: '#770033',
        secondary: '#212529',
        light: '#f8f9fa',
        transition: 'all 0.3s ease',
        cardShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        hoverShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px'
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 992);
    const [isHovered, setIsHovered] = useState(false);

    // Détection de la taille de l'écran
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 992);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Styles adaptés selon le mode d'affichage
    const cardStyle = {
        width: isMobile ? '100%' : isTablet ? '95%' : '90%',
        height: isMobile ? 'auto' : '48vh',
        maxHeight: isMobile ? '400px' : '500px',
        boxShadow: isHovered ? theme.hoverShadow : theme.cardShadow,
        textDecoration: 'none',
        margin: '0 auto',
        transition: theme.transition,
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        border: 'none',
        borderRadius: theme.borderRadius,
        overflow: 'hidden',
        backgroundColor: 'white',
        color: theme.secondary
    };

    const imageStyle = {
        height: isMobile ? '180px' : '25vh',
        objectFit: 'cover',
        transition: theme.transition,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)'
    };

    const headerStyle = {
        borderBottom: 'none',
        backgroundColor: 'white',
        padding: '15px',
        transition: theme.transition
    };

    const bodyStyle = {
        height: isMobile ? 'auto' : '12vh',
        overflow: 'auto',
        flex: '1 1 auto',
        padding: '0 15px 15px 15px',
        color: '#6c757d'
    };

    const titleStyle = {
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: '0',
        transition: theme.transition,
        color: isHovered ? theme.primary : theme.secondary
    };

    const overlayStyle = {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '15px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        display: isHovered ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        transition: theme.transition,
        opacity: isHovered ? 1 : 0
    };

    const buttonStyle = {
        backgroundColor: theme.primary,
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: theme.transition
    };

    return (
        <Link
            to={`${discipline.id}`}
            className="card position-relative"
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="position-relative overflow-hidden">
                <img
                    src={discipline.image_url ? (discipline.image_url.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL}${discipline.image_url}` : discipline.image_url) : ''}
                    style={imageStyle}
                    className="card-img-top"
                    alt={discipline.nom}
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Image+non+disponible';
                    }}
                />
                <div style={overlayStyle}>
                    <button style={buttonStyle}>
                        Découvrir <MdArrowForward />
                    </button>
                </div>
            </div>
            <div className="card-header text-center" style={headerStyle}>
                <h5 className="card-title pt-2" style={titleStyle}>
                    {discipline.nom}
                </h5>
            </div>
            <div className="card-body" style={bodyStyle}>
                <p className="card-text" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {discipline.description}
                </p>
            </div>
        </Link>
    );
};

export default DisciplineCard;
