module.exports = {
  apps: [{
    name: 'prepacameroun',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: [
      'server.js',        // Surveiller le fichier principal
      'routes',           // Surveiller le dossier des routes
      'controllers',      // Surveiller le dossier des contrôleurs
      'utils',            // Surveiller le dossier des utilitaires
      'config',           // Surveiller le dossier de configuration
      'middleware',       // Surveiller le dossier des middlewares
    ],
    watch_options: {
      usePolling: false // Utiliser le polling si la surveillance native ne fonctionne pas
    },
    max_memory_restart: '1G',
    output: 'combined.log',
    error: 'error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    env: {
      NODE_ENV: 'production',
    },
  }],
};