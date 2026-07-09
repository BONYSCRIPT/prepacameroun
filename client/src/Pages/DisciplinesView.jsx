import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import DisciplineCard from '../Composants/DisciplinesView/DisciplineCard';
import PrepaBtn from '../Composants/DisciplinesView/PrepaBtn';
import { useUserAuth } from '../contexts/useUserAuth';
import { MdArrowBack, MdMenu } from 'react-icons/md';
import { getUserInscriptions, getDisciplinesByPrepa } from '../services/firestoreService';
import { toast } from 'react-toastify';
import theme from '../utils/theme'; // Importer le thème

const DisciplinesView = () => {
  // États
  const [prepas, setPrepas] = useState([]);
  const [selectedPrepa, setSelectedPrepa] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Récupération du contexte d'authentification de l'utilisateur
  const { user } = useUserAuth();
  // Récupération de l'identifiant de la préparation depuis l'URL
  const { prepaId } = useParams();

  // Détection de la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effet pour récupérer les préparations de l'utilisateur
  useEffect(() => {
    const fetchPrepas = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const inscriptions = await getUserInscriptions();
        // Filtrer les inscriptions actives
        const activePrepas = inscriptions.filter(i => i.statut === 'active');
        setPrepas(activePrepas);

        // Sélectionner la préparation correspondant à l'identifiant de l'URL
        const prepaToSelect = activePrepas.find(prepa => prepa.prepa_id?.toString() === prepaId) || activePrepas[0];
        if (prepaToSelect?.prepa_id) {
          setSelectedPrepa(prepaToSelect.prepa_id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des préparations:", error);
        setError("Impossible de charger vos préparations. Veuillez réessayer plus tard.");
        setLoading(false);
        toast.error("Erreur lors du chargement des préparations");
      }
    };

    fetchPrepas();
  }, [user, prepaId]);

  // Effet pour récupérer les disciplines de la préparation sélectionnée
  useEffect(() => {
    const fetchDisciplines = async () => {
      if (selectedPrepa) {
        try {
          setLoading(true);
          const disciplinesData = await getDisciplinesByPrepa(selectedPrepa);
          setDisciplines(disciplinesData);
          setLoading(false);
        } catch (error) {
          console.error("Erreur lors de la récupération des disciplines:", error);
          setDisciplines([]);
          setError("Impossible de charger les disciplines. Veuillez réessayer plus tard.");
          setLoading(false);
          toast.error("Erreur lors du chargement des disciplines");
        }
      }
    };

    fetchDisciplines();
  }, [selectedPrepa]);

  // Fonction pour gérer le clic sur un bouton de préparation
  const handlePrepaClick = (prepaId) => {
    setSelectedPrepa(prepaId);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  // Fonction pour basculer l'affichage de la barre latérale sur mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Rendu du contenu principal
  const renderMainContent = () => (
    <div className={`col-md-9 ${isMobile ? 'col-12' : ''}`}>
      <div className="d-flex justify-content-between align-items-center p-3 bg-white border rounded mb-3"
        style={{ boxShadow: theme.shadows.card }}>
        <h6 className="mb-0" style={{ color: theme.colors.dark, fontWeight: 600 }}>Disciplines</h6>
        {isMobile && (
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: theme.colors.secondary,
              color: 'white',
              borderRadius: theme.borderRadius.default,
              transition: theme.transitions.default,
              boxShadow: theme.shadows.button
            }}
            onClick={toggleSidebar}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.secondaryDark;
              e.currentTarget.style.boxShadow = theme.shadows.buttonHover;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.secondary;
              e.currentTarget.style.boxShadow = theme.shadows.button;
            }}
          >
            <MdMenu className="me-1" /> Préparations
          </button>
        )}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status" style={{ color: theme.colors.primary }}>
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" style={{ borderColor: theme.colors.primary, backgroundColor: '#fff0f3' }}>
          {error}
        </div>
      ) : disciplines.length === 0 ? (
        <div className="alert alert-info" style={{ borderColor: theme.colors.secondary, backgroundColor: '#e6f4ff' }}>
          Aucune discipline disponible pour cette préparation.
        </div>
      ) : (
        <div className="p-2 p-md-4" style={{ height: isMobile ? 'auto' : '74vh', overflow: 'auto' }}>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            {Array.isArray(disciplines) && disciplines.map(discipline => (
              <div className="col" key={discipline.id}>
                <DisciplineCard
                  discipline={discipline}
                  style={{
                    transition: theme.transitions.default,
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Rendu de la barre latérale
  const renderSidebar = () => (
    <div className={`col-md-3 ${isMobile ? 'position-fixed sidebar' : ''}`}
      style={isMobile ? {
        top: '56px',
        left: showSidebar ? '0' : '-100%',
        height: 'calc(100vh - 56px)',
        width: '80%',
        maxWidth: '300px',
        zIndex: 1030,
        backgroundColor: '#fff',
        transition: theme.transitions.default,
        boxShadow: showSidebar ? theme.shadows.cardHover : 'none',
        overflowY: 'auto'
      } : {}}>
      <div className="d-flex justify-content-between align-items-center p-3">
        <Link
          to="/user/dashboard"
          className="btn btn-sm"
          style={{
            backgroundColor: theme.colors.primary,
            color: 'white',
            borderRadius: theme.borderRadius.default,
            transition: theme.transitions.default,
            boxShadow: theme.shadows.button,
            border: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primaryDark;
            e.currentTarget.style.boxShadow = theme.shadows.buttonHover;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary;
            e.currentTarget.style.boxShadow = theme.shadows.button;
          }}
        >
          <MdArrowBack className="me-1" /> Retour
        </Link>
        {isMobile && (
          <button
            className="btn-close"
            onClick={() => setShowSidebar(false)}
            style={{ transition: theme.transitions.default }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          ></button>
        )}
      </div>

      <div className="d-flex flex-column p-3 bg-white border rounded mb-4"
        style={{
          height: isMobile ? 'auto' : '70vh',
          overflow: 'auto',
          boxShadow: theme.shadows.card
        }}>
        <h6 className="text-center border-bottom pb-3" style={{ color: theme.colors.secondary, fontWeight: 600 }}>
          Préparations en cours
        </h6>
        {loading ? (
          <div className="d-flex justify-content-center my-3">
            <div className="spinner-border spinner-border-sm" role="status" style={{ color: theme.colors.secondary }}>
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : prepas.length === 0 ? (
          <div className="alert alert-info mt-3" style={{ borderColor: theme.colors.secondary, backgroundColor: '#e6f4ff' }}>
            Aucune préparation active.
          </div>
        ) : (
          prepas.map(prepa => (
            <PrepaBtn
              key={prepa.prepa_id}
              prepa={prepa}
              isSelected={selectedPrepa === prepa.prepa_id}
              onClick={() => handlePrepaClick(prepa.prepa_id)}
            // Les couleurs seront gérées dans le composant PrepaBtn
            />
          ))
        )}
      </div>
    </div>
  );

  // Overlay pour fermer la sidebar sur mobile
  const renderOverlay = () => (
    isMobile && showSidebar && (
      <div
        className="position-fixed top-0 left-0 w-100 h-100"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1025,
          marginTop: '56px',
          transition: theme.transitions.default
        }}
        onClick={() => setShowSidebar(false)}
      />
    )
  );

  return (
    <>
      <div className="fixed-top">
        <NavbarApp />
      </div>

      {renderOverlay()}

      <div className="container-fluid" style={{
        marginTop: '76px',
        paddingBottom: '20px',
        backgroundColor: theme.colors.light,
        fontFamily: theme.fonts.primary
      }}>
        <div className="row">
          {!isMobile && renderSidebar()}
          {renderMainContent()}
          {isMobile && renderSidebar()}
        </div>
      </div>

      {/* CSS pour la version mobile */}
      <style>{`
        @media (max-width: 767.98px) {
          .sidebar {
            padding: 0;
          }
        }
      `}</style>
    </>
  );
};

export default DisciplinesView;
