import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import DisciplineCard from '../Composants/DisciplinesView/DisciplineCard';
import { useUserAuth } from '../contexts/useUserAuth';
import { MdArrowBack } from 'react-icons/md';
import { getPrepaById, getDisciplinesByPrepa } from '../services/firestoreService';
import { toast } from 'react-toastify';
import theme from '../utils/theme'; // Importer le thème

const DisciplinesViewConsultation = () => {
  // États
  const [disciplines, setDisciplines] = useState([]);
  const [prepa, setPrepa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Récupération de l'identifiant de la préparation depuis les paramètres de l'URL
  const { prepaId } = useParams();

  // Récupération de l'utilisateur authentifié depuis le contexte
  const { user } = useUserAuth();

  // Détection de la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effet pour récupérer les disciplines de la préparation sélectionnée
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken');
          const [prepaData, disciplinesData] = await Promise.all([
            getPrepaById(prepaId),
            getDisciplinesByPrepa(prepaId)
          ]);
          setPrepa(prepaData);
          setDisciplines(disciplinesData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des disciplines:", error);
        setDisciplines([]); // Assurez-vous que disciplines est toujours un tableau
        setError("Impossible de charger les disciplines. Veuillez réessayer plus tard.");
        setLoading(false);
        toast.error("Erreur lors du chargement des disciplines");
      }
    };

    fetchDisciplines();
  }, [prepaId, user]);

  return (
    <>
      {/* Barre de navigation */}
      <div className='fixed-top'>
        <NavbarApp />
        <div 
          className="d-flex justify-content-between align-items-center p-2 p-md-3 text-white border rounded mb-1 mx-auto"
          style={{ 
            backgroundColor: theme.colors.primary, 
            boxShadow: theme.shadows.card 
          }}
        >
          <Link 
            to="/user/dashboard" 
            className='text-white text-decoration-none'
            style={{ 
              transition: theme.transitions.default,
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateX(-3px)';
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.opacity = '1';
            }}
          >
            <MdArrowBack className="me-1" /> {!isMobile && 'Retour'}
          </Link>
          <h5 className="mb-0 fs-6 fs-md-5" style={{ fontWeight: 600 }}>Disciplines</h5>
          <div></div> {/* Élément vide pour maintenir l'alignement */}
        </div>
      </div>

      {/* Contenu principal */}
      <div 
        className='container-fluid' 
        style={{ 
          marginTop: isMobile ? '110px' : '130px', 
          paddingBottom: '20px',
          backgroundColor: theme.colors.light,
          fontFamily: theme.fonts.primary
        }}
      >
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border" role="status" style={{ color: theme.colors.primary }}>
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : error ? (
          <div 
            className="alert mx-3" 
            style={{ 
              backgroundColor: '#fff0f3', 
              color: theme.colors.primary,
              borderColor: theme.colors.primary,
              borderLeft: `4px solid ${theme.colors.primary}`
            }}
          >
            {error}
          </div>
        ) : disciplines.length === 0 ? (
          <div 
            className="alert mx-3" 
            style={{ 
              backgroundColor: '#e6f4ff', 
              color: theme.colors.secondary,
              borderColor: theme.colors.secondary,
              borderLeft: `4px solid ${theme.colors.secondary}`
            }}
          >
            Aucune discipline disponible pour cette préparation.
          </div>
        ) : (
          <div className='p-2 p-md-4' style={{ height: isMobile ? 'auto' : '74vh', overflow: 'auto' }}>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
              {disciplines.map(discipline => (
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
    </>
  );
};

export default DisciplinesViewConsultation;
