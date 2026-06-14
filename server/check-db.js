const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'prepacameroun_db'
    });

    console.log('Connecté à la BD.');

    // Créer la table transactions_zitopay
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions_zitopay (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        prepa_id VARCHAR(36) NOT NULL,
        reference VARCHAR(100) NOT NULL UNIQUE,
        amount DECIMAL(10, 2) NOT NULL,
        statut VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME NULL
      )
    `);

    console.log('Table transactions_zitopay vérifiée/créée avec succès.');
    await connection.end();
  } catch (err) {
    console.error('Erreur DB:', err);
  }
}

checkDb();