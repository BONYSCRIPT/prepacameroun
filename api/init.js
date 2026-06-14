/**
 * Vercel Serverless Function - Initie une transaction Zitopay
 * Remplace : server/controllers/zitoPayController.js (initPayment)
 */
import admin from 'firebase-admin';

// Initialisation Firebase Admin (une seule fois)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { prepaId, montant, userEmail, userId, nom } = req.body;

    if (!prepaId || !montant || !userEmail || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: prepaId, montant, userEmail, userId requis'
      });
    }

    // Générer une référence unique pour la transaction
    const reference = `PC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Créer un document pending dans Firestore
    await db.collection('transactions_zitopay').doc(reference).set({
      reference,
      prepa_id: prepaId,
      montant: parseFloat(montant),
      user_email: userEmail,
      user_id: userId,
      nom: nom || 'Préparation concours',
      statut: 'pending',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Configurer l'URL de callback Zitopay
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:5173';

    const notifyUrl = `${baseUrl}/api/notification`;
    const successUrl = `${baseUrl}/api/verify?status=success&reference=${reference}`;
    const cancelUrl = `${baseUrl}/api/verify?status=cancel&reference=${reference}`;

    // Construire l'URL Zitopay
    const zitopayUrl = `https://zitopay.africa/checkout?username=${process.env.ZITOPAY_USERNAME}&receiver=${process.env.ZITOPAY_RECEIVER}&amount=${montant}&currency=XAF&reference=${reference}&notify_url=${encodeURIComponent(notifyUrl)}&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;

    return res.status(200).json({
      success: true,
      data: {
        payment_url: zitopayUrl,
        reference
      }
    });

  } catch (error) {
    console.error('Erreur init paiement:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation du paiement'
    });
  }
}