const nock = require('nock');
const request = require('supertest');
const app = require('../app');

describe('Payment Process', () => {
  it('should process payment and create inscription', async () => {
    nock('https://api.payment-provider.com')
      .post('/process')
      .reply(200, { status: 'success', amount: 1000 });

    const response = await request(app)
      .post('/api/payment/process')
      .send({ userId: '123', prepaId: '456', amount: 1000 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Paiement réussi et inscription enregistrée');
  });
});