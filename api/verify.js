/**
 * Vercel Serverless Function - Page de retour Zitopay
 * Redirige l'utilisateur vers le frontend avec le statut du paiement
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { status, reference } = req.query;

  // Rediriger vers le frontend avec les infos de paiement
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:5173';

  // Déterminer la page de redirection
  let redirectUrl;
  if (status === 'success') {
    redirectUrl = `${baseUrl}/payment-success?reference=${reference}`;
  } else if (status === 'cancel') {
    redirectUrl = `${baseUrl}/payment-cancel?reference=${reference}`;
  } else {
    redirectUrl = `${baseUrl}/payment-failure`;
  }

  // Redirection HTTP
  return res.redirect(302, redirectUrl);
}