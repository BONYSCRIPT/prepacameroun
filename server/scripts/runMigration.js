const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigration() {
    console.log('🗄️ Démarrage de la migration base de données...\n');
    
    try {
        // Lire le fichier SQL
        const migrationPath = path.join(__dirname, '../migrations/add_google_auth_fields.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Diviser les requêtes SQL
        const queries = migrationSQL
            .split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0 && !query.startsWith('--'));
        
        console.log(`📋 ${queries.length} requêtes à exécuter...\n`);
        
        // Exécuter chaque requête
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            
            if (query.toLowerCase().includes('select')) {
                console.log(`🔍 Exécution requête ${i + 1}: SELECT...`);
                const [results] = await db.query(query);
                console.log('✅ Résultat:', results);
            } else if (query.toLowerCase().includes('describe')) {
                console.log(`📊 Exécution requête ${i + 1}: DESCRIBE...`);
                const [results] = await db.query(query);
                console.log('✅ Structure de la table users:');
                console.table(results);
            } else {
                console.log(`⚙️ Exécution requête ${i + 1}: ${query.substring(0, 50)}...`);
                await db.query(query);
                console.log('✅ Requête exécutée avec succès');
            }
        }
        
        console.log('\n🎉 Migration terminée avec succès !');
        
        // Vérifier les données
        console.log('\n📊 Vérification des données...');
        const [users] = await db.query('SELECT id, username, email, provider, google_id, firebase_uid FROM users LIMIT 5');
        console.table(users);
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        throw error;
    }
}

// Exécuter la migration
if (require.main === module) {
    runMigration()
        .then(() => {
            console.log('\n✅ Script terminé avec succès');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Échec du script:', error);
            process.exit(1);
        });
}

module.exports = runMigration;
