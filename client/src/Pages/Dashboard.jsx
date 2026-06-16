import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap';
import { useState, useMemo, useRef, useDeferredValue, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdClass, MdClose, MdSearch, MdCheckCircle } from 'react-icons/md';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Composants
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import MyPrepaCard from '../Composants/Dashboard/MyPrepaCard';
import Validite from '../Composants/Dashboard/Validite';
import Vide from '../Composants/Dashboard/Vide';
import MemoizedCard from '../Composants/Dashboard/Prepas/Card';
import useDeviceSize from '../hooks/useDeviceSize';

// Services Firestore (remplace axios + backend Express)
import { getPublishedPrepas, getUserInscriptions } from '../services/firestoreService';
import theme from '../utils/theme.jsx';
import { useUserAuth } from '../contexts/useUserAuth';

// Styles mis ï¿½ jour avec le thï¿½me
const styles = {
  mainContainer: {
    marginTop: '56px',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 'calc(100vh - 56px)',
    backgroundColor: theme.colors.light, // Fond lï¿½gï¿½rement grisï¿½
    fontFamily: theme.fonts.primary
  },
  centerColumn: {
    height: 'calc(100vh - 56px)',
    overflowY: 'auto',
    paddingTop: '1rem'
  },
  iconStyle: {
    borderRadius: '50%',
    boxShadow: theme.shadows.card
  },
  sidebarLeft: {
    position: 'fixed',
    top: '56px',
    left: '0',
    width: '280px',
    height: 'calc(100vh - 56px)',
    backgroundColor: '#fff',
    zIndex: 1030,
    boxShadow: theme.shadows.card,
    transition: theme.transitions.default,
    overflowY: 'auto',
    paddingTop: '1rem'
  },
  sidebarRight: {
    position: 'fixed',
    top: '56px',
    right: '0',
    width: '280px',
    height: 'calc(100vh - 56px)',
    backgroundColor: '#fff',
    zIndex: 1030,
    boxShadow: theme.shadows.card,
    transition: theme.transitions.default,
    overflowY: 'auto',
    paddingTop: '1rem'
  },
  sidebarButton: {
    position: 'fixed',
    zIndex: 1040,
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: theme.shadows.button,
    border: 'none',
    cursor: 'pointer',
    transition: theme.transitions.default,
    // Repositionner les boutons en bas de l'ï¿½cran
    bottom: '20px',
  },
  leftButton: {
    left: '20px',
    backgroundColor: '#fff',
    color: theme.colors.secondary // Bleu pour les classes
  },
  rightButton: {
    right: '20px',
    backgroundColor: '#fff',
    color: theme.colors.primary // Rouge pour les validitï¿½s
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: theme.colors.dark,
    transition: theme.transitions.default
  },
  overlay: {
    position: 'fixed',
    top: '56px',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1025,
    display: 'none'
  },
  searchContainer: {
    marginBottom: '15px',
    position: 'relative',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    zIndex: 1010 // S'assurer que la barre de recherche est au-dessus du contenu
  },
  searchInput: {
    padding: '10px 15px 10px 40px',
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#aaa',
    fontSize: '1.2rem'
  }
};

// ============================================
// COMPOSANTS EXTRAITS POUR ÉVITER LES BOUCLES DE RENDU
// ============================================

const PaginationComponent = ({ totalItems, itemsPerPage, currentPage, onPageChange, isDesktop }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-3 d-flex justify-content-center">
      <ul className={`pagination ${!isDesktop ? 'pagination-sm' : ''}`}>
        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <button
              onClick={() => onPageChange(number)}
              className="page-link"
              style={currentPage === number ?
                { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } :
                {}
              }
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const LoadingSpinner = () => (
  <div className="text-center py-4">
    <div className="spinner-border" role="status" style={{ color: theme.colors.primary }}>
      <span className="visually-hidden">Chargement...</span>
    </div>
  </div>
);

const PrepasList = ({
  prepas,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  searchInputRef,
  isSearching,
  userPrepasData,
  queryClient,
  filteredPrepasLength,
  prepasDataLength,
  prepasPerPage,
  currentPage,
  paginate,
  isDesktop
}) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <div style={styles.searchContainer}>
        <MdSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Rechercher une préparation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          ref={searchInputRef}
          onFocus={(e) => {
            e.target.style.boxShadow = `0 0 0 3px rgba(190, 0, 80, 0.2)`;
            e.target.style.borderColor = theme.colors.primary;
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none';
            e.target.style.borderColor = '#e0e0e0';
          }}
        />
      </div>

      {prepas.length === 0 ? (
        <div className="alert alert-info">
          {isSearching
            ? "Aucune préparation ne correspond à votre recherche."
            : "Aucune préparation disponible pour le moment."}
        </div>
      ) : (
        <>
          {prepas.map(prepa => (
            <MemoizedCard
              key={prepa.id}
              id={prepa.id}
              image={prepa.image_url}
              titre={prepa.nom}
              prix={prepa.prix}
              description={prepa.description}
              theme={theme}
              isInscribed={userPrepasData.some(up => String(up.prepa_id) === String(prepa.id))}
              onPaymentSuccess={() => queryClient.invalidateQueries({ queryKey: ['userPrepas'] })}
            />
          ))}
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

const UserPrepasList = ({ userPrepas, loading, onSelect }) => {
  if (loading) return <p>Chargement...</p>;
  if (userPrepas.length === 0) return <Vide message="Aucune préparation" />;

  return userPrepas.map(inscription => (
    <MyPrepaCard
      key={inscription.id}
      inscription={inscription}
      onClick={() => onSelect(inscription)}
    />
  ));
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useUserAuth();

  // États locaux pour UI
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrepa, setSelectedPrepa] = useState(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const { isDesktop } = useDeviceSize();
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const isSearching = !!deferredSearchTerm.trim();

  const prepasPerPage = isDesktop ? 10 : 5;
  const location = useLocation();
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const searchInputRef = useRef(null);

  // Détection responsive centralisée
  useEffect(() => {
    if (isDesktop) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    }
  }, [isDesktop]);

  // Gestion de l'overlay
  useEffect(() => {
    if (overlayRef.current) {
      if (leftSidebarOpen || rightSidebarOpen) {
        overlayRef.current.style.display = 'block';
      } else {
        overlayRef.current.style.display = 'none';
      }
    }
  }, [leftSidebarOpen, rightSidebarOpen]);

  // React Query pour les préparations publiées (Firestore direct)
  const { data: prepasData = [], isLoading: loadingPrepas, error: errorPrepas } = useQuery({
    queryKey: ['prepas', 'published'],
    queryFn: getPublishedPrepas
  });

  // React Query pour les inscriptions de l'utilisateur (Firestore direct)
  const { data: userPrepasData = [], isLoading: loadingUserPrepas } = useQuery({
    queryKey: ['userPrepas', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getUserInscriptions(user.id);
    },
    enabled: !!user?.id
  });

  const isLoadingGlobal = loadingPrepas || loadingUserPrepas;
  const globalError = errorPrepas ? 'Erreur lors du chargement des données' : null;

  // ✅ Listener postMessage : rafraîchir automatiquement les inscriptions après paiement
  useEffect(() => {
    const handlePaymentSuccess = (event) => {
      if (event.data?.type === 'payment_success') {
        console.log('[Dashboard] Paiement confirmé, rechargement des inscriptions...');
        toast.success('🎉 Inscription activée avec succès !');
        queryClient.invalidateQueries({ queryKey: ['userPrepas'] });
      }
    };
    window.addEventListener('message', handlePaymentSuccess);
    return () => window.removeEventListener('message', handlePaymentSuccess);
  }, [queryClient]);

  // Rafraîchir après un paiement réussi via query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get('payment_status');
    if (paymentStatus === 'success') {
      queryClient.invalidateQueries({ queryKey: ['userPrepas'] });
    }
  }, [location, queryClient]);

  // Filtrer les préparations en fonction du terme de recherche
  const filteredPrepas = useMemo(() => {
    if (!Array.isArray(prepasData)) return [];

    if (!deferredSearchTerm.trim()) {
      return prepasData;
    }

    const term = deferredSearchTerm.toLowerCase().trim();
    return prepasData.filter(prepa =>
      prepa.nom.toLowerCase().includes(term) ||
      prepa.description.toLowerCase().includes(term)
    );
  }, [deferredSearchTerm, prepasData]);

  // Pagination
  const currentPrepas = useMemo(() => {
    if (!Array.isArray(filteredPrepas)) return [];

    const indexOfLastPrepa = currentPage * prepasPerPage;
    const indexOfFirstPrepa = indexOfLastPrepa - prepasPerPage;
    return filteredPrepas.slice(indexOfFirstPrepa, indexOfLastPrepa);
  }, [filteredPrepas, currentPage, prepasPerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrepaSelection = (prepa) => {
    setSelectedPrepa(prepa);
    if (!isDesktop) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(true);
    }
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
    if (rightSidebarOpen) setRightSidebarOpen(false);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
    if (leftSidebarOpen) setLeftSidebarOpen(false);
  };

  const closeAllSidebars = () => {
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
  };

  // Rendu du composant
  return (
    <>
      <div className="fixed-top">
        <NavbarApp />
      </div>

      <div className="container-fluid" style={styles.mainContainer}>
        {/* Overlay pour fermer les sidebars en cliquant à l'extérieur */}
        <div
          ref={overlayRef}
          style={styles.overlay}
          onClick={closeAllSidebars}
        ></div>

        {/* Boutons pour ouvrir les sidebars (visible uniquement sur mobile/tablette) */}
        {!isDesktop && (
          <>
            <button
              style={{ ...styles.sidebarButton, ...styles.leftButton }}
              onClick={toggleLeftSidebar}
              aria-label="Ouvrir mes préparations"
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = theme.shadows.buttonHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = theme.shadows.button;
              }}
            >
              <MdClass size={24} />
            </button>

            <button
              style={{ ...styles.sidebarButton, ...styles.rightButton }}
              onClick={toggleRightSidebar}
              aria-label="Ouvrir validités"
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = theme.shadows.buttonHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = theme.shadows.button;
              }}
            >
              <MdCheckCircle size={24} />
            </button>
          </>
        )}

        {/* Sidebar gauche - Mes prépas */}
        <div
          style={{
            ...styles.sidebarLeft,
            transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
          }}
        >
          {!isDesktop && (
            <button
              style={styles.closeButton}
              onClick={() => setLeftSidebarOpen(false)}
              aria-label="Fermer"
              onMouseOver={(e) => {
                e.currentTarget.style.color = theme.colors.secondary;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = theme.colors.dark;
              }}
            >
              <MdClose />
            </button>
          )}
          <div className="text-center mt-2 mb-3">
            <MdClass
              className="fs-4 bg-white p-1"
              style={{ ...styles.iconStyle, color: theme.colors.secondary }}
            />{' '}
            <b style={{ color: theme.colors.secondary }}>Mes prepas</b>
          </div>
          <div className="px-2">
            <UserPrepasList
              userPrepas={userPrepasData}
              loading={isLoadingGlobal}
              onSelect={handlePrepaSelection}
            />
          </div>
        </div>

        {/* Sidebar droite - Validités */}
        <div
          style={{
            ...styles.sidebarRight,
            transform: rightSidebarOpen ? 'translateX(0)' : 'translateX(100%)'
          }}
        >
          {!isDesktop && (
            <button
              style={styles.closeButton}
              onClick={() => setRightSidebarOpen(false)}
              aria-label="Fermer"
              onMouseOver={(e) => {
                e.currentTarget.style.color = theme.colors.primary;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = theme.colors.dark;
              }}
            >
              <MdClose />
            </button>
          )}

          <div className="text-center mt-2 mb-3">
            <b>
              <MdCheckCircle
                className="fs-4 bg-white p-1"
                style={{ ...styles.iconStyle, color: theme.colors.primary }}
              />{' '}
              <span style={{ color: theme.colors.primary }}>Validités</span>
            </b>
          </div>
          <div className="px-2">
            <Validite
              userPrepas={userPrepasData}
              selectedPrepa={selectedPrepa}
              onPrepaSelect={handlePrepaSelection}
            />
          </div>
        </div>

        {/* Layout desktop */}
        {isDesktop ? (
          <div className="row">
            {/* Sidebar gauche - Mes prépas */}
            <div className="col-lg-3" style={styles.centerColumn}>
              <div className="text-center mt-2 mb-3">
                <MdClass
                  className="fs-4 bg-white p-1"
                  style={{ ...styles.iconStyle, color: theme.colors.secondary }}
                />{' '}
                <b style={{ color: theme.colors.secondary }}>Mes prepas</b>
              </div>
              <UserPrepasList
                userPrepas={userPrepasData}
                loading={isLoadingGlobal}
                onSelect={handlePrepaSelection}
              />
            </div>

            {/* Colonne centrale - Préparations disponibles */}
            <div className="col-lg-6 mt-3" style={styles.centerColumn}>
              <PrepasList
                prepas={currentPrepas}
                loading={isLoadingGlobal}
                error={globalError}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchInputRef={searchInputRef}
                isSearching={isSearching}
                userPrepasData={userPrepasData}
                queryClient={queryClient}
                filteredPrepasLength={filteredPrepas.length}
                prepasDataLength={prepasData.length}
                prepasPerPage={prepasPerPage}
                currentPage={currentPage}
                paginate={paginate}
                isDesktop={isDesktop}
              />
            </div>

            {/* Sidebar droite - Validités */}
            <div className="col-lg-3" style={styles.centerColumn}>
              <div className="text-center mt-2 mb-3">
                <b>
                  <MdCheckCircle
                    className="fs-4 bg-white p-1"
                    style={{ ...styles.iconStyle, color: theme.colors.primary }}
                  />{' '}
                  <span style={{ color: theme.colors.primary }}>Validités</span>
                </b>
              </div>
              <Validite
                userPrepas={userPrepasData}
                selectedPrepa={selectedPrepa}
                onPrepaSelect={handlePrepaSelection}
              />
            </div>
          </div>
        ) : (
          /* Layout mobile/tablette - Seulement la colonne centrale est visible par défaut */
          <div className="row">
            <div className="col-12" style={{ ...styles.centerColumn, paddingLeft: '15px', paddingRight: '15px' }}>
              <PrepasList
                prepas={currentPrepas}
                loading={isLoadingGlobal}
                error={globalError}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchInputRef={searchInputRef}
                isSearching={isSearching}
                userPrepasData={userPrepasData}
                queryClient={queryClient}
                filteredPrepasLength={filteredPrepas.length}
                prepasDataLength={prepasData.length}
                prepasPerPage={prepasPerPage}
                currentPage={currentPage}
                paginate={paginate}
                isDesktop={isDesktop}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;


