const argon2 = require('argon2');

// NOUVELLES CLÉS ADMIN (à garder secrètes)
const adminKey1 = 'K9mP3xR7wQ2nL5hJ8sF4gD6vB1cE9tY0';
const adminKey2 = 'M4nB8uI2oP6aS9dG3xH7jK1lM5nQ4rT8';

async function hashKeys() {
    try {
        const hashedKey1 = await argon2.hash(adminKey1);
        const hashedKey2 = await argon2.hash(adminKey2);

        console.log('=== NOUVELLES CLÉS ADMIN HASHÉES ===');
        console.log('');
        console.log('ADMIN_KEY_1=' + hashedKey1);
        console.log('ADMIN_KEY_2=' + hashedKey2);
        console.log('');
        console.log('=== À COPIER DANS .env ===');
        console.log('Remplacez les lignes ADMIN_KEY_1 et ADMIN_KEY_2 dans votre .env');
        console.log('');
        console.log('=== CLÉS EN CLAIR (GARDEZ PRÉCIEUSEMENT) ===');
        console.log('adminKey1 (clair):', adminKey1);
        console.log('adminKey2 (clair):', adminKey2);
    } catch (error) {
        console.error('Erreur lors du hashage:', error);
    }
}

hashKeys();

