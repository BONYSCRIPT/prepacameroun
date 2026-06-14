const fs = require('fs');

try {
    let content;

    // server/middleware/userValidation.js
    content = fs.readFileSync('server/middleware/userValidation.js', 'utf8');
    content = content.replace(/autoris\uFFFD/g, 'autorisé');
    fs.writeFileSync('server/middleware/userValidation.js', content, 'utf8');

    // server/utils/emailService.js
    content = fs.readFileSync('server/utils/emailService.js', 'utf8');
    content = content.replace(/R\uFFFDinitialiser/g, 'Réinitialiser');
    fs.writeFileSync('server/utils/emailService.js', content, 'utf8');

    // UserPrivateRoute.jsx
    content = fs.readFileSync('UserPrivateRoute.jsx', 'utf8');
    content = content.replace(/v\uFFFDrification/g, 'vérification');
    fs.writeFileSync('UserPrivateRoute.jsx', content, 'utf8');

    // client/src/Pages/ForgotPassword.jsx
    content = fs.readFileSync('client/src/Pages/ForgotPassword.jsx', 'utf8');
    content = content.replace(/envoy\uFFFD \uFFFD/g, 'envoyé à');
    fs.writeFileSync('client/src/Pages/ForgotPassword.jsx', content, 'utf8');

    console.log("Regex replacements finished.");
} catch (e) {
    console.log("Error:", e);
}
