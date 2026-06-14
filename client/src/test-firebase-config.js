// Test de la configuration Firebase
console.log('🧪 Test de la configuration Firebase...');

try {
  console.log('📋 Variables d\'environnement Firebase:');
  console.log('- API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Définie ✅' : 'Manquante ❌');
  console.log('- Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Manquante ❌');
  console.log('- Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Manquante ❌');
  console.log('- Storage Bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'Manquante ❌');
  console.log('- Messaging Sender ID:', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'Manquante ❌');
  console.log('- App ID:', import.meta.env.VITE_FIREBASE_APP_ID || 'Manquante ❌');
  
  console.log('🎉 Configuration Firebase frontend prête !');
} catch (error) {
  console.error('❌ Erreur lors du test Firebase:', error);
}
