import { useState, useDeferredValue } from 'react';
import Card from './Prepas/Card';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdSearch, MdFilterList } from 'react-icons/md';
import useDeviceSize from '../../hooks/useDeviceSize';
import { useQuery } from '@tanstack/react-query';

const Prepas = () => {
  // Thème de couleurs pour la cohérence avec le reste de l'application
  const theme = {
    primary: '#be0050',
    primaryLight: '#f8e5ec',
    secondary: '#212529',
    light: '#f8f9fa',
    transition: 'all 0.3s ease',
    borderRadius: '8px',
    buttonBorderRadius: '30px'
  };

  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const { isMobile, isTablet } = useDeviceSize();

  // Récupération via React Query pour bénéficier du cache global
  const { data: prepas = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['prepas', 'published'],
    queryFn: async () => {
      const token = localStorage.getItem('userToken');
      // On autorise ici la requête même sans token pour la partie publique si le backend gère ça, 
      // ou on l'envoie si présent.
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get('/api/prepas/published', { headers });
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    }
  });

  const error = queryError ? 'Erreur lors du chargement des préparations' : null;

  // Filtrer les préparations selon le terme de recherche
  const filteredPrepas = prepas.filter(prepa =>
    prepa.nom.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
    prepa.description.toLowerCase().includes(deferredSearchTerm.toLowerCase())
  );

  // Styles responsifs
  const containerStyle = {
    width: isMobile ? '90%' : isTablet ? '80%' : '70%',
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '1200px'
  };

  return (
    <div style={containerStyle}>
      {/* En-tête avec barre de recherche */}
      <div className="mb-4">
        <h2 className="mb-3 fw-bold" style={{ color: theme.secondary }}>Préparations disponibles</h2>
        <div className="d-flex gap-2">
          <div className="input-group">
            <span className="input-group-text" style={{ backgroundColor: theme.light, border: '1px solid #ced4da', borderRight: 'none' }}>
              <MdSearch size={20} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher une préparation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: '0 8px 8px 0',
                border: '1px solid #ced4da',
                borderLeft: 'none',
                padding: '10px 12px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Affichage des préparations */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" style={{ color: theme.primary }}>
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : filteredPrepas.length === 0 ? (
        <div className="text-center py-4" style={{ backgroundColor: theme.primaryLight, borderRadius: theme.borderRadius, padding: '30px' }}>
          <p className="mb-0">Aucune préparation ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredPrepas.map(prepa => (
            <div key={prepa.id} className="col-12">
              <Card
                id={prepa.id}
                titre={prepa.nom}
                description={prepa.description}
                prix={prepa.prix}
                image={prepa.image_url}
                isInscribed={prepa.is_inscribed}
                onPaymentSuccess={() => { }} // Le dashboard gère déjà l'invalidation globale 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prepas;
