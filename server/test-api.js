const http = require('http');

// Get the user token from the DB to simulate frontend request
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testApi() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prepacameroun_db'
  });
  
  // Create a quick token using the same logic as authController
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { userId: 'fddeeb41-36ac-4c12-b495-b84302b3e5b3', firebase_uid: 'fake_uid' },
    process.env.JWT_USER_SECRET || 'votre_secret_jwt_super_securise', // default from other files if not set
    { expiresIn: '24h' }
  );
  
  await connection.end();

  const options = {
    hostname: '127.0.0.1',
    port: 8001,
    path: '/api/prepas/published',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };

  const req = http.request(options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        console.log('--- REPONSE DE L API ---');
        parsedData.data.forEach(p => {
            console.log('Prepa:', p.nom, '| is_inscribed:', p.is_inscribed);
        });
      } catch (e) {
        console.error(e.message);
      }
    });
  });

  req.end();
}

testApi();