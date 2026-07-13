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
  const [prepas, setPrepas] = useState([]);
  const [selectedPrepa, setSelectedPrepa] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOffline, setIsOffline] = useState(false);

  const { user } = useUserAuth();
  const { prepaId } = useParams();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowSidebar(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chargement des préparations
  useEffect(() => {
    const fetchPrepas = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const inscriptions = await getUserInscriptions(user.id);
        const activePrepas = inscriptions.filter(i => i.statut === 'active');
        setPrepas(activePrepas);
        const prepaToSelect = activePrepas.find(prepa => prepa.prepa_id?.toString() === prepaId) || activePrepas[0];
        if (prepaToSelect?.prepa_id) setSelectedPrepa(prepaToSelect.prepa_id);
        setLoading(false);
      } catch (error) {
        console.error("Firestore erreur, fallback cache:", error);
        setIsOffline(true);
        try {
          const offlineList = await getOfflinePrepasList();
          if (offlineList.length > 0) {
            const cached = offlineList.map(p => ({ prepa_id: p.prepaId, nom: p.nom, statut: 'active', date_expiration: p.expirationDate }));
            setPrepas(cached);
            const prepaToSelect = cached.find(prepa => prepa.prepa_id?.toString() === prepaId) || cached[0];
            if (prepaToSelect?.prepa_id) setSelectedPrepa(prepaToSelect.prepa_id);
            toast.info("Mode hors-ligne : chargement depuis le cache");
          } else {
            setError("Aucune préparation disponible hors-ligne. Sauvegardez-la d'abord depuis le dashboard.");
          }
        } catch {
          setError("Impossible de charger vos préparations.");
        }
        setLoading(false);
      }
    };
    fetchPrepas();
  }, [user, prepaId]);

  // Chargement des disciplines
  useEffect(() => {
    const fetchDisciplines = async () => {
      if (!selectedPrepa) return;
      try {
        setLoading(true);
        const disciplinesData = await getDisciplinesByPrepa(selectedPrepa);
        setDisciplines(disciplinesData);
        setLoading(false);
      } catch (error) {
        console.error("Firestore erreur disciplines, fallback cache:", error);
        setIsOffline(true);
        const cachedData = await getOfflinePrepa(selectedPrepa);
        if (cachedData?.disciplines) {
          setDisciplines(cachedData.disciplines);
          toast.info("Mode hors-ligne : disciplines chargées depuis le cache");
        } else {
          setDisciplines([]);
          setError("Cette préparation n'est pas disponible hors-ligne. Sauvegardez-la d'abord.");
        }
        setLoading(false);
      }
    };
    if (selectedPrepa) fetchDisciplines();
  }, [selectedPrepa]);

  const handlePrepaClick = (prepaId) => {
    setSelectedPrepa(prepaId);
    if (isMobile) setShowSidebar(false);
  };

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const renderMainContent = () => (
    <div className={`col-md-9 ${isMobile ? 'col-12' : ''}`}>
      <div className="d-flex align-items-center p-3 bg-white border rounded mb-3" style={{ boxShadow: theme.shadows.card, justifyContent: 'center' }}>
        <h6 className="mb-0" style={{ color: theme.colors.dark, fontWeight: 600 }}>Disciplines</h6>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status" style={{ color: theme.colors.primary }}>
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" style={{ borderColor: theme.colors.primary, backgroundColor: '#fff0f3' }}>{error}</div>
      ) : disciplines.length === 0 ? (
        <div className="alert alert-info" style={{ borderColor: theme.colors.secondary, backgroundColor: '#e6f4ff' }}>Aucune discipline disponible.</div>
      ) : (
        <div className="p-2 p-md-4" style={{ height: isMobile ? 'auto' : '74vh', overflow: 'auto' }}>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            {disciplines.map(discipline => (
              <div className="col" key={discipline.id}>
                <DisciplineCard discipline={discipline} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSidebar = () => (
    <div className={`col-md-3 ${isMobile ? 'position-fixed sidebar' : ''}`} style={isMobile ? {
      top: '56px', left: showSidebar ? '0' : '-100%', height: 'calc(100vh - 56px)', width: '80%', maxWidth: '300px',
      zIndex: 1030, backgroundColor: '#fff', transition: 'all 0.3s ease',
      boxShadow: showSidebar ? '0 10px 20px rgba(0,0,0,0.15)' : 'none', overflowY: 'auto'
    } : {}}>
      <div className="d-flex justify-content-between align-items-center p-3">
        <Link to="/user/dashboard" className="btn btn-sm" style={{ backgroundColor: theme.colors.primary, color: 'white', borderRadius: '8px', border: 'none' }}>
          <MdArrowBack className="me-1" /> Retour
        </Link>
        {isMobile && <button className="btn-close" onClick={() => setShowSidebar(false)}></button>}
      </div>
      <div className="d-flex flex-column p-3">
        <h6 className="text-center border-bottom pb-3" style={{ color: theme.colors.secondary, fontWeight: 600 }}>Préparations en cours</h6>
        {loading ? (
          <div className="d-flex justify-content-center my-3">
            <div className="spinner-border spinner-border-sm" role="status" style={{ color: theme.colors.secondary }}></div>
          </div>
        ) : prepas.length === 0 ? (
          <div className="alert alert-info mt-3">Aucune préparation active.</div>
        ) : (
          prepas.map(prepa => (
            <PrepaBtn key={prepa.prepa_id} prepa={prepa} isSelected={selectedPrepa === prepa.prepa_id} onClick={() => handlePrepaClick(prepa.prepa_id)} />
          ))
        )}
      </div>
    </div>
  );

  const renderOverlay = () => (isMobile && showSidebar && (
    <div className="position-fixed" style={{ top: '56px', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1025 }} onClick={() => setShowSidebar(false)} />
  ));

  return (
    <>
      <div className="fixed-top"><NavbarApp /></div>
      {renderOverlay()}

      {isMobile && (
        <button onClick={toggleSidebar} style={{
          position: 'fixed', top: '70px', left: '12px', zIndex: 1020,
          backgroundColor: theme.colors.primary, color: 'white', border: 'none',
          borderRadius: '50%', width: '44px', height: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(190, 0, 80, 0.3)', cursor: 'pointer'
        }} aria-label="Menu">
          <MdMenu size={24} />
        </button>
      )}

      <div className="container-fluid" style={{ marginTop: '76px', paddingBottom: '20px', backgroundColor: theme.colors.light, fontFamily: theme.fonts.primary }}>
        <div className="row">
          {!isMobile && renderSidebar()}
          {renderMainContent()}
          {isMobile && renderSidebar()}
        </div>
      </div>

      <style>{`@media (max-width: 767.98px) { .sidebar { padding: 0; } }`}</style>
    </>
  );
};

export default DisciplinesView;