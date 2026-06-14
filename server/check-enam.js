const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8001,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('Health Status:', res.statusCode);
});

req.on('error', (e) => {
  console.error('Server is down:', e.message);
});

req.end();

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRecentTransactions() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'prepacameroun_db'
    });
    
    console.log('\n--- DERNIERES TRANSACTIONS ---');
    const [transactions] = await connection.execute('SELECT id, prepa_id, reference, statut, created_at, completed_at FROM transactions_zitopay ORDER BY created_at DESC LIMIT 3');
    console.table(transactions);
    
    await connection.end();
  } catch (err) {
    console.error('Erreur DB:', err);
  }
}

checkRecentTransactions();