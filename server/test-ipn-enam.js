const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8001,
  path: '/api/payment/zitopay/notification',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log('Status IPN:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error('Erreur IPN:', e.message);
});

// Using the most recent ENAM pending transaction
req.write(JSON.stringify({ 
  ref: 'ZITO_fddeeb41_1772775021966', 
  status: 'success', 
  amount: 5000 
}));
req.end();

console.log('Requête IPN ENAM envoyée');