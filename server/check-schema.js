const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'prepacameroun_db'
    });
    
    const [columns] = await connection.execute('DESCRIBE users');
    console.table(columns);
    
    await connection.end();
  } catch (err) {
    console.error('Erreur:', err);
  }
}

checkSchema();