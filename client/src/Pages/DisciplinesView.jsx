import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import DisciplineCard from '../Composants/DisciplinesView/DisciplineCard';
import PrepaBtn from '../Composants/DisciplinesView/PrepaBtn';
import { useUserAuth } from '../contexts/useUserAuth';
import { MdArrowBack, MdMenu } from 'react-icons/md';
import { getUserInscriptions, getDisciplinesByPrepa } from '../services/firestoreService';
import { getOfflinePrepa, getOfflinePrepasList } from '../services/offlineCache';
import { toast } from 'react-toastify';
import theme from '../utils/theme';

const DisciplinesView = () => {
  // États
  const [prepas, setPrepas] = useState([]);
  const [selectedPrepa, setSelectedPrepa] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Récupération du contexte d'authentification de l'utilisateur
  const { user } = useUserAuth();
  // Récupération de l'identifiant de la préparation depuis l'URL
  const { prepaId } = useParams();

  // Détection de la taille de l'écran et de l'état de la connexion
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(false);
      }
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Effet pour récupérer les préparations de l'utilisateur
  useEffect(() => {
    const fetchPrepas = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);

        if (isOffline) {
          // Mode hors-ligne : charger depuis le cache
          const offlinePrepasList = await getOfflinePrepasList();
          if (offlinePrepasList.length > 0) {
            // Construire des inscriptions factices à partir du cache
            const cachedPrepas = offlinePrepasList.map(p => ({
              prepa_id: p.prepaId,
              nom: p.nom,
              statut: 'active',
              date_expiration: p.expirationDate
            }));
            setPrepas(cachedPrepas);
            const prepaToSelect = cachedPrepas.find(prepa => prepa.prepa_id?.toString() === prepaId) || cachedPrepas[0];
            if (prepaToSelect?.prepa_id) {
              setSelectedPrepa(prepaToSelect.prepa_id);
            }
          } else {
            setError("Aucune préparation disponible hors-ligne. Connectez-vous à Internet pour télécharger vos prépas.");
          }
          setLoading(false);
          return;
        }

        // Mode en ligne : charger depuis Firestore
        const inscriptions = await getUserInscriptions(user.id);
        const activePrepas = inscriptions.filter(i => i.statut === 'active');
        setPrepas(activePrepas);

        const prepaToSelect = activePrepas.find(prepa => prepa.prepa_id?.toString() === prepaId) || activePrepas[0];
        if (prepaToSelect?.prepa_id) {
          setSelectedPrepa(prepaToSelect.prepa_id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des préparations:", error);
        // Fallback vers le cache si Firestore échoue
        try {
          const offlinePrepasList = await getOfflinePrepasList();
          if (offlinePrepasList.length > 0) {
            const cachedPrepas = offlinePrepasList.map(p => ({
              prepa_id: p.prepaId,
              nom: p.nom,
              statut: 'active',
              date_expiration: p.expirationDate
            }));
            setPrepas(cachedPrepas);
            const prepaToSelect = cachedPrepas.find(prepa => prepa.prepa_id?.toString() === prepaId) || cachedPrepas[0];
            if (prepaToSelect?.prepa_id) {
              setSelectedPrepa(prepaToSelect.prepa_id);
            }
            toast.info("Mode hors-ligne : chargement depuis le cache");
          } else {
            setError("Impossible de charger vos préparations. Veuillez réessayer plus tard.");
            toast.error("Erreur lors du chargement des préparations");
          }
        } catch {
          setError("Impossible de charger vos préparations. Veuillez réessayer plus tard.");
          toast.error("Erreur lors du chargement des préparations");
        }
        setLoading(false);
      }
    };

    fetchPrepas();
  }, [user, prepaId, isOffline]);

  // Effet pour récupérer les disciplines de la préparation sélectionnée
  useEffect(() => {
    const fetchDisciplines = async () => {
      if (!selectedPrepa) return;
      try {
        setLoading(true);

        if (isOffline) {
          // Mode hors-ligne : charger depuis le cache
          const cachedData = await getOfflinePrepa(selectedPrepa);
          if (cachedData?.disciplines) {
            setDisciplines(cachedData.disciplines);
          } else {
            setDisciplines([]);
            setError("Cette préparation n'est pas disponible hors-ligne.");
          }
          setLoading(false);
          return;
        }

        // Mode en ligne : charger depuis Firestore
        const disciplinesData = await getDisciplinesByPrepa(selectedPrepa);
        setDisciplines(disciplinesData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des disciplines:", error);
        // Fallback vers le cache
        const cachedData = await getOfflinePrepa(selectedPrepa);
        if (cachedData?.disciplines) {
          setDisciplines(cachedData.disciplines);
          toast.info("Mode hors-ligne : disciplines chargées depuis le cache");
        } else {
          setDisciplines([]);
          setError("Impossible de charger les disciplines.");
        }
        setLoading(false);
      }
    };

    if (selectedPrepa) {
      fetchDisciplines();
    }
  }, [selectedPrepa, isOffline]);

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
        >
          <MdArrowBack className="me-1" /> Retour
        </Link>
        {isMobile && (
          <button
            className="btn-close"
            onClick={() => setShowSidebar(false)}
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

      {/* Bouton hamburger pour ouvrir la sidebar sur mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: '70px',
            left: '12px',
            zIndex: 1020,
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(190, 0, 80, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          aria-label="Menu préparations"
        >
          <MdMenu size={24} />
        </button>
      )}

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