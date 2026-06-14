const nock = require('nock');
const request = require('supertest');
const app = require('../app');

describe('Processus de paiement', () => {
  it('devrait traiter le paiement et créer une inscription', async () => {
    // Simulation de la réponse de l'API de paiement
    nock('https://api.payment-provider.com')
      .post('/process')
      .reply(200, { status: 'success', transactionId: '123456' });

    const response = await request(app)
      .post('/api/payment/process')
      .send({ userId: '123', prepaId: '456', amount: 1000 });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });
});