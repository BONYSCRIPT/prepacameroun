import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap';
import { useState, useMemo, useRef, useDeferredValue, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  MdClass, MdClose, MdSearch, MdCheckCircle, MdMenu, 
  MdKeyboardArrowLeft, MdKeyboardArrowRight 
} from 'react-icons/md';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import NavbarApp from '../Composants/Dashboard/NavbarApp';
import MyPrepaCard from '../Composants/Dashboard/MyPrepaCard';
import Validite from '../Composants/Dashboard/Validite';
import Vide from '../Composants/Dashboard/Vide';
import MemoizedCard from '../Composants/Dashboard/Prepas/Card';
import useDeviceSize from '../hooks/useDeviceSize';
import { getPublishedPrepas, getUserInscriptions } from '../services/firestoreService';
import theme from '../utils/theme.jsx';
import { useUserAuth } from '../contexts/useUserAuth';

// ──────────────────────────────────────────────
// PAGINATION
// ──────────────────────────────────────────────
const PaginationComponent = ({ totalItems, itemsPerPage, currentPage, onPageChange, isDesktop }) => {
  if (totalItems <= itemsPerPage) return null;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <nav className="mt-4 d-flex justify-content-center">
      <ul className={`pagination ${!isDesktop ? 'pagination-sm' : ''} mb-0`}>
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ color: theme.colors.primary, borderRadius: '8px 0 0 8px' }}>
            <MdKeyboardArrowLeft />
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
          <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
            <button onClick={() => onPageChange(num)}
              className="page-link"
              style={currentPage === num ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, color: '#fff' } : { color: theme.colors.primary }}>
              {num}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ color: theme.colors.primary, borderRadius: '0 8px 8px 0' }}>
            <MdKeyboardArrowRight />
          </button>
        </li>
      </ul>
    </nav>
  );
};

// ──────────────────────────────────────────────
// SPINNER
// ──────────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="text-center py-5">
    <div className="spinner-border" role="status" style={{ color: theme.colors.primary, width: '2.5rem', height: '2.5rem' }}>
      <span className="visually-hidden">Chargement...</span>
    </div>
  </div>
);

// ──────────────────────────────────────────────
// LISTE DES PRÉPAS DISPONIBLES
// ──────────────────────────────────────────────
const PrepasList = ({
  prepas, loading, error, searchTerm, setSearchTerm,
  searchInputRef, isSearching, userPrepasData, queryClient,
  filteredPrepasLength, prepasDataLength,
  prepasPerPage, currentPage, paginate, isDesktop
}) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger mx-3">{error}</div>;

  return (
    <>
      {/* Barre de recherche */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <MdSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: '1.2rem', zIndex: 2 }} />
        <input
          type="text"
          placeholder="Rechercher une préparation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          ref={searchInputRef}
          style={{
            width: '100%',
            padding: '12px 16px 12px 44px',
            border: '1.5px solid #e9ecef',
            borderRadius: '14px',
            fontSize: '0.95rem',
            background: 'white',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.primary;
            e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}15`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e9ecef';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
        />
      </div>

      {prepas.length === 0 ? (
        <div className="text-center py-5" style={{ color: '#6c757d' }}>
          <MdSearch style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '12px' }} />
          <p className="mb-0">
            {isSearching ? "Aucune préparation ne correspond." : "Aucune préparation pour le moment."}
          </p>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {prepas.map(prepa => (
              <div key={prepa.id} className="col-12">
                <MemoizedCard
                  id={prepa.id}
                  image={prepa.image_url}
                  titre={prepa.nom}
                  prix={prepa.prix}
                  description={prepa.description}
                  theme={theme}
                  isInscribed={userPrepasData.some(up => String(up.prepa_id) === String(prepa.id))}
                  onPaymentSuccess={() => queryClient.invalidateQueries({ queryKey: ['userPrepas'] })}
                />
              </div>
            ))}
          </div>

          <PaginationComponent
            totalItems={isSearching ? filteredPrepasLength : prepasDataLength}
            itemsPerPage={prepasPerPage}
            currentPage={currentPage}
            onPageChange={paginate}
            isDesktop={isDesktop}
          />
        </>
      )}
    </>
  );
};

// ──────────────────────────────────────────────
// LISTE MES PRÉPAS
// ──────────────────────────────────────────────
const UserPrepasList = ({ userPrepas, loading, onSelect }) => {
  if (loading) return <p className="text-muted text-center py-3">Chargement...</p>;
  if (userPrepas.length === 0) return <Vide message="Aucune préparation" />;

  return (
    <div className="d-flex flex-column gap-2">
      {userPrepas.map(inscription => (
        <MyPrepaCard
          key={inscription.id}
          inscription={inscription}
          onClick={() => onSelect(inscription)}
        />
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────
// DASHBOARD PRINCIPAL
// ──────────────────────────────────────────────
const Dashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useUserAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrepa, setSelectedPrepa] = useState(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const { isDesktop } = useDeviceSize();
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const isSearching = !!deferredSearchTerm.trim();

  const prepasPerPage = isDesktop ? 10 : 5;
  const location = useLocation();
  const searchInputRef = useRef(null);

  // Fermer les panneaux latéraux si desktop
  useEffect(() => {
    if (isDesktop) { setLeftOpen(false); setRightOpen(false); }
  }, [isDesktop]);

  // Requêtes
  const { data: prepasData = [], isLoading: loadingPrepas, error: errorPrepas } = useQuery({
    queryKey: ['prepas', 'published'],
    queryFn: getPublishedPrepas
  });

  const { data: userPrepasData = [], isLoading: loadingUserPrepas } = useQuery({
    queryKey: ['userPrepas', user?.id],
    queryFn: async () => (user?.id ? await getUserInscriptions(user.id) : []),
    enabled: !!user?.id
  });

  const isLoadingGlobal = loadingPrepas || loadingUserPrepas;
  const globalError = errorPrepas ? 'Erreur de chargement' : null;

  // Rafraîchissement après paiement
  useEffect(() => {
    const handlePayment = async () => {
      toast.success('Inscription activée !');
      await queryClient.refetchQueries({ queryKey: ['userPrepas'] });
    };
    window.addEventListener('payment_success', handlePayment);
    window.addEventListener('refreshInscriptions', handlePayment);
    return () => {
      window.removeEventListener('payment_success', handlePayment);
      window.removeEventListener('refreshInscriptions', handlePayment);
    };
  }, [queryClient]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment_status') === 'success') {
      queryClient.invalidateQueries({ queryKey: ['userPrepas'] });
    }
  }, [location, queryClient]);

  // Filtrage + pagination
  const filteredPrepas = useMemo(() => {
    if (!Array.isArray(prepasData)) return [];
    if (!deferredSearchTerm.trim()) return prepasData;
    const term = deferredSearchTerm.toLowerCase().trim();
    return prepasData.filter(p =>
      p.nom.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
  }, [deferredSearchTerm, prepasData]);

  const currentPrepas = useMemo(() => {
    if (!Array.isArray(filteredPrepas)) return [];
    const idxLast = currentPage * prepasPerPage;
    return filteredPrepas.slice(idxLast - prepasPerPage, idxLast);
  }, [filteredPrepas, currentPage, prepasPerPage]);

  const paginate = (n) => setCurrentPage(n);

  const handleSelect = (p) => {
    setSelectedPrepa(p);
    if (!isDesktop) { setLeftOpen(false); setRightOpen(true); }
  };

  // ────────────────────────────────────────────
  // RENDU
  // ────────────────────────────────────────────
  return (
    <>
      <div className="fixed-top" style={{ zIndex: 1050 }}>
        <NavbarApp />
      </div>

      <div style={{ marginTop: '56px', minHeight: 'calc(100vh - 56px)', backgroundColor: '#f5f6fa' }}>
        
        {/* OVERLAY MOBILE */}
        {(leftOpen || rightOpen) && !isDesktop && (
          <div
            onClick={() => { setLeftOpen(false); setRightOpen(false); }}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 1025, backdropFilter: 'blur(2px)',
            }}
          />
        )}

        {/* BOUTONS FLOTTANTS MOBILE */}
        {!isDesktop && (
          <>
            <button onClick={() => setLeftOpen(o => !o)}
              style={{
                position: 'fixed', bottom: '20px', left: '20px', zIndex: 1040,
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'white', border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: theme.colors.secondary, fontSize: '1.4rem',
              }}>
              <MdClass />
            </button>
            <button onClick={() => setRightOpen(o => !o)}
              style={{
                position: 'fixed', bottom: '20px', right: '20px', zIndex: 1040,
                width: '52px', height: '52px', borderRadius: '50%',
                background: theme.colors.primary, border: 'none',
                boxShadow: `0 4px 16px ${theme.colors.primary}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.4rem',
              }}>
              <MdCheckCircle />
            </button>
          </>
        )}

        {/* PANEL GAUCHE - MES PRÉPAS */}
        <Panel position="left" isOpen={leftOpen} isDesktop={isDesktop} onClose={() => setLeftOpen(false)}>
          <div className="text-center mb-3">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '50px',
              background: `${theme.colors.secondary}10`, color: theme.colors.secondary,
              fontWeight: 600, fontSize: '0.9rem',
            }}>
              <MdClass /> Mes prépas
            </div>
          </div>
          <UserPrepasList
            userPrepas={userPrepasData}
            loading={isLoadingGlobal}
            onSelect={handleSelect}
          />
        </Panel>

        {/* PANEL DROIT - VALIDITÉS */}
        <Panel position="right" isOpen={rightOpen} isDesktop={isDesktop} onClose={() => setRightOpen(false)}>
          <div className="text-center mb-3">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '50px',
              background: `${theme.colors.primary}10`, color: theme.colors.primary,
              fontWeight: 600, fontSize: '0.9rem',
            }}>
              <MdCheckCircle /> Validités
            </div>
          </div>
          <Validite
            userPrepas={userPrepasData}
            selectedPrepa={selectedPrepa}
            onPrepaSelect={handleSelect}
          />
        </Panel>

        {/* CONTENU PRINCIPAL */}
        <div className={`container-fluid py-3 ${isDesktop ? 'px-4' : 'px-3'}`}>
          {isDesktop ? (
            <div className="row g-4">
              {/* Sidebar gauche desktop */}
              <div className="col-lg-3">
                <div className="bg-white rounded-4 p-3" style={{ minHeight: 'calc(100vh - 80px)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="text-center mb-3">
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '6px 16px', borderRadius: '50px',
                      background: `${theme.colors.secondary}10`, color: theme.colors.secondary,
                      fontWeight: 600,
                    }}>
                      <MdClass /> Mes prépas
                    </div>
                  </div>
                  <UserPrepasList userPrepas={userPrepasData} loading={isLoadingGlobal} onSelect={handleSelect} />
                </div>
              </div>

              {/* Colonne centrale */}
              <div className="col-lg-6">
                <div className="bg-white rounded-4 p-4" style={{ minHeight: 'calc(100vh - 80px)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <PrepasList prepas={currentPrepas} loading={isLoadingGlobal} error={globalError}
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchInputRef={searchInputRef}
                    isSearching={isSearching} userPrepasData={userPrepasData} queryClient={queryClient}
                    filteredPrepasLength={filteredPrepas.length} prepasDataLength={prepasData.length}
                    prepasPerPage={prepasPerPage} currentPage={currentPage} paginate={paginate} isDesktop={isDesktop} />
                </div>
              </div>

              {/* Sidebar droite desktop */}
              <div className="col-lg-3">
                <div className="bg-white rounded-4 p-3" style={{ minHeight: 'calc(100vh - 80px)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="text-center mb-3">
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '6px 16px', borderRadius: '50px',
                      background: `${theme.colors.primary}10`, color: theme.colors.primary,
                      fontWeight: 600,
                    }}>
                      <MdCheckCircle /> Validités
                    </div>
                  </div>
                  <Validite userPrepas={userPrepasData} selectedPrepa={selectedPrepa} onPrepaSelect={handleSelect} />
                </div>
              </div>
            </div>
          ) : (
            /* Mobile : colonne unique */
            <div className="bg-white rounded-4 p-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <PrepasList prepas={currentPrepas} loading={isLoadingGlobal} error={globalError}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchInputRef={searchInputRef}
                isSearching={isSearching} userPrepasData={userPrepasData} queryClient={queryClient}
                filteredPrepasLength={filteredPrepas.length} prepasDataLength={prepasData.length}
                prepasPerPage={prepasPerPage} currentPage={currentPage} paginate={paginate} isDesktop={isDesktop} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ──────────────────────────────────────────────
// COMPOSANT PANEL RÉUTILISABLE (mobile)
// ──────────────────────────────────────────────
const Panel = ({ position, isOpen, isDesktop, onClose, children }) => {
  if (isDesktop) return null;
  const isLeft = position === 'left';
  const panelStyle = {
    position: 'fixed',
    top: '56px',
    [isLeft ? 'left' : 'right']: 0,
    width: '280px',
    height: 'calc(100vh - 56px)',
    backgroundColor: '#fff',
    zIndex: 1030,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    transition: 'transform 0.3s ease',
    transform: isOpen ? 'translateX(0)' : `translateX(${isLeft ? '-100%' : '100%'})`,
    overflowY: 'auto',
    padding: '16px',
  };

  return (
    <div style={panelStyle}>
      <button onClick={onClose}
        style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'none', border: 'none', fontSize: '1.4rem',
          color: '#6c757d', cursor: 'pointer',
        }}>
        <MdClose />
      </button>
      {children}
    </div>
  );
};

export default Dashboard;