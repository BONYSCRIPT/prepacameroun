import { useState, useEffect } from 'react';
import { MdArrowLeft, MdArrowRight } from 'react-icons/md';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Page = ({
    content,
    onNext,
    onPrevious,
    isFirstPage,
    isLastPage,
    currentPage,
    totalPages,
    isMobile
}) => {
    const [pageContent, setPageContent] = useState(null);
    const [showCorrige, setShowCorrige] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            if (content.id) {
                setLoading(true);
                setError(null);
                setPageContent(null);
                
                let collectionName;
                switch (content.type) {
                    case 'course':
                        collectionName = 'lecons';
                        break;
                    case 'exercise':
                        collectionName = 'exercices';
                        break;
                    case 'pastExam':
                        collectionName = 'anciens_sujets';
                        break;
                    default:
                        setLoading(false);
                        setError("Type de contenu non reconnu");
                        console.error("Type de contenu non reconnu:", content.type);
                        return;
                }

                try {
                    const docRef = doc(db, collectionName, content.id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setPageContent({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        setError("Contenu non trouvé");
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Erreur lors de la récupération du contenu:", error);
                    setError("Erreur lors du chargement du contenu");
                    setLoading(false);
                }
            }
        };

        fetchContent();
    }, [content.id, content.type]);

    const toggleCorrige = () => {
        setShowCorrige(!showCorrige);
    };

    if (loading) {
        return (
            <div className="content-display d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-display d-flex justify-content-center align-items-center">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (!pageContent) {
        return (
            <div className="content-display d-flex justify-content-center align-items-center">
                Sélectionnez un contenu pour commencer
            </div>
        );
    }

    return (
        <div className="content-display">
            <div className="content-header pb-3 border-bottom">
                <h2 className={isMobile ? 'fs-4' : 'fs-2'}>{pageContent.titre}</h2>
                {content.type === 'pastExam' && pageContent.annee && (
                    <p className="text-muted">Année: {pageContent.annee}</p>
                )}
                <div className="navigation-controls d-flex justify-content-between align-items-center mt-3">
                    <button
                        className={`btn ${isMobile ? 'btn-sm' : ''} btn-success`}
                        onClick={onPrevious}
                        disabled={isFirstPage}
                    >
                        <MdArrowLeft /> {!isMobile && 'Précédent'}
                    </button>
                    <span className={isMobile ? 'small' : ''}>
                        Page {currentPage} {!isMobile && 'sur'} {totalPages}
                    </span>
                    <button
                        className={`btn ${isMobile ? 'btn-sm' : ''} btn-success`}
                        onClick={onNext}
                        disabled={isLastPage}
                    >
                        {!isMobile && 'Suivant'} <MdArrowRight />
                    </button>
                </div>
            </div>
            
            <div className="content-body pt-3 pb-4">
                <div
                    dangerouslySetInnerHTML={{ __html: pageContent.contenu || pageContent.enonce }}
                    className="content-container"
                />
                
                {(content.type === 'exercise' || content.type === 'pastExam') && pageContent.corrige && (
                    <div className="corrige-section">
                        <div className="d-flex justify-content-center">
                            <button
                                className={`btn ${isMobile ? 'btn-sm' : ''} btn-primary mt-3`}
                                onClick={toggleCorrige}
                            >
                                {showCorrige ? 'Masquer le corrigé' : 'Voir le corrigé'}
                            </button>
                        </div>
                        
                        {showCorrige && (
                            <div className={`mt-3 p-${isMobile ? '2' : '3'} border rounded bg-light`}>
                                <h3 className={isMobile ? 'fs-5' : ''}>Corrigé</h3>
                                <div
                                    dangerouslySetInnerHTML={{ __html: pageContent.corrige }}
                                    className="content-container"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className={`navigation-controls d-flex justify-content-between align-items-center border-top ${isMobile ? 'pt-3 pb-3' : 'pt-4 pb-4'} mt-3`}>
                <button
                    className={`btn ${isMobile ? 'btn-sm' : ''} btn-success`}
                    onClick={onPrevious}
                    disabled={isFirstPage}
                >
                    <MdArrowLeft /> {!isMobile && 'Précédent'}
                </button>
                <span className={isMobile ? 'small' : ''}>
                    Page {currentPage} {!isMobile && 'sur'} {totalPages}
                </span>
                <button
                    className={`btn ${isMobile ? 'btn-sm' : ''} btn-success`}
                    onClick={onNext}
                    disabled={isLastPage}
                >
                    {!isMobile && 'Suivant'} <MdArrowRight />
                </button>
            </div>
        </div>
    );
};

export default Page;
