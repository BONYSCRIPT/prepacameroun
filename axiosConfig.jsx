import axios from 'axios';

// Création d'une instance axios avec une configuration de base
const axiosInstance = axios.create({
  baseURL: '/api'
  // Utilisation d'un chemin relatif qui fonctionnera avec n'importe quel domaine
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    // CORRECTION : Chercher userToken en premier
    const token = localStorage.getItem('userToken') || localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs 401 (non autorisé)
    if (error.response && error.response.status === 401) {
      // Si le token est expiré, déconnectez l'utilisateur
      if (error.response.data && error.response.data.expired) {
        localStorage.removeItem('token');
        localStorage.removeItem('userToken'); // AJOUT : Supprimer aussi userToken
        localStorage.removeItem('adminToken');
        // Redirection vers la page de connexion
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

