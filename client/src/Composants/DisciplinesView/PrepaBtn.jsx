import { MdLibraryBooks } from 'react-icons/md';
import { useState, useEffect } from 'react';

const PrepaBtn = ({ prepa, isSelected, onClick }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Détection de la taille de l'écran
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Styles pour le bouton
    const btnStyle = {
        transition: 'all 0.2s ease-in-out',
        fontSize: isMobile ? '0.9rem' : '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: isSelected ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
    };

    return (
        <button
            className={`btn w-100 text-start rounded p-2 mt-2 ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={onClick}
            style={btnStyle}
            aria-pressed={isSelected}
        >
            <MdLibraryBooks className="flex-shrink-0" />
            <span className="text-truncate">{prepa.nom || prepa.prepa_nom || 'Sans nom'}</span>
        </button>
    );
};

export default PrepaBtn;
