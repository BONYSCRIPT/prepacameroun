import { useState, useEffect } from 'react';

const Vide = ({ message }) => {
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
    const containerStyle = {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        width: isMobile ? '100%' : '90%',
        maxWidth: isMobile ? 'none' : '280px',
        margin: isMobile ? '0 0 12px 0' : '0 auto 16px auto',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    return (
        <div 
            className="d-flex flex-column flex-shrink-0 bg-white border rounded p-3"
            style={containerStyle}
        >
            <div className="text-center p-2 text-muted">
                {message}
            </div>
        </div>
    );
};

export default Vide;
