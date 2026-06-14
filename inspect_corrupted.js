const fs = require('fs');

const files = [
    'axiosConfig.jsx',
    'client/src/Composants/GoogleSignInButton.jsx',
    'client/src/Composants/Navbar.jsx',
    'client/src/Pages/ForgotPassword.jsx',
    'client/src/Pages/Menu.jsx',
    'find_encoding_errors.js',
    'server/ecosystem.config.js',
    'server/middleware/firebaseValidation.js',
    'server/middleware/userValidation.js',
    'server/routes/userRoutes.js',
    'server/utils/emailService.js',
    'server/utils/errorHandler.js',
    'server/utils/logger.js',
    'UserPrivateRoute.jsx'
];

files.forEach(f => {
    try {
        const lines = fs.readFileSync(f, 'utf8').split('\n');
        lines.forEach((l, i) => {
            if (l.includes('\uFFFD') || l.includes('Ã©')) {
                console.log(`${f}:${i + 1}:${l.trim()}`);
            }
        });
    } catch (e) {
        console.log(`Error reading ${f}: ${e.message}`);
    }
});
