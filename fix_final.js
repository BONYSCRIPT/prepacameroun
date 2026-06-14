const fs = require('fs');

const finalFixes = [
    {
        file: 'axiosConfig.jsx',
        fixes: [
            { search: "rponse", replace: "réponse" }
        ]
    },
    {
        file: 'client/src/Composants/GoogleSignInButton.jsx',
        fixes: [
            { search: "rponse", replace: "réponse" }
        ]
    },
    {
        file: 'client/src/Pages/Menu.jsx',
        fixes: [
            { search: "Connexion russie", replace: "Connexion réussie" },
            { search: "Inscription russie", replace: "Inscription réussie" }
        ]
    },
    {
        file: 'server/ecosystem.config.js',
        fixes: [
            { search: "contrleurs", replace: "contrôleurs" }
        ]
    },
    {
        file: 'server/routes/userRoutes.js',
        fixes: [
            { search: "contrleur", replace: "contrôleur" }
        ]
    }
];

for (const { file, fixes } of finalFixes) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        for (const { search, replace } of fixes) {
            // The  character may be interpreted as the literal uFFFD by v8 
            const replacementChar = '\uFFFD';
            if (search.includes('')) {
                const trueSearch = search.replace('', replacementChar);
                content = content.split(trueSearch).join(replace);
                content = content.split(search).join(replace); // just in case
            }
        }
        fs.writeFileSync(file, content, 'utf8');
    } catch (e) {
    }
}
console.log('Final fixes applied.');
