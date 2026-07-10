import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import DisciplineCard from '../Composants/DisciplinesView/DisciplineCard';
import PrepaBtn from '../Composants/DisciplinesView/PrepaBtn';
import { useUserAuth } from '../contexts/useUserAuth';
import { MdArrowBack, MdMenu, MdClass, MdBook, MdSchool } from 'react-icons/md';
import { getUserInscriptions, getDisciplinesByPrepa } from '../services/firestoreService';
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
        console.error("Erreur:", error);
        setError("Impossible de charger vos préparations.");
        setLoading(false);
        toast.error("Erreur de chargement");
      }
    };
    fetchPrepas();
  }, [user, prepaId]);

  useEffect(() => {
    const fetchDisciplines = async () => {
      if (!selectedPrepa) return;
      try {
        setLoading(true);
        const data = await getDisciplinesByPrepa(selectedPrepa);
        setDisciplines(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur disciplines:", error);
        setError("Impossible de charger les disciplines.");
        setLoading(false);
      }
    };
    fetchDisciplines();
  }, [selectedPrepa]);

  const handleSelect = (prepaId) => {
    setSelectedPrepa(prepaId);
    if (isMobile) setShowSidebar(false);
  };

  return (
    <>
      <NavbarApp />
      <div style={{ marginTop: '56px', minHeight: 'calc(100vh - 56px)', backgroundColor: '#f5f6fa' }}>
        
        {/* OVERLAY MOBILE */}
        {showSidebar && isMobile && (
          <div onClick={() => setShowSidebar(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1025, backdropFilter: 'blur(2px)' }} />
        )}

        <div className="container-fluid py-3">
          <div className="row g-4">
            
            {/* SIDEBAR - Liste des prépas */}
            {isMobile ? (
              <div style={{
                position: 'fixed', top: '56px', left: 0, width: '280px',
                height: 'calc(100vh - 56px)', background: '#fff', zIndex: 1030,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease', overflowY: 'auto', padding: '16px',
              }}>
                <h6 style={{ color: theme.colors.secondary, fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdClass /> Mes préparations
                </h6>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm" style={{ color: theme.colors.primary }} />
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {prepas.map(prepa => (
                      <PrepaBtn
                        key={prepa.id}
                        prepa={prepa}
                        isSelected={String(prepa.prepa_id) === String(selectedPrepa)}
                        onClick={() => handleSelect(prepa.prepa_id)}
                      />
                    ))}
                    {prepas.length === 0 && (
                      <p className="text-muted small text-center py-3">Aucune préparation active</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="col-lg-3">
                <div className="bg-white rounded-4 p-3" style={{ minHeight: 'calc(100vh - 80px)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h6 style={{ color: theme.colors.secondary, fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdClass /> Mes préparations
                  </h6>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm" style={{ color: theme.colors.primary }} />
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {prepas.map(prepa => (
                        <PrepaBtn key={prepa.id} prepa={prepa} isSelected={String(prepa.prepa_id) === String(selectedPrepa)} onClick={() => handleSelect(prepa.prepa_id)} />
                      ))}
                      {prepas.length === 0 && <p className="text-muted small text-center py-3">Aucune préparation active</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONTENU PRINCIPAL - Disciplines */}
            <div className={`${isMobile ? 'col-12' : 'col-lg-9'}`}>
              <div className="bg-white rounded-4 p-4" style={{ minHeight: 'calc(100vh - 80px)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    {isMobile && (
                      <button onClick={() => setShowSidebar(true)}
                        className="btn btn-sm me-2"
                        style={{ background: `${theme.colors.primary}10`, color: theme.colors.primary, borderRadius: '10px' }}>
                        <MdMenu size={20} />
                      </button>
                    )}
                    <h5 className="fw-bold mb-0" style={{ color: '#1a1a2e', display: 'inline' }}>
                      <MdBook style={{ color: theme.colors.primary, marginRight: '8px' }} />
                      Disciplines
                    </h5>
                  </div>
                  <Link to="/user/dashboard"
                    className="btn d-inline-flex align-items-center gap-1"
                    style={{
                      background: 'transparent', color: theme.colors.primary,
                      border: `1.5px solid ${theme.colors.primary}`, borderRadius: '50px',
                      padding: '6px 16px', fontWeight: 500, fontSize: '0.85rem',
                    }}>
                    <MdArrowBack /> Retour
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status" style={{ color: theme.colors.primary, width: '2.5rem', height: '2.5rem' }}>
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : disciplines.length === 0 ? (
                  <div className="text-center py-5" style={{ color: '#6c757d' }}>
                    <MdSchool style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '12px' }} />
                    <p>Aucune discipline disponible pour cette préparation.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {disciplines.map(discipline => (
                      <div key={discipline.id} className="col-md-6 col-lg-4">
                        <DisciplineCard discipline={discipline} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DisciplinesView;