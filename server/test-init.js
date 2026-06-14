const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8001,
  path: '/api/payment/zitopay/init',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token-invalid', // Ceci devrait déclencher une erreur 401 si authMiddleware fonctionne
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error('Erreur de requete:', e.message);
});

req.write(JSON.stringify({ prepaId: 'test1234', amount: 5000 }));
req.end();