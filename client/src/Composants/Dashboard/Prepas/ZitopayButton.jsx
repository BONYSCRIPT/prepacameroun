import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../../contexts/useUserAuth';
import { toast } from 'react-toastify';
import { MdPayment } from 'react-icons/md';
import { Modal, Spinner } from 'react-bootstrap';

const ZitopayButton = ({
  prix,
  prepaId,
  prepaNom,
  buttonText,
  buttonStyle = {},
  className = "",
  onSuccess
}) => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useUserAuth();

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'payment_success' && String(event.data?.prepaId) === String(prepaId)) {
        console.log('Signal de paiement reçu pour:', prepaId);
        setShowModal(false);

        toast.success('Paiement réussi !');

        // Déclencher un refresh des notifications dans la cloche
        window.dispatchEvent(new CustomEvent('refreshNotifications'));

        if (onSuccess) {
          onSuccess(event.data);
        }
      } else if (event.data?.type === 'payment_cancel') {
        setShowModal(false);
        toast.info('Paiement annulé');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [prepaId, onSuccess]);

  const [zitopayUrlParams, setZitopayUrlParams] = useState(null);
  const [transactionRef, setTransactionRef] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const isLocalEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE = '';

  const simulatePayment = async () => {
    if (!transactionRef) {
      toast.error('Aucune transaction en cours');
      return;
    }
    setSimulating(true);
    try {
      const response = await fetch(`${API_BASE}/api/notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: transactionRef,
          status: 'success',
          amount: prix
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('✅ Paiement simulé avec succès !');
        window.postMessage({ type: 'payment_success', prepaId, ref: transactionRef }, '*');
        setTimeout(() => setShowModal(false), 1500);
      } else {
        toast.error('Erreur lors de la simulation');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur réseau lors de la simulation');
    }
    setSimulating(false);
  };

  const handleOpenPayment = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user?.id) {
      toast.error('Vous devez être connecté pour effectuer un paiement');
      return;
    }

    setLoading(true);
    setShowModal(true);

    try {
      const userEmail = user?.email || '';
      const userName = user?.username || user?.displayName || userEmail.split('@')[0] || 'Utilisateur';

      const response = await fetch(`${API_BASE}/api/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prepaId: prepaId,
          montant: prix,
          userEmail: userEmail,
          userId: user.id,
          nom: `Prépa ${prepaNom}`
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de l\'initialisation de la transaction');
      }

      const reference = data.data?.reference || data.reference;
      setTransactionRef(reference);
      const receiver = import.meta.env.VITE_ZITOPAY_USERNAME || 'prepacameroun';
      const note = `Inscription PrepaCameroun: ${prepaNom}`;

      const successUrl = `${window.location.origin}/api/verify?status=success&reference=${reference}`;
      const cancelUrl = `${window.location.origin}/api/verify?status=cancel&reference=${reference}`;

      const zitopayUrl = new URL('https://zitopay.africa/sci/');
      zitopayUrl.searchParams.append('receiver', receiver);
      zitopayUrl.searchParams.append('amount', prix.toString());
      zitopayUrl.searchParams.append('currency', 'XAF');
      zitopayUrl.searchParams.append('ref', reference);
      zitopayUrl.searchParams.append('memo', note);
      zitopayUrl.searchParams.append('success_url', successUrl);
      zitopayUrl.searchParams.append('cancel_url', cancelUrl);
      zitopayUrl.searchParams.append('popup', '1');

      setZitopayUrlParams(zitopayUrl.toString());
      setLoading(false);

    } catch (error) {
      console.error("Erreur Init transaction Zitopay:", error);
      toast.error('Impossible d\'initialiser le paiement sécurisé.');
      setShowModal(false);
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setZitopayUrlParams(null);
  };

  const defaultButtonStyle = {
    background: 'linear-gradient(45deg, #be0050, #d63384)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    boxShadow: '0 4px 6px rgba(190, 0, 80, 0.2)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <>
      <button
        onClick={handleOpenPayment}
        className={`btn ${className}`}
        style={{ ...defaultButtonStyle, ...buttonStyle }}
      >
        <MdPayment className="me-2" size={18} />
        {buttonText || `Payer ${prix.toLocaleString()} XAF`}
      </button>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        className="zitopay-modal"
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid #eee' }}>
          <Modal.Title style={{ color: '#be0050', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Paiement Sécurisé ZitoPay
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 position-relative" style={{ height: '600px', overflow: 'hidden' }}>
          {loading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white"
              style={{ zIndex: 10, transition: 'opacity 0.3s ease' }}
            >
              <Spinner animation="border" style={{ color: '#be0050' }} />
              <p className="mt-3 text-muted">Création de la transaction sécurisée...</p>
            </div>
          )}
          {zitopayUrlParams && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', backgroundColor: '#fff3cd', padding: '10px 15px', zIndex: 5, borderBottom: '1px solid #ffeeba', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#856404', fontSize: '0.9rem', fontWeight: 600 }}>Environnement de test</span>
              <button 
                onClick={simulatePayment} 
                disabled={simulating}
                className="btn btn-warning btn-sm" 
                style={{ fontWeight: 700 }}
              >
                {simulating ? 'Simulation en cours...' : 'Simuler le paiement réussi'}
              </button>
            </div>
          )}
          {zitopayUrlParams ? (
            <iframe
              src={zitopayUrlParams}
              title="Passerelle de Paiement ZitoPay"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="payment"
              onLoad={() => {
                setTimeout(() => setLoading(false), 500);
              }}
              style={{ border: 'none' }}
            ></iframe>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              {!loading && <p className="text-danger">Erreur d'initialisation, veuillez réessayer.</p>}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center py-2" style={{ borderTop: '1px solid #eee', fontSize: '0.8rem', color: '#6c757d' }}>
          <small>Transaction sécurisée. Ne fermez pas cette fenêtre avant la confirmation.</small>
        </Modal.Footer>
      </Modal>

      <style>{`
        .zitopay-modal .modal-content {
          border-radius: 12px;
          border: none;
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        @media (max-width: 576px) {
          .zitopay-modal .modal-body {
            height: 90vh !important;
          }
        }
      `}</style>
    </>
  );
};

export default ZitopayButton;