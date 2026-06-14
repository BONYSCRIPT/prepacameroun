const db = require('../config/database');

exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY date_creation DESC',
            [userId]
        );
        res.json(notifications);
    } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des notifications" });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    console.log('markNotificationAsRead function called');
    console.log('Request body:', req.body);
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;
        await db.query(
            'UPDATE notifications SET lu = TRUE WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );
        res.json({ message: "Notification marquée comme lue" });
    } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
        res.status(500).json({ message: "Erreur lors du marquage de la notification" });
    }
};

// Fonction pour supprimer une notification
exports.deleteNotification = async (req, res) => {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;
  
      // Vérifier si la notification appartient à l'utilisateur
      const [notification] = await db.query('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [notificationId, userId]);
  
      if (notification.length === 0) {
        return res.status(404).json({ message: "Notification non trouvée ou non autorisée" });
      }
  
      // Déplacer la notification vers la table deleted_notifications
      await db.query(
        'INSERT INTO deleted_notifications (id, user_id, message, transaction_id, prepa_id, montant, date_creation, date_suppression) ' +
        'SELECT id, user_id, message, transaction_id, prepa_id, montant, date_creation, NOW() ' +
        'FROM notifications WHERE id = ?',
        [notificationId]
      );
  
      // Supprimer la notification de la table originale
      await db.query('DELETE FROM notifications WHERE id = ?', [notificationId]);
  
      res.json({ message: "Notification déplacée vers la corbeille avec succès" });
    } catch (error) {
      console.error('Erreur lors du déplacement de la notification vers la corbeille:', error);
      res.status(500).json({ message: "Erreur lors du déplacement de la notification vers la corbeille" });
    }
};

// Fonction pour récupérer les notifications supprimées
exports.getDeletedNotifications = async (req, res) => {
    try {
      const userId = req.user.id;
      const [deletedNotifications] = await db.query(
        'SELECT * FROM deleted_notifications WHERE user_id = ? ORDER BY date_suppression DESC',
        [userId]
      );
      res.json(deletedNotifications);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications supprimées:', error);
      res.status(500).json({ message: "Erreur lors de la récupération des notifications supprimées" });
    }
  };
  
  
  
