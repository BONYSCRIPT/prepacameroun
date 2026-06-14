import { useParams, Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { MdCheckCircle, MdHome, MdArrowForward, MdErrorOutline } from 'react-icons/md';
import NavbarApp from '../Composants/Dashboard/NavbarApp';
import { toast } from 'react-toastify';
import { getPrepaById } from '../services/firestoreService';
import { useUserAuth } from '../contexts/useUserAuth';

const PaymentSuccess = () => {
  const { prepaId } = useParams();
  const location = useLocation();
  // On récupère AUSSI le loading du contexte pour savoir quand user est prêt
  const { user, loading: authLoading } = useUserAuth();
  const [status, setStatus] = useState('processing');
  const [prepaName, setPrepaName] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const hasFinalized = useRef(false); // Garde pour éviter les double-appels

  const queryParams = new URLSearchParams(location.search);
  const reference = queryParams.get('ref');

  const finalizePayment = useCallback(async (currentUser) => {
    if (!currentUser?.id || !prepaId || !reference) {
      console.warn('[PaymentSuccess] Données manquantes', {
        userId: currentUser?.id,
        prepaId,
        reference
      });
      setStatus('error');
      setErrorDetails('Données de paiement manquantes. Contactez le support.');
      return;
    }

    try {
      setStatus('processing');
      console.log('[PaymentSuccess] Affichage du succès pour user:', currentUser.id);

      const currentPrepa = await getPrepaById(prepaId);
      setPrepaName(currentPrepa.nom || 'la préparation');

      // Le backend (via IPN Zitopay) s'est déjà chargé de valider l'inscription.
      // On se contente d'afficher le succès et de notifier le parent.
      setStatus('success');
      toast.success('🎉 Votre inscription est en cours de validation ! (Actualisation imminente)');

      // Notifier la fenêtre parente (le modal ZitoPay dans Dashboard)
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'payment_success', prepaId: prepaId }, '*');
      }
      window.postMessage({ type: 'payment_success', prepaId: prepaId }, '*');

    } catch (error) {
      console.error('[PaymentSuccess] Erreur lors de la récupération des infos:', error);
      setStatus('error');
      setErrorDetails('Erreur lors du chargement des informations de succès.');
    }
  }, [prepaId, reference]);

  // CORRECTION RACE CONDITION : On attend que authLoading soit false ET que user soit disponible
  useEffect(() => {
    if (authLoading) {
      console.log('[PaymentSuccess] En attente du chargement de l\'utilisateur...');
      return; // Attendre que l'auth soit chargée
    }

    if (hasFinalized.current) return; // Éviter les doubles appels

    if (!user) {
      console.warn('[PaymentSuccess] Utilisateur non connecté après chargement de l\'auth');
      setStatus('error');
      setErrorDetails('Vous devez être connecté pour finaliser le paiement. Reconnectez-vous et réessayez.');
      return;
    }

    hasFinalized.current = true;
    finalizePayment(user);
  }, [user, authLoading, finalizePayment]);

  const simulateZitopayWebhook = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';
      toast.info('⏳ Simulation du webhook ZitoPay en cours...');
      // Appel direct au webhook "comme si" on était ZitoPay
      await axiosInstance.post(`${baseUrl}/api/payment/zitopay/notification`, {
        ref: reference,
        status: 'success',
        amount: 0
      });
      toast.success('✅ Webhook simulé ! Le statut va se rafraîchir.');
      // Recharge artificiellement pour repasser la logique finale du PaymentSuccess
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Erreur webhook local:', err);
      toast.error('Simulation IPN échouée.');
    }
  };

  const isLocalEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const primaryColor = '#be0050';
  const successColor = '#28a745';
  const dangerColor = '#dc3545';

  return (
    <>
      <NavbarApp />

      {/* BANNIÈRE DE DIAGNOSTIC (en haut, fixée) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        backgroundColor: status === 'error' ? dangerColor : primaryColor,
        color: 'white',
        padding: '10px 20px',
        textAlign: 'center',
        fontSize: '0.85rem',
        boxShadow: '0 3px 15px rgba(0,0,0,0.25)'
      }}>
        <b>🚨 Infos technique :</b>{' '}
        User: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 5px' }}>{user?.id || (authLoading ? 'chargement...' : 'null')}</code>{' '}
        | Prepa: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 5px' }}>{prepaId || 'N/A'}</code>{' '}
        | Ref: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 5px' }}>{reference || 'N/A'}</code>{' '}
        | Statut: <b style={{ color: '#ffc107' }}>{authLoading ? 'Auth...' : status}</b>
        {errorDetails && <> | Err: <b>{errorDetails}</b></>}
      </div>

      <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container" style={{ maxWidth: '700px', paddingBottom: '50px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>

            {/* États de chargement */}
            {(status === 'processing' || authLoading) && (
              <div>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  backgroundColor: 'rgba(190,0,80,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <div className="spinner-border" style={{ color: primaryColor, width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
                <h3 style={{ fontWeight: 700 }}>
                  {authLoading ? 'Vérification de votre session...' : 'Activation de votre accès...'}
                </h3>
                <p style={{ color: '#666' }}>
                  {authLoading
                    ? 'Veuillez patienter, nous vérifions votre identité.'
                    : 'Enregistrement de votre inscription en cours.'}
                </p>
                {isLocalEnv && !authLoading && status === 'processing' && (
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeeba' }}>
                    <p style={{ color: '#856404', fontSize: '0.9rem', marginBottom: '10px' }}>
                      <strong>Mode Local Détecté ⚠️</strong><br />
                      ZitoPay ne peut pas pinger votre ordinateur local en arrière-plan. Cliquez ici pour simuler leur notification.
                    </p>
                    <button
                      onClick={simulateZitopayWebhook}
                      style={{ backgroundColor: '#ffc107', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', color: '#000', cursor: 'pointer' }}
                    >
                      Simuler Réponse Webhook ZitoPay
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Succès */}
            {status === 'success' && (
              <>
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  backgroundColor: 'rgba(40,167,69,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <MdCheckCircle size={60} style={{ color: successColor }} />
                </div>
                <h2 style={{ color: successColor, fontWeight: 700, marginBottom: '12px' }}>Félicitations !</h2>
                <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: '32px' }}>
                  Votre inscription à <strong>{prepaName}</strong> est désormais active. 🎉
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/user/dashboard" style={{
                    backgroundColor: primaryColor, color: 'white', padding: '12px 28px',
                    borderRadius: '50px', textDecoration: 'none', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <MdHome size={20} /> Mon Tableau de bord
                  </Link>
                  <Link to={'/user/prepa/' + prepaId} style={{
                    border: '2px solid ' + successColor, color: successColor, padding: '12px 28px',
                    borderRadius: '50px', textDecoration: 'none', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    Accéder aux cours <MdArrowForward size={20} />
                  </Link>
                </div>
              </>
            )}

            {/* Erreur */}
            {status === 'error' && (
              <>
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  backgroundColor: 'rgba(220,53,69,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <MdErrorOutline size={60} style={{ color: dangerColor }} />
                </div>
                <h2 style={{ color: dangerColor, fontWeight: 700, marginBottom: '12px' }}>Problème détecté</h2>
                <p style={{ color: '#666', marginBottom: '12px' }}>
                  {errorDetails || "Nous n'avons pas pu valider votre paiement."}
                </p>
                <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '32px' }}>
                  Votre paiement a peut-être été reçu. Contactez le support avec votre référence : <strong>{reference}</strong>
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { hasFinalized.current = false; finalizePayment(user); }}
                    style={{
                      backgroundColor: primaryColor, color: 'white', padding: '12px 28px',
                      borderRadius: '50px', border: 'none', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Réessayer
                  </button>
                  <Link to="/user/dashboard" style={{
                    border: '2px solid #999', color: '#666', padding: '12px 28px',
                    borderRadius: '50px', textDecoration: 'none', fontWeight: 700
                  }}>
                    Retour au dashboard
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
