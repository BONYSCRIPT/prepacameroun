require('dotenv').config();
const mysql = require('mysql2');

// Afficher les informations de connexion pour le débogage
console.log("Configuration du beau gosse loic de la base de données:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 0
});

module.exports = pool.promise();

