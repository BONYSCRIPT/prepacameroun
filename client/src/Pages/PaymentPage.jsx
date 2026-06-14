import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdKeyboardDoubleArrowRight, MdArrowBack, MdMenuBook, MdAssignment, MdHistory } from 'react-icons/md';
import Page from '../Composants/Page';
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import { getPrepaById, getDisciplineById, getLeconsByDiscipline, getExercicesByDiscipline, getAnciensSujetsByDiscipline } from '../services/firestoreService';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const PrepaPage = () => {
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
    const [activeTab, setActiveTab] = useState('lecons');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Détection de la taille de l'écran
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && sidebarOpen) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Vérifier la taille initiale
        
        return () => window.removeEventListener('resize', handleResize);
    }, [sidebarOpen]);

    // Fonction pour récupérer les données (Firestore direct)
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Récupération des données depuis Firestore
            const [prepaData, disciplineData, leconsData, exercicesData, anciensSujetsData] = await Promise.all([
                getPrepaById(prepaId),
                getDisciplineById(disciplineId),
                getLeconsByDiscipline(disciplineId),
                getExercicesByDiscipline(disciplineId),
                getAnciensSujetsByDiscipline(disciplineId)
            ]);

            setPrepa(prepaData);
            setDiscipline(disciplineData);

            // Tri par numero_page
            const sortedCourses = [...leconsData].sort((a, b) => a.numero_page - b.numero_page);
            const sortedExercises = [...exercicesData].sort((a, b) => a.numero_page - b.numero_page);
            const sortedPastExams = [...anciensSujetsData].sort((a, b) => a.numero_page - b.numero_page);

            setCourses(sortedCourses);
            setExercises(sortedExercises);
            setPastExams(sortedPastExams);

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
                    <div className="spinner-border text-primary" role="status">
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
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Erreur!</h4>
                        <p>{error}</p>
                        <hr />
                        <div className="d-flex justify-content-between">
                            <Link to={`/user/prepa/${prepaId}`} className="btn btn-outline-danger">
                                <MdArrowBack className="me-1" /> Retour
                            </Link>
                            <button className="btn btn-primary" onClick={fetchData}>
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* En-tête fixe */}
            <div className='fixed-top'>
                <NavbarApp />
                <div className="d-flex justify-content-between align-items-center p-2 p-md-3 bg-primary text-white border rounded mb-1 mx-auto"
                    style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }}>
                    <div className="d-flex align-items-center">
                        <Link to={`/user/prepa/${prepaId}`} className='text-white text-decoration-none me-3'>
                            <MdArrowBack /> {!isMobile && 'Retour'}
                        </Link>
                        {isMobile && (
                            <button 
                                className="btn btn-sm btn-outline-light ms-2" 
                                onClick={toggleSidebar}
                                aria-label="Toggle sidebar"
                            >
                                {sidebarOpen ? 'Masquer' : 'Menu'}
                            </button>
                        )}
                    </div>
                    <h6 className='mb-0 text-truncate' style={{ maxWidth: isMobile ? '150px' : '300px' }}>
                        {prepa?.nom} <MdKeyboardDoubleArrowRight /> {discipline?.nom}
                    </h6>
                    <div></div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="container-fluid" style={{ marginTop: isMobile ? '100px' : '120px', paddingBottom: '20px' }}>
                <div className="row">
                    {/* Sidebar - conditionnellement affichée */}
                    {(sidebarOpen || !isMobile) && (
                        <div className={`${isMobile ? 'position-fixed start-0 h-100 bg-white z-3' : 'col-md-3 col-lg-3'}`}
                            style={{ 
                                width: isMobile ? '80%' : 'auto',
                                top: isMobile ? '100px' : 'auto',
                                boxShadow: isMobile ? '2px 0 5px rgba(0,0,0,0.2)' : 'none',
                                overflowY: 'auto',
                                maxHeight: isMobile ? 'calc(100vh - 100px)' : '75vh'
                            }}>
                            <div className="bg-white rounded mb-3" style={{ 
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'
                            }}>
                                <div className="accordion" id="accordionPanelsStayOpenExample">
                                    {/* Accordéon pour les cours */}
                                    <div className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button className={`accordion-button ${activeTab !== 'lecons' ? 'collapsed' : ''}`} 
                                                type="button" 
                                                data-bs-toggle="collapse" 
                                                data-bs-target="#panelsStayOpen-collapseOne" 
                                                aria-expanded={activeTab === 'lecons'} 
                                                aria-controls="panelsStayOpen-collapseOne">
                                                <MdMenuBook className="me-2" /> Cours ({courses.length})
                                            </button>
                                        </h2>
                                        <div id="panelsStayOpen-collapseOne" className={`accordion-collapse collapse ${activeTab === 'lecons' ? 'show' : ''}`}>
                                            <div className="accordion-body p-2">
                                                {courses.length > 0 ? (
                                                    <div className="list-group list-group-flush">
                                                        {courses.map(course => (
                                                            <button
                                                                key={course.id}
                                                                className={`list-group-item list-group-item-action ${content.id === course.id ? 'active' : ''}`}
                                                                onClick={() => handleContentSelect('course', course.id)}
                                                            >
                                                                <small className="text-muted me-2">{course.numero_page}.</small>
                                                                {course.titre}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted text-center py-3">Aucun cours disponible</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Accordéon pour les exercices */}
                                    <div className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button className={`accordion-button ${activeTab !== 'exercices' ? 'collapsed' : ''}`} 
                                                type="button" 
                                                data-bs-toggle="collapse" 
                                                data-bs-target="#panelsStayOpen-collapseTwo" 
                                                aria-expanded={activeTab === 'exercices'} 
                                                aria-controls="panelsStayOpen-collapseTwo">
                                                <MdAssignment className="me-2" /> Exercices & Corrigés ({exercises.length})
                                            </button>
                                        </h2>
                                        <div id="panelsStayOpen-collapseTwo" className={`accordion-collapse collapse ${activeTab === 'exercices' ? 'show' : ''}`}>
                                            <div className="accordion-body p-2">
                                                {exercises.length > 0 ? (
                                                    <div className="list-group list-group-flush">
                                                        {exercises.map(exercise => (
                                                            <button
                                                                key={exercise.id}
                                                                className={`list-group-item list-group-item-action ${content.id === exercise.id ? 'active' : ''}`}
                                                                onClick={() => handleContentSelect('exercise', exercise.id)}
                                                            >
                                                                <small className="text-muted me-2">{exercise.numero_page}.</small>
                                                                {exercise.titre}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted text-center py-3">Aucun exercice disponible</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Accordéon pour les anciens sujets */}
                                    <div className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button className={`accordion-button ${activeTab !== 'anciensSujets' ? 'collapsed' : ''}`} 
                                                type="button" 
                                                data-bs-toggle="collapse" 
                                                data-bs-target="#panelsStayOpen-collapseThree" 
                                                aria-expanded={activeTab === 'anciensSujets'} 
                                                aria-controls="panelsStayOpen-collapseThree">
                                                <MdHistory className="me-2" /> Anciens Sujets & Corrigés ({pastExams.length})
                                            </button>
                                        </h2>
                                        <div id="panelsStayOpen-collapseThree" className={`accordion-collapse collapse ${activeTab === 'anciensSujets' ? 'show' : ''}`}>
                                            <div className="accordion-body p-2">
                                                {pastExams.length > 0 ? (
                                                    <div className="list-group list-group-flush">
                                                        {pastExams.map(exam => (
                                                            <button
                                                                key={exam.id}
                                                                className={`list-group-item list-group-item-action ${content.id === exam.id ? 'active' : ''}`}
                                                                onClick={() => handleContentSelect('pastExam', exam.id)}
                                                            >
                                                                <small className="text-muted me-2">{exam.numero_page}.</small>
                                                                {exam.titre}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted text-center py-3">Aucun ancien sujet disponible</p>
                                                )}
                                            </div>  
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Bouton pour fermer la sidebar sur mobile */}
                                {isMobile && (
                                    <div className="d-grid p-2">
                                        <button 
                                            className="btn btn-sm btn-outline-secondary" 
                                            onClick={toggleSidebar}
                                        >
                                            Fermer le menu
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Contenu principal - ajuste sa taille en fonction de la sidebar */}
                    <div className={`${isMobile || !sidebarOpen ? 'col-12' : 'col-md-9 col-lg-9'}`}>
                        {/* Overlay pour fermer la sidebar sur mobile quand elle est ouverte */}
                        {isMobile && sidebarOpen && (
                            <div 
                                className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-2"
                                style={{ top: '100px' }}
                                onClick={toggleSidebar}
                            ></div>
                        )}
                        
                        {/* Composant Page pour afficher le contenu sélectionné */}
                        <Page
                            content={content}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            isFirstPage={currentPage === 1}
                            isLastPage={currentPage === contentPages.length}
                            currentPage={currentPage}
                            totalPages={contentPages.length}
                            isMobile={isMobile}
                        />
                    </div>
                </div>
            </div>
            
            {/* Styles spécifiques pour ce composant */}
            <style>{`
                .accordion-button:not(.collapsed) {
                    background-color: #f8f9fa;
                    color: #0d6efd;
                }
                
                .list-group-item.active {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
                
                @media (max-width: 767.98px) {
                    .accordion-body {
                        padding: 0.5rem;
                    }
                    
                    .list-group-item {
                        padding: 0.5rem 0.75rem;
                    }
                }
                
                /* Animation pour la sidebar mobile */
                @keyframes slideIn {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                
                .position-fixed.start-0.h-100 {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default PrepaPage;

