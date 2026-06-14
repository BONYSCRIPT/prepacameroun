import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MdKeyboardDoubleArrowRight,
    MdLock,
    MdArrowBack,
    MdMenuBook,
    MdAssignment,
    MdHistory,
    MdPayment,
    MdInfo
} from 'react-icons/md';
import Page from '../Composants/Page';
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import { getPrepaById, getDisciplineById, getLeconsByDiscipline, getExercicesByDiscipline, getAnciensSujetsByDiscipline } from '../services/firestoreService';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { useUserAuth } from '../contexts/useUserAuth';
import ZitopayButton from '../Composants/Dashboard/Prepas/ZitopayButton';
import 'bootstrap/dist/css/bootstrap.min.css';

// Thème de l'application
const theme = {
    colors: {
        primary: '#be0050',
        secondary: '#212529',
        success: '#28a745',
        info: '#17a2b8',
        warning: '#ffc107',
        danger: '#dc3545',
        light: '#f8f9fa',
        dark: '#343a40',
        white: '#ffffff',
        text: '#495057',
        border: '#dee2e6',
        lightPrimary: '#f8e5ec',
        darkPrimary: '#770033',
        muted: '#6c757d'
    },
    shadows: {
        card: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        elevated: '0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.1)',
        button: '0 4px 6px rgba(190, 0, 80, 0.2)'
    },
    borderRadius: {
        sm: '0.25rem',
        default: '0.375rem',
        lg: '0.5rem',
        xl: '1rem',
        pill: '50rem'
    },
    transitions: {
        default: 'all 0.3s ease',
        fast: 'all 0.15s ease',
        slow: 'all 0.5s ease'
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem'
    }
};

const PrepaPageConsultation = () => {
    // États
    const { prepaId, disciplineId } = useParams();
    const [prepa, setPrepa] = useState(null);
    const [discipline, setDiscipline] = useState(null);
    const [content, setContent] = useState({ type: null, id: null });
    const [courses, setCourses] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [pastExams, setPastExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [contentPages, setContentPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('lecons');

    const navigate = useNavigate();
    const { user } = useUserAuth();

    // Détection de la taille de l'écran
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Vérifier la taille initiale

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fonction pour récupérer les données
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Récupération depuis Firestore
            const [prepaData, disciplineData, leconsData, exercicesData, anciensSujetsData] = await Promise.all([
                getPrepaById(prepaId),
                getDisciplineById(disciplineId),
                getLeconsByDiscipline(disciplineId),
                getExercicesByDiscipline(disciplineId),
                getAnciensSujetsByDiscipline(disciplineId)
            ]);

            setPrepa(prepaData);
            setDiscipline(disciplineData);
            setCourses([...leconsData].sort((a, b) => a.numero_page - b.numero_page));
            setExercises([...exercicesData].sort((a, b) => a.numero_page - b.numero_page));
            setPastExams([...anciensSujetsData].sort((a, b) => a.numero_page - b.numero_page));

            // Trier les tableaux
            const sortedCourses = [...leconsData].sort((a, b) => a.numero_page - b.numero_page);
            const sortedExercises = [...exercicesData].sort((a, b) => a.numero_page - b.numero_page);
            const sortedPastExams = [...anciensSujetsData].sort((a, b) => a.numero_page - b.numero_page);

            // Initialiser avec le premier cours si disponible
            if (sortedCourses.length > 0) {
                setContentPages(sortedCourses);
                setContent({ type: 'course', id: sortedCourses[0].id });
                setActiveTab('lecons');
                setCurrentPage(1);
            } else if (sortedExercises.length > 0) {
                // Si pas de cours, essayer avec les exercices
                setContentPages(sortedExercises);
                setContent({ type: 'exercise', id: sortedExercises[0].id });
                setActiveTab('exercices');
                setCurrentPage(1);
            } else if (sortedPastExams.length > 0) {
                // Si pas d'exercices non plus, essayer avec les anciens sujets
                setContentPages(sortedPastExams);
                setContent({ type: 'pastExam', id: sortedPastExams[0].id });
                setActiveTab('anciensSujets');
                setCurrentPage(1);
            }

            setLoading(false);
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error);
            setError("Une erreur est survenue lors du chargement des données. Veuillez réessayer.");
            toast.error("Erreur lors du chargement des données");
            setLoading(false);
        }
    }, [prepaId, disciplineId]);

    // Effet pour charger les données initiales
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ Listener postMessage : rafraîchir automatiquement après paiement
    useEffect(() => {
        const handlePaymentSuccess = (event) => {
            if (event.data?.type === 'payment_success' && event.data?.prepaId === prepaId) {
                const ref = event.data?.ref || '';
                console.log('[Consultation] Paiement confirmé, redirection vers le dashboard pour prepa:', prepaId, 'ref:', ref);
                toast.success('🎉 Inscription activée avec succès !');
                navigate(`/user/dashboard/success/${prepaId}?ref=${ref}`);
            }
        };
        window.addEventListener('message', handlePaymentSuccess);
        return () => window.removeEventListener('message', handlePaymentSuccess);
    }, [navigate, prepaId]);

    // Gestion de la sélection du contenu
    const handleContentSelect = (type, id) => {
        // Trouver le contenu correspondant et mettre à jour les pages de contenu
        let selectedPages = [];
        let selectedIndex = 0;

        if (type === 'course') {
            selectedPages = courses;
            selectedIndex = selectedPages.findIndex(item => item.id === id);
            setActiveTab('lecons');
        } else if (type === 'exercise') {
            selectedPages = exercises;
            selectedIndex = selectedPages.findIndex(item => item.id === id);
            setActiveTab('exercices');
        } else if (type === 'pastExam') {
            selectedPages = pastExams;
            selectedIndex = selectedPages.findIndex(item => item.id === id);
            setActiveTab('anciensSujets');
        }

        if (selectedIndex === -1) {
            console.error(`Contenu avec l'ID ${id} non trouvé dans la liste ${type}`);
            return;
        }

        setContent({ type, id });
        setContentPages(selectedPages);
        setCurrentPage(selectedIndex + 1);

        // Fermer la sidebar sur mobile après sélection
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    // Fonction pour aller à la page suivante
    const handleNext = () => {
        if (currentPage < contentPages.length) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);

            const nextContent = contentPages[nextPage - 1];
            let type = '';

            // Déterminer le type en fonction de l'onglet actif
            if (activeTab === 'lecons') type = 'course';
            else if (activeTab === 'exercices') type = 'exercise';
            else if (activeTab === 'anciensSujets') type = 'pastExam';

            setContent({ type, id: nextContent.id });
        }
    };

    // Fonction pour aller à la page précédente
    const handlePrevious = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);

            const prevContent = contentPages[prevPage - 1];
            let type = '';

            // Déterminer le type en fonction de l'onglet actif
            if (activeTab === 'lecons') type = 'course';
            else if (activeTab === 'exercices') type = 'exercise';
            else if (activeTab === 'anciensSujets') type = 'pastExam';

            setContent({ type, id: prevContent.id });
        }
    };

    // Fonction pour basculer l'affichage de la sidebar
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Rendu conditionnel pour l'état de chargement
    if (loading) {
        return (
            <>
                <NavbarApp />
                <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                    <div className="spinner-border" role="status" style={{ color: theme.colors.primary }}>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </>
        );
    }

    // Rendu conditionnel pour l'état d'erreur
    if (error) {
        return (
            <>
                <NavbarApp />
                <div className="container mt-5">
                    <div className="alert alert-danger" role="alert" style={{ borderRadius: theme.borderRadius.default, boxShadow: theme.shadows.card }}>
                        <h4 className="alert-heading">Erreur!</h4>
                        <p>{error}</p>
                        <hr />
                        <div className="d-flex justify-content-between">
                            <Link
                                to={`/user/prepa/consultation/${prepaId}`}
                                className="btn"
                                style={{
                                    backgroundColor: 'transparent',
                                    color: theme.colors.danger,
                                    border: `1px solid ${theme.colors.danger}`,
                                    borderRadius: theme.borderRadius.default,
                                    transition: theme.transitions.default
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.colors.danger;
                                    e.currentTarget.style.color = theme.colors.white;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = theme.colors.danger;
                                }}
                            >
                                <MdArrowBack className="me-1" /> Retour
                            </Link>
                            <button
                                className="btn"
                                onClick={fetchData}
                                style={{
                                    backgroundColor: theme.colors.primary,
                                    color: theme.colors.white,
                                    borderRadius: theme.borderRadius.default,
                                    transition: theme.transitions.default,
                                    boxShadow: theme.shadows.button
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.colors.darkPrimary;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.colors.primary;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="prepa-page-container">
            {/* En-tête fixe */}
            <div className="fixed-header">
                <NavbarApp />
                <div className="header-bar d-flex justify-content-between align-items-center p-2 p-md-3"
                    style={{
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.white,
                        boxShadow: theme.shadows.card,
                        borderRadius: theme.borderRadius.default
                    }}>
                    <div className="d-flex align-items-center">
                        <Link to={`/user/prepa/consultation/${prepaId}`}
                            className='text-white text-decoration-none me-3'
                            style={{ transition: theme.transitions.default }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            <MdArrowBack /> {!isMobile && 'Retour'}
                        </Link>
                        {isMobile && (
                            <button
                                className="btn btn-sm"
                                style={{
                                    backgroundColor: 'transparent',
                                    color: theme.colors.white,
                                    border: `1px solid ${theme.colors.white}`,
                                    borderRadius: theme.borderRadius.default,
                                    transition: theme.transitions.default
                                }}
                                onClick={toggleSidebar}
                                aria-label="Toggle sidebar"
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {sidebarOpen ? 'Masquer' : 'Menu'}
                            </button>
                        )}
                    </div>
                    <h6 className='mb-0 text-truncate' style={{ maxWidth: isMobile ? '150px' : '300px', fontWeight: '600' }}>
                        {prepa?.nom} <MdKeyboardDoubleArrowRight /> {discipline?.nom}
                    </h6>
                    <div></div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="main-content-area" style={{ padding: '0 15px 20px' }}>
                <div className="content-wrapper">
                    {/* Sidebar */}
                    <div className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}
                        style={{
                            backgroundColor: theme.colors.white,
                            borderRadius: theme.borderRadius.default,
                            boxShadow: theme.shadows.card,
                            transition: theme.transitions.default
                        }}
                    >
                        <div className="sidebar-content p-3">
                            <div className="accordion" id="accordionPanelsStayOpenExample">
                                {/* Accordéon pour les cours */}
                                <div className="accordion-item" style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.default, overflow: 'hidden' }}>
                                    <h2 className="accordion-header">
                                        <button
                                            className={`accordion-button ${activeTab !== 'lecons' ? 'collapsed' : ''}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#panelsStayOpen-collapseOne"
                                            aria-expanded={activeTab === 'lecons'}
                                            aria-controls="panelsStayOpen-collapseOne"
                                            style={{
                                                color: activeTab === 'lecons' ? theme.colors.primary : theme.colors.text,
                                                backgroundColor: activeTab === 'lecons' ? theme.colors.lightPrimary : theme.colors.white,
                                                fontWeight: activeTab === 'lecons' ? '600' : '400',
                                                borderRadius: activeTab !== 'lecons' ? theme.borderRadius.default : `${theme.borderRadius.default} ${theme.borderRadius.default} 0 0`
                                            }}
                                        >
                                            <MdMenuBook className="me-2" /> Cours ({courses.length})
                                        </button>
                                    </h2>
                                    <div id="panelsStayOpen-collapseOne" className={`accordion-collapse collapse ${activeTab === 'lecons' ? 'show' : ''}`}>
                                        <div className="accordion-body p-2">
                                            {courses.length > 0 ? (
                                                <div className="list-group list-group-flush">
                                                    {courses.map((course, index) => (
                                                        <div key={course.id} className="d-flex align-items-center border-bottom py-2">
                                                            <button
                                                                className="btn btn-link text-decoration-none text-start flex-grow-1"
                                                                style={{
                                                                    color: index === 0 ? theme.colors.primary : theme.colors.muted,
                                                                    padding: theme.spacing.sm,
                                                                    transition: theme.transitions.default,
                                                                    fontWeight: index === 0 ? '500' : '400'
                                                                }}
                                                                onClick={() => handleContentSelect('course', course.id)}
                                                                disabled={index > 0}
                                                            >
                                                                {index === 0 ? (
                                                                    <span>{course.numero_page} - {course.titre}</span>
                                                                ) : (
                                                                    <span className="d-flex align-items-center">
                                                                        <MdLock className="me-1" style={{ color: theme.colors.muted }} />
                                                                        <span className="text-truncate">{course.numero_page} - {course.titre}</span>
                                                                    </span>
                                                                )}
                                                            </button>
                                                            {index === 0 && !prepa?.is_inscribed && (
                                                                <ZitopayButton
                                                                    prix={prepa?.prix}
                                                                    prepaId={prepa?.id}
                                                                    prepaNom={prepa?.nom}
                                                                    buttonText={isMobile ? "" : "S'inscrire"}
                                                                    buttonIcon={<MdPayment />}
                                                                    buttonStyle={{
                                                                        backgroundColor: theme.colors.success,
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: theme.borderRadius.pill,
                                                                        padding: '4px 12px',
                                                                        fontSize: '0.8rem',
                                                                        boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)',
                                                                        transition: theme.transitions.default,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '5px'
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center py-3" style={{ color: theme.colors.muted }}>
                                                    Aucun cours disponible
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Accordéon pour les exercices */}
                                <div className="accordion-item mt-2" style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.default, overflow: 'hidden' }}>
                                    <h2 className="accordion-header">
                                        <button
                                            className={`accordion-button ${activeTab !== 'exercices' ? 'collapsed' : ''}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#panelsStayOpen-collapseTwo"
                                            aria-expanded={activeTab === 'exercices'}
                                            aria-controls="panelsStayOpen-collapseTwo"
                                            style={{
                                                color: activeTab === 'exercices' ? theme.colors.primary : theme.colors.text,
                                                backgroundColor: activeTab === 'exercices' ? theme.colors.lightPrimary : theme.colors.white,
                                                fontWeight: activeTab === 'exercices' ? '600' : '400',
                                                borderRadius: activeTab !== 'exercices' ? theme.borderRadius.default : `${theme.borderRadius.default} ${theme.borderRadius.default} 0 0`
                                            }}
                                        >
                                            <MdAssignment className="me-2" /> Exercices & Corrigés ({exercises.length})
                                        </button>
                                    </h2>
                                    <div id="panelsStayOpen-collapseTwo" className={`accordion-collapse collapse ${activeTab === 'exercices' ? 'show' : ''}`}>
                                        <div className="accordion-body p-2">
                                            {exercises.length > 0 ? (
                                                <div className="list-group list-group-flush">
                                                    {exercises.map((exercise, index) => (
                                                        <div key={exercise.id} className="d-flex align-items-center border-bottom py-2">
                                                            <button
                                                                className="btn btn-link text-decoration-none text-start flex-grow-1"
                                                                style={{
                                                                    color: index === 0 ? theme.colors.primary : theme.colors.muted,
                                                                    padding: theme.spacing.sm,
                                                                    transition: theme.transitions.default,
                                                                    fontWeight: index === 0 ? '500' : '400'
                                                                }}
                                                                onClick={() => handleContentSelect('exercise', exercise.id)}
                                                                disabled={index > 0}
                                                            >
                                                                {index === 0 ? (
                                                                    <span>{exercise.numero_page} - {exercise.titre}</span>
                                                                ) : (
                                                                    <span className="d-flex align-items-center">
                                                                        <MdLock className="me-1" style={{ color: theme.colors.muted }} />
                                                                        <span className="text-truncate">{exercise.numero_page} - {exercise.titre}</span>
                                                                    </span>
                                                                )}
                                                            </button>
                                                            {index === 0 && !prepa?.is_inscribed && (
                                                                <ZitopayButton
                                                                    prix={prepa?.prix}
                                                                    prepaId={prepa?.id}
                                                                    prepaNom={prepa?.nom}
                                                                    buttonText={isMobile ? "" : "S'inscrire"}
                                                                    buttonIcon={<MdPayment />}
                                                                    buttonStyle={{
                                                                        backgroundColor: theme.colors.success,
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: theme.borderRadius.pill,
                                                                        padding: '4px 12px',
                                                                        fontSize: '0.8rem',
                                                                        boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)',
                                                                        transition: theme.transitions.default,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '5px'
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center py-3" style={{ color: theme.colors.muted }}>
                                                    Aucun exercice disponible
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Accordéon pour les anciens sujets */}
                                <div className="accordion-item mt-2" style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.default, overflow: 'hidden' }}>
                                    <h2 className="accordion-header">
                                        <button
                                            className={`accordion-button ${activeTab !== 'anciensSujets' ? 'collapsed' : ''}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#panelsStayOpen-collapseThree"
                                            aria-expanded={activeTab === 'anciensSujets'}
                                            aria-controls="panelsStayOpen-collapseThree"
                                            style={{
                                                color: activeTab === 'anciensSujets' ? theme.colors.primary : theme.colors.text,
                                                backgroundColor: activeTab === 'anciensSujets' ? theme.colors.lightPrimary : theme.colors.white,
                                                fontWeight: activeTab === 'anciensSujets' ? '600' : '400',
                                                borderRadius: activeTab !== 'anciensSujets' ? theme.borderRadius.default : `${theme.borderRadius.default} ${theme.borderRadius.default} 0 0`
                                            }}
                                        >
                                            <MdHistory className="me-2" /> Anciens Sujets & Corrigés ({pastExams.length})
                                        </button>
                                    </h2>
                                    <div id="panelsStayOpen-collapseThree" className={`accordion-collapse collapse ${activeTab === 'anciensSujets' ? 'show' : ''}`}>
                                        <div className="accordion-body p-2">
                                            {pastExams.length > 0 ? (
                                                <div className="list-group list-group-flush">
                                                    {pastExams.map((exam, index) => (
                                                        <div key={exam.id} className="d-flex align-items-center border-bottom py-2">
                                                            <button
                                                                className="btn btn-link text-decoration-none text-start flex-grow-1"
                                                                style={{
                                                                    color: index === 0 ? theme.colors.primary : theme.colors.muted,
                                                                    padding: theme.spacing.sm,
                                                                    transition: theme.transitions.default,
                                                                    fontWeight: index === 0 ? '500' : '400'
                                                                }}
                                                                onClick={() => handleContentSelect('pastExam', exam.id)}
                                                                disabled={index > 0}
                                                            >
                                                                {index === 0 ? (
                                                                    <span>{exam.numero_page} - {exam.titre}</span>
                                                                ) : (
                                                                    <span className="d-flex align-items-center">
                                                                        <MdLock className="me-1" style={{ color: theme.colors.muted }} />
                                                                        <span className="text-truncate">{exam.numero_page} - {exam.titre}</span>
                                                                    </span>
                                                                )}
                                                            </button>
                                                            {index === 0 && !prepa?.is_inscribed && (
                                                                <ZitopayButton
                                                                    prix={prepa?.prix}
                                                                    prepaId={prepa?.id}
                                                                    prepaNom={prepa?.nom}
                                                                    buttonText={isMobile ? "" : "S'inscrire"}
                                                                    buttonIcon={<MdPayment />}
                                                                    buttonStyle={{
                                                                        backgroundColor: theme.colors.success,
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: theme.borderRadius.pill,
                                                                        padding: '4px 12px',
                                                                        fontSize: '0.8rem',
                                                                        boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)',
                                                                        transition: theme.transitions.default,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '5px'
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center py-3" style={{ color: theme.colors.muted }}>
                                                    Aucun ancien sujet disponible
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bouton pour fermer la sidebar sur mobile */}
                            {isMobile && (
                                <div className="d-grid p-2 mt-3">
                                    <button
                                        className="btn"
                                        style={{
                                            backgroundColor: theme.colors.light,
                                            color: theme.colors.text,
                                            border: `1px solid ${theme.colors.border}`,
                                            borderRadius: theme.borderRadius.default,
                                            transition: theme.transitions.default
                                        }}
                                        onClick={toggleSidebar}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.colors.light}
                                    >
                                        Fermer le menu
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Overlay pour fermer la sidebar sur mobile quand elle est ouverte */}
                    {isMobile && sidebarOpen && (
                        <div
                            className="sidebar-overlay"
                            onClick={toggleSidebar}
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                transition: theme.transitions.default
                            }}
                        ></div>
                    )}

                    {/* Contenu principal */}
                    <div className="main-content">
                        <div className="content-display" style={{
                            backgroundColor: theme.colors.white,
                            borderRadius: theme.borderRadius.default,
                            boxShadow: theme.shadows.card,
                            padding: isMobile ? theme.spacing.md : theme.spacing.lg
                        }}>
                            {/* Composant Page pour afficher le contenu sélectionné */}
                            <Page
                                content={content}
                                isMobile={isMobile}
                            />

                            {/* Navigation entre les pages */}
                            <div className="pagination-controls d-flex justify-content-between align-items-center mt-4" style={{
                                padding: `${theme.spacing.md} 0`,
                                borderTop: `1px solid ${theme.colors.border}`
                            }}>
                                <button
                                    className="btn"
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: currentPage <= 1 ? theme.colors.muted : theme.colors.primary,
                                        border: `1px solid ${currentPage <= 1 ? theme.colors.border : theme.colors.primary}`,
                                        borderRadius: theme.borderRadius.default,
                                        transition: theme.transitions.default,
                                        opacity: currentPage <= 1 ? '0.6' : '1',
                                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={handlePrevious}
                                    disabled={currentPage <= 1}
                                    onMouseOver={(e) => {
                                        if (currentPage > 1) {
                                            e.currentTarget.style.backgroundColor = theme.colors.lightPrimary;
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    Précédent
                                </button>
                                <span className="page-indicator" style={{
                                    color: theme.colors.muted,
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}>
                                    Page {currentPage} sur {contentPages.length}
                                </span>
                                <button
                                    className="btn"
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: currentPage >= contentPages.length || currentPage >= 1 ? theme.colors.muted : theme.colors.primary,
                                        border: `1px solid ${currentPage >= contentPages.length || currentPage >= 1 ? theme.colors.border : theme.colors.primary}`,
                                        borderRadius: theme.borderRadius.default,
                                        transition: theme.transitions.default,
                                        opacity: currentPage >= contentPages.length || currentPage >= 1 ? '0.6' : '1',
                                        cursor: currentPage >= contentPages.length || currentPage >= 1 ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={handleNext}
                                    disabled={currentPage >= contentPages.length || currentPage >= 1}
                                    onMouseOver={(e) => {
                                        if (currentPage < contentPages.length && currentPage < 1) {
                                            e.currentTarget.style.backgroundColor = theme.colors.lightPrimary;
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    Suivant
                                </button>
                            </div>

                            {/* Bannière d'information */}
                            <div className="alert mt-4" style={{
                                backgroundColor: prepa?.is_inscribed ? '#d4edda' : theme.colors.lightPrimary,
                                color: theme.colors.text,
                                border: 'none',
                                borderRadius: theme.borderRadius.default,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div className="d-flex align-items-center">
                                    {prepa?.is_inscribed ? (
                                        <MdInfo className="me-3 fs-3" style={{ color: theme.colors.success }} />
                                    ) : (
                                        <MdLock className="me-3 fs-3" style={{ color: theme.colors.primary }} />
                                    )}
                                    <div>
                                        <h5 className="mb-1" style={{ color: prepa?.is_inscribed ? theme.colors.success : theme.colors.primary, fontWeight: '600' }}>
                                            {prepa?.is_inscribed ? 'Inscription active' : 'Accès limité'}
                                        </h5>
                                        <p className="mb-0">
                                            {prepa?.is_inscribed
                                                ? 'Vous êtes déjà inscrit à cette préparation. Vous pouvez accéder à tout le contenu.'
                                                : "Vous consultez une version d'essai. Pour accéder à tout le contenu, veuillez vous inscrire à cette préparation."}
                                        </p>
                                    </div>
                                </div>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                                    {prepa?.is_inscribed ? (
                                        <Link
                                            to={`/user/prepa/${prepaId}`}
                                            className="btn btn-success"
                                            style={{
                                                backgroundColor: theme.colors.success,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: theme.borderRadius.pill,
                                                padding: '0.6rem 2rem',
                                                boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)',
                                                transition: theme.transitions.default,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontWeight: '600',
                                                width: isMobile ? '100%' : 'auto',
                                                flex: isMobile ? 'none' : '1'
                                            }}
                                        >
                                            <MdKeyboardDoubleArrowRight size={20} /> Accéder au contenu complet
                                        </Link>
                                    ) : (
                                        <ZitopayButton
                                            prix={prepa?.prix}
                                            prepaId={prepa?.id}
                                            prepaNom={prepa?.nom}
                                            buttonText="S'inscrire maintenant"
                                            buttonIcon={<MdPayment />}
                                            buttonStyle={{
                                                backgroundColor: theme.colors.primary,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: theme.borderRadius.pill,
                                                padding: '0.6rem 2rem',
                                                boxShadow: theme.shadows.button,
                                                transition: theme.transitions.default,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontWeight: '600'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Styles spécifiques pour ce composant */}
            <style>
                {`
                    .prepa-page-container {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                    }
                   
                    .fixed-header {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        z-index: 1030;
                    }
                   
                    .main-content-area {
                        margin-top: 120px;
                        flex: 1;
                    }
                   
                    .content-wrapper {
                        display: flex;
                        position: relative;
                    }
                   
                    /* Styles pour mobile */
                    @media (max-width: 767.98px) {
                        .main-content-area {
                            margin-top: 100px;
                        }
                       
                        .sidebar-container {
                            position: fixed;
                            top: 100px;
                            left: 0;
                            width: 80%;
                            height: calc(100vh - 100px);
                            z-index: 1030;
                            transform: translateX(-100%);
                        }
                       
                        .sidebar-container.open {
                            transform: translateX(0);
                        }
                       
                        .sidebar-overlay {
                            position: fixed;
                            top: 100px;
                            left: 0;
                            width: 100%;
                            height: calc(100vh - 100px);
                            z-index: 1025;
                        }
                       
                        .content-wrapper {
                            display: block;
                        }
                       
                        .main-content {
                            width: 100%;
                        }
                    }
                   
                    /* Styles pour desktop */
                    @media (min-width: 768px) {
                        .sidebar-container {
                            width: 300px;
                            margin-right: 20px;
                        }
                       
                        .sidebar-container.closed {
                            width: 0;
                            margin-right: 0;
                            overflow: hidden;
                        }
                       
                        .main-content {
                            flex: 1;
                        }
                    }
                   
                    /* Animation pour le modal */
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    /* Amélioration de l'accessibilité pour les éléments désactivés */
                    button:disabled {
                        cursor: not-allowed;
                    }
                    
                    /* Amélioration de l'apparence des éléments de contenu */
                    .content-display img {
                        max-width: 100%;
                        height: auto;
                        border-radius: ${theme.borderRadius.sm};
                    }
                    
                    .content-display h1, .content-display h2, .content-display h3 {
                        color: ${theme.colors.primary};
                        margin-top: 1.5rem;
                        margin-bottom: 1rem;
                        font-weight: 600;
                    }
                    
                    .content-display p {
                        line-height: 1.6;
                        margin-bottom: 1rem;
                    }
                    
                    .content-display ul, .content-display ol {
                        padding-left: 1.5rem;
                        margin-bottom: 1rem;
                    }
                    
                    .content-display table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 1rem;
                        border-radius: ${theme.borderRadius.sm};
                        overflow: hidden;
                    }
                    
                    .content-display table th {
                        background-color: ${theme.colors.lightPrimary};
                        color: ${theme.colors.primary};
                        font-weight: 600;
                        text-align: left;
                        padding: 0.75rem;
                    }
                    
                    .content-display table td {
                        padding: 0.75rem;
                        border-top: 1px solid ${theme.colors.border};
                    }
                    
                    .content-display table tr:nth-child(even) {
                        background-color: ${theme.colors.light};
                    }
                    
                    /* Animation pour la sidebar */
                    @keyframes slideIn {
                        from { transform: translateX(-100%); }
                        to { transform: translateX(0); }
                    }
                    
                    .sidebar-container.open {
                        animation: slideIn 0.3s ease-out;
                    }
                `}
            </style>
        </div>
    );
};

export default PrepaPageConsultation;
