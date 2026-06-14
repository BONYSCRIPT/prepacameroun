import { useState, useEffect, useCallback } from 'react';
import { MdOutlineNotifications, MdDelete, MdMarkEmailRead, MdRefresh, MdNotificationsActive } from 'react-icons/md';
import { Modal, Button, Spinner, Badge, Tabs, Tab, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useUserAuth } from '../../../contexts/useUserAuth';
import axiosInstance from '../../../utils/axiosConfig';

// Charte graphique
const theme = {
  colors: {
    primary: '#bf0051',       // Rouge framboise/bordeaux
    primaryDark: '#8c003c',   // Version plus fonce du rouge
    secondary: '#0274d9',     // Bleu vif
    secondaryDark: '#015aa9', // Version plus fonce du bleu
    dark: '#212529',          // Gris fonc pour texte
    light: '#f8f9fa',         // Couleur claire pour sections alternes
    lightGray: '#f1f1f1',     // Accent lger
    success: '#28a745',       // Vert standard
    successDark: '#1e7e34',   // Vert fonc
    danger: '#dc3545',        // Rouge standard
    dangerDark: '#bd2130',    // Rouge fonc
    warning: '#ffc107',       // Orange standard
    muted: '#6c757d',         // Texte secondaire
    border: '#dee2e6'         // Couleur de bordure
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    pill: '50rem'
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  transitions: {
    default: 'all 0.3s ease'
  }
};

const NotificationBell = () => {
  // tats
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Fonction pour rcuprer les notifications depuis le serveur
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/users/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur lors de la rcupration des notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const { user } = useUserAuth();

  // Effet pour charger les notifications quand l'utilisateur est présent
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }

    // Écouter les demandes de rafraîchissement manuel (ex: après un paiement)
    window.addEventListener('refreshNotifications', fetchNotifications);
    return () => window.removeEventListener('refreshNotifications', fetchNotifications);
  }, [user, fetchNotifications]);

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/api/users/notifications/${notificationId}/read`);
      // Mettre  jour l'tat local sans refaire une requte
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, lu: true }
            : notification
        )
      );
      toast.success('Notification marque comme lue');
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      toast.error('Erreur lors de la mise  jour de la notification');
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.lu).map(n => n.id);
      if (unreadIds.length === 0) {
        toast.info('Aucune notification non lue');
        return;
      }
      // Pour chaque notification non lue, envoyer une requte pour la marquer comme lue
      await Promise.all(
        unreadIds.map(id =>
          axiosInstance.put(`/api/users/notifications/${id}/read`, {})
        )
      );
      // Mettre  jour l'tat local
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, lu: true }))
      );
      toast.success('Toutes les notifications ont t marques comme lues');
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      toast.error('Erreur lors de la mise  jour des notifications');
    }
  };

  // Fonction pour grer la suppression d'une notification
  const handleDelete = async (notificationId, event) => {
    // Empcher la propagation de l'vnement pour viter d'ouvrir la notification
    if (event) {
      event.stopPropagation();
    }
    if (window.confirm('tes-vous sr de vouloir supprimer cette notification ?')) {
      try {
        await axiosInstance.delete(`/api/users/notifications/${notificationId}`);
        // Mise  jour de l'tat local aprs suppression
        setNotifications(notifications.filter(n => n.id !== notificationId));
        toast.success('Notification supprime avec succs');
      } catch (error) {
        console.error('Erreur lors de la suppression de la notification:', error);
        toast.error('Erreur lors de la suppression de la notification');
      }
    }
  };

  // Fonction pour rafrachir les notifications
  const refreshNotifications = () => {
    setIsAnimating(true);
    fetchNotifications().then(() => {
      setTimeout(() => setIsAnimating(false), 1000);
    });
  };

  // Calcul du nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.lu).length;

  // Filtrer les notifications en fonction de l'onglet actif et du terme de recherche
  const filteredNotifications = notifications.filter(notification => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && !notification.lu) ||
      (activeTab === 'read' && notification.lu);

    const matchesSearch =
      searchTerm === '' ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return diffDay === 1 ? 'Hier' : `Il y a ${diffDay} jours`;
    } else if (diffHour > 0) {
      return `Il y a ${diffHour} h`;
    } else if (diffMin > 0) {
      return `Il y a ${diffMin} min`;
    } else {
      return ' l\'instant';
    }
  };

  return (
    <>
      {/* Icne de cloche avec badge pour les notifications non lues */}
      <div
        className='position-relative d-flex align-items-center ms-4 me-4'
        onClick={() => setShowModal(true)}
        style={{
          cursor: 'pointer',
          transition: theme.transitions.default
        }}
        title={unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune notification non lue'}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {unreadCount > 0 ? (
          <MdNotificationsActive size={24} style={{ color: theme.colors.warning }} />
        ) : (
          <MdOutlineNotifications size={24} style={{ color: theme.colors.dark }} />
        )}
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{
              fontSize: '0.6rem',
              padding: '0.25rem 0.4rem',
              backgroundColor: theme.colors.primary
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>

      {/* Modal pour afficher les notifications */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: theme.colors.light,
            borderBottom: `1px solid ${theme.colors.border}`
          }}
        >
          <Modal.Title style={{ color: theme.colors.dark, fontWeight: '600' }}>
            Notifications
            {unreadCount > 0 && (
              <Badge
                pill
                className="ms-2"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {unreadCount}
              </Badge>
            )}
          </Modal.Title>
          <div className="d-flex">
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={refreshNotifications}
              disabled={loading || isAnimating}
              title="Rafrachir"
              style={{
                borderRadius: theme.borderRadius.pill,
                borderColor: theme.colors.secondary,
                color: theme.colors.secondary,
                transition: theme.transitions.default
              }}
              onMouseOver={(e) => {
                if (!loading && !isAnimating) {
                  e.currentTarget.style.backgroundColor = theme.colors.secondary;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'rotate(180deg)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.secondary;
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              <MdRefresh
                size={18}
                className={isAnimating ? 'spin-animation' : ''}
              />
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || loading}
              title="Tout marquer comme lu"
              style={{
                borderRadius: theme.borderRadius.pill,
                transition: theme.transitions.default
              }}
              onMouseOver={(e) => {
                if (unreadCount > 0 && !loading) {
                  e.currentTarget.style.backgroundColor = theme.colors.success;
                  e.currentTarget.style.borderColor = theme.colors.success;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.success;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <MdMarkEmailRead size={18} />
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.colors.lightGray, padding: '1.5rem' }}>
          <Form className="mb-3">
            <Form.Control
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                padding: '0.75rem 1rem',
                transition: theme.transitions.default
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 0 3px rgba(191, 0, 81, 0.2)`;
                e.target.style.borderColor = theme.colors.primary;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = theme.colors.border;
              }}
            />
          </Form>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3 custom-tabs"
          >
            <Tab
              eventKey="all"
              title={`Toutes (${notifications.length})`}
              tabClassName={activeTab === 'all' ? 'active-tab' : ''}
            >
              {renderNotificationsList(filteredNotifications)}
            </Tab>
            <Tab
              eventKey="unread"
              title={`Non lues (${unreadCount})`}
              tabClassName={activeTab === 'unread' ? 'active-tab' : ''}
            >
              {renderNotificationsList(filteredNotifications)}
            </Tab>
            <Tab
              eventKey="read"
              title={`Lues (${notifications.length - unreadCount})`}
              tabClassName={activeTab === 'read' ? 'active-tab' : ''}
            >
              {renderNotificationsList(filteredNotifications)}
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
      {/* CSS pour l'animation de rotation et autres effets */}
      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        .notification-item {
          transition: all 0.3s ease;
        }
        .notification-item:hover {
          transform: translateY(-2px);
          box-shadow: ${theme.shadows.md};
        }
        /* Styles personnaliss pour les onglets */
        .custom-tabs .nav-link {
          color: ${theme.colors.dark};
          border: none;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
          font-weight: 500;
          margin-right: 0.5rem;
          border-radius: ${theme.borderRadius.md} ${theme.borderRadius.md} 0 0;
        }
        .custom-tabs .nav-link:hover:not(.active) {
          background-color: rgba(191, 0, 81, 0.05);
          color: ${theme.colors.primary};
        }
        .custom-tabs .nav-link.active {
          color: ${theme.colors.primary};
          border-bottom: 2px solid ${theme.colors.primary};
          font-weight: 600;
        }
        .active-tab {
          color: ${theme.colors.primary} !important;
          font-weight: 600 !important;
        }
        /* Styles pour les boutons d'action */
        .action-button {
          transition: all 0.3s ease;
        }
        .action-button:hover {
          transform: translateY(-1px);
        }
        /* Animation pour la cloche de notification */
        @keyframes bellRing {
          0% { transform: rotate(0); }
          10% { transform: rotate(10deg); }
          20% { transform: rotate(-10deg); }
          30% { transform: rotate(6deg); }
          40% { transform: rotate(-6deg); }
          50% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
        .bell-animation {
          animation: bellRing 2s infinite;
          animation-delay: 5s;
        }
      `}</style>
    </>
  );

  // Fonction pour rendre la liste des notifications
  function renderNotificationsList(notificationsList) {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner
            animation="border"
            style={{ color: theme.colors.primary }}
          />
          <p className="mt-3" style={{ color: theme.colors.muted }}>
            Chargement des notifications...
          </p>
        </div>
      );
    }

    if (notificationsList.length === 0) {
      return (
        <div
          className="text-center py-4 px-3"
          style={{
            backgroundColor: 'white',
            borderRadius: theme.borderRadius.md,
            boxShadow: theme.shadows.sm,
            border: `1px solid ${theme.colors.border}`
          }}
        >
          <p style={{ color: theme.colors.muted }}>
            {searchTerm
              ? 'Aucune notification ne correspond  votre recherche'
              : activeTab === 'unread'
                ? 'Aucune notification non lue'
                : activeTab === 'read'
                  ? 'Aucune notification lue'
                  : 'Aucune notification'}
          </p>
        </div>
      );
    }

    return (
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {notificationsList.map(notification => (
          <div
            key={notification.id}
            className="notification-item mb-3 p-3 position-relative"
            style={{
              backgroundColor: 'white',
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.sm,
              borderLeft: notification.lu ?
                `1px solid ${theme.colors.border}` :
                `4px solid ${theme.colors.secondary}`,
              fontWeight: notification.lu ? 'normal' : '500'
            }}
          >
            {/* Contenu de la notification */}
            <div dangerouslySetInnerHTML={{ __html: notification.message }} />

            {/* Date de cration de la notification */}
            <div className="d-flex justify-content-between align-items-center mt-2">
              <small style={{ color: theme.colors.muted, fontSize: '0.8rem' }}>
                {formatDate(notification.date_creation)}
              </small>

              <div>
                {/* Bouton pour marquer comme lu (si non lu) */}
                {!notification.lu && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 me-3 action-button"
                    style={{
                      color: theme.colors.secondary,
                      textDecoration: 'none'
                    }}
                    onClick={() => markAsRead(notification.id)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = theme.colors.secondaryDark;
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = theme.colors.secondary;
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    <MdMarkEmailRead className="me-1" />
                    Marquer comme lu
                  </Button>
                )}

                {/* Bouton de suppression */}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 action-button"
                  style={{
                    color: theme.colors.primary,
                    textDecoration: 'none'
                  }}
                  onClick={(e) => handleDelete(notification.id, e)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = theme.colors.primaryDark;
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = theme.colors.primary;
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  <MdDelete className="me-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default NotificationBell;
