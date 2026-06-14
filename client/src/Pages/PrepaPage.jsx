import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdKeyboardDoubleArrowRight, MdArrowBack, MdMenuBook, MdAssignment, MdHistory } from 'react-icons/md';
import Page from '../Composants/Page';
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import theme from '../utils/theme'; // Importer le thème

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
        
        const token = localStorage.getItem('userToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // Récupération des données de la prépa
            const prepaResponse = await axiosInstance.get(`/api/prepas/${prepaId}`, { headers });
            setPrepa(prepaResponse.data);

            // Récupération des données de la discipline
            const disciplineResponse = await axiosInstance.get(`/api/disciplines/${disciplineId}`, { headers });
            setDiscipline(disciplineResponse.data);

            // Récupération et tri des cours
            const coursesResponse = await axiosInstance.get(`/api/lecons/discipline/${disciplineId}`, { headers });
            const sortedCourses = [...coursesResponse.data].sort((a, b) => a.numero_page - b.numero_page);
            setCourses(sortedCourses);

            // Récupération et tri des exercices
            const exercisesResponse = await axiosInstance.get(`/api/exercices/discipline/${disciplineId}`, { headers });
            const sortedExercises = [...exercisesResponse.data].sort((a, b) => a.numero_page - b.numero_page);
            setExercises(sortedExercises);

            // Récupération et tri des anciens sujets
            const pastExamsResponse = await axiosInstance.get(`/api/anciens-sujets/discipline/${disciplineId}`, { headers });
            const sortedPastExams = [...pastExamsResponse.data].sort((a, b) => a.numero_page - b.numero_page);
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
                    <div className="alert" role="alert" style={{ 
                        backgroundColor: '#fff0f3', 
                        color: theme.colors.primary,
                        borderColor: theme.colors.primary,
                        borderLeft: `4px solid ${theme.colors.primary}`,
                        borderRadius: theme.borderRadius.default
                    }}>
                        <h4 className="alert-heading" style={{ color: theme.colors.primary, fontWeight: 600 }}>Erreur!</h4>
                        <p>{error}</p>
                        <hr />
                        <div className="d-flex justify-content-between">
                            <Link 
                                to={`/user/prepa/${prepaId}`} 
                                className="btn"
                                style={{
                                    backgroundColor: 'transparent',
                                    color: theme.colors.primary,
                                    border: `1px solid ${theme.colors.primary}`,
                                    borderRadius: theme.borderRadius.default,
                                    transition: theme.transitions.default
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.colors.primary;
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = theme.colors.primary;
                                }}
                            >
                                <MdArrowBack className="me-1" /> Retour
                            </Link>
                            <button 
                                className="btn"
                                style={{
                                    backgroundColor: theme.colors.secondary,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: theme.borderRadius.default,
                                    transition: theme.transitions.default,
                                    boxShadow: theme.shadows.button
                                }}
                                onClick={fetchData}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.colors.secondaryDark;
                                    e.currentTarget.style.boxShadow = theme.shadows.buttonHover;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.colors.secondary;
                                    e.currentTarget.style.boxShadow = theme.shadows.button;
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
        <div className="prepa-page-container" style={{ fontFamily: theme.fonts.primary }}>
            {/* En-tête fixe */}
            <div className="fixed-header">
                <NavbarApp />
                <div 
                    className="header-bar text-white p-2 p-md-3 d-flex justify-content-between align-items-center"
                    style={{ 
                        backgroundColor: theme.colors.primary,
                        borderRadius: theme.borderRadius.default,
                        boxShadow: theme.shadows.card
                    }}
                >
                    <div className="d-flex align-items-center">
                        <Link 
                            to={`/user/prepa/${prepaId}`} 
                            className='text-white text-decoration-none me-3'
                            style={{ transition: theme.transitions.default }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateX(-3px)';
                                e.currentTarget.style.opacity = '0.9';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.opacity = '1';
                            }}
                        >
                            <MdArrowBack /> {!isMobile && 'Retour'}
                        </Link>
                        {isMobile && (
                            <button
                                className="btn btn-sm"
                                style={{
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: '1px solid white',
                                    borderRadius: theme.borderRadius.default,
                                    transition: theme.transitions.default
                                }}
                                onClick={toggleSidebar}
                                aria-label="Toggle sidebar"
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {sidebarOpen ? 'Masquer' : 'Menu'}
                            </button>
                        )}
                    </div>
                    <h6 className='mb-0 text-truncate' style={{ maxWidth: isMobile ? '150px' : '300px', fontWeight: 600 }}>
                        {prepa?.nom} <MdKeyboardDoubleArrowRight /> {discipline?.nom}
                    </h6>
                    <div></div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="main-content-area" style={{ backgroundColor: theme.colors.light }}>
                <div className="content-wrapper">
                    {/* Sidebar */}
                    <div 
                        className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}
                        style={{ boxShadow: theme.shadows.card, borderRadius: theme.borderRadius.default }}
                    >
                        <div className="sidebar-content">
                            <div className="accordion" id="accordionPanelsStayOpenExample">
                                {/* Accordéon pour les cours */}
                                <div className="accordion-item">
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
                                                backgroundColor: activeTab === 'lecons' ? theme.colors.lightPrimary : 'white',
                                                fontWeight: activeTab === 'lecons' ? '600' : '400'
                                            }}
                                        >
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
                                                            style={{
                                                                backgroundColor: content.id === course.id ? theme.colors.primary : 'white',
                                                                color: content.id === course.id ? 'white' : theme.colors.text,
                                                                borderColor: content.id === course.id ? theme.colors.primary : '#dee2e6',
                                                                transition: theme.transitions.default,
                                                                borderRadius: theme.borderRadius.sm
                                                            }}
                                                        >
                                                            <small className={`me-2 ${content.id === course.id ? 'text-white' : 'text-muted'}`}>
                                                                {course.numero_page}.
                                                            </small>
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
                                        <button 
                                            className={`accordion-button ${activeTab !== 'exercices' ? 'collapsed' : ''}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#panelsStayOpen-collapseTwo"
                                            aria-expanded={activeTab === 'exercices'}
                                            aria-controls="panelsStayOpen-collapseTwo"
                                            style={{
                                                color: activeTab === 'exercices' ? theme.colors.primary : theme.colors.text,
                                                backgroundColor: activeTab === 'exercices' ? theme.colors.lightPrimary : 'white',
                                                fontWeight: activeTab === 'exercices' ? '600' : '400'
                                            }}
                                        >
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
                                                            style={{
                                                                backgroundColor: content.id === exercise.id ? theme.colors.primary : 'white',
                                                                color: content.id === exercise.id ? 'white' : theme.colors.text,
                                                                borderColor: content.id === exercise.id ? theme.colors.primary : '#dee2e6',
                                                                transition: theme.transitions.default,
                                                                borderRadius: theme.borderRadius.sm
                                                            }}
                                                        >
                                                            <small className={`me-2 ${content.id === exercise.id ? 'text-white' : 'text-muted'}`}>
                                                                {exercise.numero_page}.
                                                            </small>
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
                                        <button 
                                            className={`accordion-button ${activeTab !== 'anciensSujets' ? 'collapsed' : ''}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#panelsStayOpen-collapseThree"
                                            aria-expanded={activeTab === 'anciensSujets'}
                                            aria-controls="panelsStayOpen-collapseThree"
                                            style={{
                                                color: activeTab === 'anciensSujets' ? theme.colors.primary : theme.colors.text,
                                                backgroundColor: activeTab === 'anciensSujets' ? theme.colors.lightPrimary : 'white',
                                                fontWeight: activeTab === 'anciensSujets' ? '600' : '400'
                                            }}
                                        >
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
                                                            style={{
                                                                backgroundColor: content.id === exam.id ? theme.colors.primary : 'white',
                                                                color: content.id === exam.id ? 'white' : theme.colors.text,
                                                                borderColor: content.id === exam.id ? theme.colors.primary : '#dee2e6',
                                                                transition: theme.transitions.default,
                                                                borderRadius: theme.borderRadius.sm
                                                            }}
                                                        >
                                                            <small className={`me-2 ${content.id === exam.id ? 'text-white' : 'text-muted'}`}>
                                                                {exam.numero_page}.
                                                            </small>
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
                                        className="btn btn-sm"
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: theme.colors.text,
                                            border: `1px solid ${theme.colors.border}`,
                                            borderRadius: theme.borderRadius.default,
                                            transition: theme.transitions.default
                                        }}
                                        onClick={toggleSidebar}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = theme.colors.light;
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        Fermer le menu
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="main-content">
                        {/* Overlay pour fermer la sidebar sur mobile quand elle est ouverte */}
                        {isMobile && sidebarOpen && (
                            <div
                                className="sidebar-overlay"
                                onClick={toggleSidebar}
                            ></div>
                        )}
                        
                        {/* Composant Page pour afficher le contenu sélectionné */}
                        <div 
                            className="page-container"
                            style={{ 
                                boxShadow: theme.shadows.card,
                                borderRadius: theme.borderRadius.default
                            }}
                        >
                            <Page
                                content={content}
                                onNext={handleNext}
                                onPrevious={handlePrevious}
                                isFirstPage={currentPage === 1}
                                isLastPage={currentPage === contentPages.length}
                                currentPage={currentPage}
                                totalPages={contentPages.length}
                                isMobile={isMobile}
                                theme={theme} // Passer le thème au composant Page
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Styles spécifiques pour ce composant */}
            <style>{`
                .prepa-page-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }
                
                .fixed-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                }
                
                .header-bar {
                    border-radius: ${theme.borderRadius.default};
                    margin: 0 auto 1px auto;
                    box-shadow: ${theme.shadows.card};
                }
                
                .main-content-area {
                    margin-top: ${isMobile ? '100px' : '120px'};
                    flex: 1;
                    overflow: hidden;
                    padding-bottom: 20px;
                }
                
                .content-wrapper {
                    display: flex;
                    height: 100%;
                    position: relative;
                }
                
                .sidebar-container {
                    background-color: white;
                    box-shadow: ${theme.shadows.card};
                    border-radius: ${theme.borderRadius.default};
                    overflow-y: auto;
                    max-height: 75vh;
                    transition: ${theme.transitions.default};
                }
                
                /* Styles pour mobile */
                @media (max-width: 767.98px) {
                    .sidebar-container {
                        position: fixed;
                        top: 100px;
                        left: 0;
                        width: 80%;
                        height: calc(100vh - 100px);
                        z-index: 1001;
                        transform: translateX(-100%);
                        max-height: none;
                    }
                    
                    .sidebar-container.open {
                        transform: translateX(0);
                    }
                    
                    .sidebar-overlay {
                        position: fixed;
                        top: 100px;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        z-index: 1000;
                    }
                    
                    .main-content {
                        width: 100%;
                    }
                }
                
                /* Styles pour desktop */
                @media (min-width: 768px) {
                    .sidebar-container {
                        width: 25%;
                        margin-right: 15px;
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
                
                .sidebar-content {
                    padding: 10px;
                }
                
                .page-container {
                    background-color: white;
                    border-radius: ${theme.borderRadius.default};
                    box-shadow: ${theme.shadows.card};
                    height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .content-display {
                    padding: ${isMobile ? '15px' : '25px'};
                    height: 100%;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }
                
                .content-header {
                    margin-bottom: 15px;
                }
                
                .content-body {
                    flex: 1;
                    overflow-y: auto;
                }
                
                .accordion-button:not(.collapsed) {
                    background-color: ${theme.colors.lightPrimary};
                    color: ${theme.colors.primary};
                }
                
                .list-group-item.active {
                    background-color: ${theme.colors.primary};
                    border-color: ${theme.colors.primary};
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
                
                .sidebar-container.open {
                    animation: slideIn 0.3s ease-out;
                }
                
                /* Styles pour le contenu */
                .content-container img {
                    max-width: 100%;
                    height: auto;
                }
                .content-container img {
                    max-width: 100%;
                    height: auto;
                    border-radius: ${theme.borderRadius.sm};
                }
                
                .content-container table {
                    max-width: 100%;
                    overflow-x: auto;
                    display: block;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                }
                
                .content-container table th,
                .content-container table td {
                    border: 1px solid ${theme.colors.border};
                    padding: 0.5rem;
                }
                
                .content-container table th {
                    background-color: ${theme.colors.lightPrimary};
                    color: ${theme.colors.primary};
                    font-weight: 600;
                }
                
                .content-container h1, 
                .content-container h2, 
                .content-container h3, 
                .content-container h4, 
                .content-container h5, 
                .content-container h6 {
                    color: ${theme.colors.primary};
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                }
                
                .content-container p {
                    line-height: 1.6;
                    margin-bottom: 1rem;
                    color: ${theme.colors.text};
                }
                
                .content-container ul, 
                .content-container ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                
                .content-container li {
                    margin-bottom: 0.5rem;
                }
                
                .content-container blockquote {
                    border-left: 4px solid ${theme.colors.primary};
                    padding-left: 1rem;
                    font-style: italic;
                    margin-left: 0;
                    margin-right: 0;
                    background-color: ${theme.colors.lightPrimary};
                    padding: 1rem;
                    border-radius: ${theme.borderRadius.sm};
                }
                
                .content-container code {
                    background-color: #f8f9fa;
                    padding: 0.2rem 0.4rem;
                    border-radius: ${theme.borderRadius.sm};
                    font-family: monospace;
                    font-size: 0.9em;
                }
                
                .content-container pre {
                    background-color: #f8f9fa;
                    padding: 1rem;
                    border-radius: ${theme.borderRadius.sm};
                    overflow-x: auto;
                    margin-bottom: 1rem;
                }
                
                .content-container pre code {
                    background-color: transparent;
                    padding: 0;
                }
                
                /* Styles responsifs pour le contenu */
                @media (max-width: 767.98px) {
                    .content-container h1 { font-size: 1.5rem; }
                    .content-container h2 { font-size: 1.3rem; }
                    .content-container h3 { font-size: 1.2rem; }
                    .content-container h4 { font-size: 1.1rem; }
                    .content-container p, .content-container li { font-size: 0.95rem; }
                    
                    .content-container blockquote {
                        padding: 0.75rem;
                    }
                    
                    .content-container pre {
                        padding: 0.75rem;
                    }
                }
                
                /* Styles pour les boutons de navigation */
                .navigation-buttons {
                    display: flex;
                    justify-content: space-between;
                    padding: 1rem;
                    border-top: 1px solid ${theme.colors.border};
                    background-color: ${theme.colors.light};
                }
                
                .navigation-buttons button {
                    transition: ${theme.transitions.default};
                    border-radius: ${theme.borderRadius.default};
                }
                
                .navigation-buttons button:hover:not(:disabled) {
                    transform: translateY(-2px);
                }
                
                /* Styles pour les indicateurs de page */
                .page-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: ${theme.colors.text};
                    font-size: 0.9rem;
                }
                
                /* Styles pour les titres de contenu */
                .content-title {
                    color: ${theme.colors.primary};
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid ${theme.colors.lightPrimary};
                }
            `}</style>
        </div>
    );
};

export default PrepaPage;
