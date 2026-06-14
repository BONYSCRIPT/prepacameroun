const fs = require('fs');

const remainingReplaces = [
    {
        file: 'axiosConfig.jsx',
        fixes: [
            { search: "r\uFFFDonse", replace: "réponse" }
        ]
    },
    {
        file: 'client/src/Composants/GoogleSignInButton.jsx',
        fixes: [
            { search: "r\uFFFDonse", replace: "réponse" }
        ]
    },
    {
        file: 'client/src/Pages/ForgotPassword.jsx',
        fixes: [
            { search: "envoy\uFFFD \uFFFD", replace: "envoyé à" }
        ]
    },
    {
        file: 'client/src/Pages/Menu.jsx',
        fixes: [
            { search: "r\uFFFDeussie", replace: "réussie" },
            { search: "V\uFFFDrifier", replace: "Vérifier" },
            { search: "due \uFFFD", replace: "due à" }
        ]
    },
    {
        file: 'server/ecosystem.config.js',
        fixes: [
            { search: "contr\uFFFDeurs", replace: "contrôleurs" }
        ]
    },
    {
        file: 'server/middleware/userValidation.js',
        fixes: [
            { search: "autoris\uFFFD", replace: "autorisé" }
        ]
    },
    {
        file: 'server/routes/userRoutes.js',
        fixes: [
            { search: "contr\uFFFDeur", replace: "contrôleur" }
        ]
    },
    {
        file: 'server/utils/emailService.js',
        fixes: [
            { search: "R\uFFFDinitialiser", replace: "Réinitialiser" }
        ]
    },
    {
        file: 'UserPrivateRoute.jsx',
        fixes: [
            { search: "v\uFFFDrification", replace: "vérification" }
        ]
    }
];

for (const { file, fixes } of remainingReplaces) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        for (const { search, replace } of fixes) {
            content = content.split(search).join(replace);
        }
        fs.writeFileSync(file, content, 'utf8');
    } catch (e) {
    }
}
