const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkInscriptions() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'prepacameroun_db'
    });
    
    console.log('--- TOUTES LES INSCRIPTIONS DE CET USER ---');
    const [inscriptions] = await connection.execute('SELECT * FROM inscriptions WHERE user_id = ?', ['fddeeb41-36ac-4c12-b495-b84302b3e5b3']);
    console.table(inscriptions);
    
    console.log('\n--- RESULTAT DE LA REQUETE APP POUR PREPAS ---');
    const query = 'SELECT p.id, p.nom, CASE WHEN i.id IS NOT NULL THEN TRUE ELSE FALSE END as is_inscribed FROM prepa_concours p LEFT JOIN inscriptions i ON p.id = i.prepa_id AND i.user_id = ? AND i.statut = \"active\" AND i.date_expiration > NOW() WHERE p.is_published = TRUE';
    const [publishedPrepaConcours] = await connection.execute(query, ['fddeeb41-36ac-4c12-b495-b84302b3e5b3']);
    console.table(publishedPrepaConcours);

    await connection.end();
  } catch (err) {
    console.error('Erreur:', err);
  }
}

checkInscriptions();