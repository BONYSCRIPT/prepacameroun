import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Cration d'une instance axios avec une configuration de base
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Intercepteur pour ajouter le token d'authentification aux requtes
axiosInstance.interceptors.request.use(
  (config) => {
    // Essayer de rcuperer le token utilisateur en priorit, puis admin sinon
    const userToken = localStorage.getItem('userToken');
    const adminToken = localStorage.getItem('adminToken');

    const token = userToken || adminToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour grer les erreurs de rponse
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs réseau (cas fréquent au Cameroun)
    if (!error.response && error.message === 'Network Error') {
      import('react-toastify').then(({ toast }) => {
        toast.error('Problème de connexion. Veuillez vérifier vos données mobiles ou votre signal.', {
          toastId: 'network-error' // Évite la duplication si plusieurs requêtes échouent
        });
      });
    }

    // Gestion des erreurs 401 (non autorisé)
    if (error.response && error.response.status === 401) {
      // Si le token est expir, dconnectez l'utilisateur
      if (error.response.data && error.response.data.expired) {
        localStorage.removeItem('userToken');
        // Redirection vers la page de connexion
        // Utiliser navigate ici ncessite un contexte de route, donc ce n'est pas possible ici
        // On peut dispatch un event pour que le composant de plus haut niveau fasse la redirection
        window.dispatchEvent(new Event('unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;