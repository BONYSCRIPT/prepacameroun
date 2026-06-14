import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/useAdminAuth';
import axiosInstance from '../../utils/axiosConfig';
import 'bootstrap/dist/css/bootstrap.css';
import logo from '../images/prepalogo.png';

const AdminNavbar = () => {
  
  // Récupération des fonctions d'authentification et de navigation
  const { isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();

  // Fonction de déconnexion
  //const handleLogout = async () => {
    //try {
      //const token = localStorage.getItem('adminToken'); // Ou la méthode que vous utilisez pour stocker le jeton
      //await axiosInstance.post('/api/admin/logout', {}, {
        //headers: {
          //Authorization: `Bearer ${token}`
        //}
      //});
      //logout(); // Fonction de déconnexion côté client depuis useAdminAuth
      //navigate('/');
    //} catch (error) {
      //console.error('Échec de la déconnexion:', error);
      //console.log('Impossible de se déconnecter du serveur');
      // Optionnellement, vous pouvez afficher un message d'erreur à l'utilisateur ici
    //}
  //};

  const handleLogout = () => {
    try {
      // Supprimer le token du localStorage
      localStorage.removeItem('adminToken');
      
      // Appeler la fonction de déconnexion du contexte
      logout();
      
      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (error) {
      console.error('Échec de la déconnexion:', error);
    }
  };  

  //Fonction de retour
  const handleLoginClick = () => {
    navigate('/');
  };

  return (
    <>
      {/* Barre de navigation */}
      <nav className="navbar navbar-expand-lg bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src={logo} alt="Logo" width="40" height="40" />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            {isAuthenticated() ? (
              // Bouton de déconnexion pour les administrateurs connectés
              <button className="btn btn-danger" onClick={handleLogout}>
                Déconnexion
              </button>
            ) : (
              // Bouton de connexion pour les utilisateurs non connectés
              <button className="btn btn-danger me-2" onClick={handleLoginClick}>
                Retour
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;
