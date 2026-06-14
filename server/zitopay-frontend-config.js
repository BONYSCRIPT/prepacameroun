// Configuration ZitoPay pour PrepaCameroun
// À intégrer dans votre frontend

class ZitoPayIntegration {
  constructor(apiBaseUrl, authToken) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = authToken;
  }

  // Initialiser une transaction ZitoPay
  async initTransaction(prepaData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/payment/zitopay/init`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prepaId: prepaData.id,
          amount: prepaData.prix,
          prepaNom: prepaData.nom
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          transactionId: result.transactionId,
          reference: result.reference
        };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur initialisation ZitoPay:', error);
      return { success: false, error: error.message };
    }
  }

  // Rediriger vers ZitoPay
  redirectToZitoPay(reference, amount, userEmail = '') {
    const callbackUrl = encodeURIComponent(`${window.location.origin}/payment/callback`);
    const cancelUrl = encodeURIComponent(`${window.location.origin}/payment/cancel`);
    
    const zitoPayUrl = `https://zitopay.africa/pay?` +
      `ref=${reference}&` +
      `amount=${amount}&` +
      `currency=XAF&` +
      `callback_url=${callbackUrl}&` +
      `cancel_url=${cancelUrl}` +
      (userEmail ? `&customer_email=${encodeURIComponent(userEmail)}` : '');
    
    window.location.href = zitoPayUrl;
  }

  // Vérifier le paiement après retour de ZitoPay
  async verifyPayment(ref, status, paymentMethod, prepaId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/payment/zitopay/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref,
          status,
          payment_method: paymentMethod,
          prepaId
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      return { success: false, error: error.message };
    }
  }

  // Flux complet de paiement
  async processPayment(prepaData, userEmail = '') {
    try {
      // 1. Initialiser la transaction
      const initResult = await this.initTransaction(prepaData);
      
      if (!initResult.success) {
        throw new Error(initResult.error);
      }

      // 2. Sauvegarder les données dans localStorage pour le retour
      localStorage.setItem('zitopay_transaction', JSON.stringify({
        reference: initResult.reference,
        prepaId: prepaData.id,
        amount: prepaData.prix,
        timestamp: Date.now()
      }));

      // 3. Rediriger vers ZitoPay
      this.redirectToZitoPay(initResult.reference, prepaData.prix, userEmail);

    } catch (error) {
      console.error('Erreur processus paiement:', error);
      return { success: false, error: error.message };
    }
  }

  // Gérer le retour de ZitoPay (à appeler sur la page de callback)
  async handleCallback() {
    try {
      // Récupérer les paramètres de l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      const status = urlParams.get('status');
      const paymentMethod = urlParams.get('payment_method') || 'unknown';

      // Récupérer les données sauvegardées
      const savedTransaction = localStorage.getItem('zitopay_transaction');
      if (!savedTransaction) {
        throw new Error('Données de transaction non trouvées');
      }

      const transactionData = JSON.parse(savedTransaction);

      // Vérifier que la référence correspond
      if (ref !== transactionData.reference) {
        throw new Error('Référence de transaction invalide');
      }

      // Vérifier le paiement
      const verifyResult = await this.verifyPayment(
        ref, 
        status, 
        paymentMethod, 
        transactionData.prepaId
      );

      // Nettoyer le localStorage
      localStorage.removeItem('zitopay_transaction');

      return verifyResult;

    } catch (error) {
      console.error('Erreur callback ZitoPay:', error);
      return { success: false, error: error.message };
    }
  }
}

// Exemple d'utilisation
/*
const zitoPay = new ZitoPayIntegration('https://prepacameroun.com', userToken);

// Pour initier un paiement
const prepaData = {
  id: 'uuid-prepa',
  nom: 'ISSEA',
  prix: 8000
};

zitoPay.processPayment(prepaData, 'user@email.com');

// Sur la page de callback
zitoPay.handleCallback().then(result => {
  if (result.success) {
    // Paiement réussi, rediriger vers la page de succès
    window.location.href = '/payment/success';
  } else {
    // Paiement échoué, afficher l'erreur
    console.error('Paiement échoué:', result.error);
    window.location.href = '/payment/error';
  }
});
*/

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZitoPayIntegration;
}
