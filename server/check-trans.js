const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTransactions() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'prepacameroun_db'
    });
    
    // Check latest transactions
    const [rows] = await connection.execute('SELECT * FROM transactions_zitopay ORDER BY created_at DESC LIMIT 5');
    console.log('--- DERNIÈRES TRANSACTIONS ---');
    console.table(rows);
    
    await connection.end();
  } catch (err) {
    console.error('Erreur:', err);
  }
}

checkTransactions();