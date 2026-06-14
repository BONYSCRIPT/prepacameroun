const fs = require('fs');

const scriptReplacesReverse = {
    'axiosConfig.jsx': [
        ["Création", "Cration"],
        ["requêtes", "requtes"],
        ["gérer", "grer"],
        ["réponse", "rponse"],
        ["autorisé", "autoris"],
        ["expiré", "expir"],
        ["déconnectez", "dconnectez"]
    ],
    'client/src/Composants/GoogleSignInButton.jsx': [
        ["Thème", "Thme"],
        ["cohérent", "cohrent"],
        ["récupération", "rcupration"],
        ["spécifiques", "spcifiques"],
        ["annulée", "annule"],
        ["bloquée", "bloque"],
        ["vérification", "vrification"],
        ["réponse", "rponse"]
    ],
    'client/src/Composants/Navbar.jsx': [
        ["après", "aprs"],
        ["réussi", "russi"],
        ["réussie", "russie"],
        ["vérifier", "vrifier"],
        ["vérifié", "vrifi"],
        ["état", "tat"],
        ["données", "donnes"],
        ["à jour", " jour"]
    ],
    'client/src/Pages/ForgotPassword.jsx': [
        ["réinitialisation", "rinitialisation"],
        ["été", "t"],
        ["envoyé", "envoy"],
        ["à votre adresse.", " votre adresse."]
    ],
    'client/src/Pages/Menu.jsx': [
        ["après", "aprs"],
        ["vérification", "vrification"],
        ["réussie", "russie"],
        ["vérifier", "vrifier"],
        ["vérifié", "vrifi"],
        ["état", "tat"],
        ["données", "donnes"],
        ["à jour", " jour"]
    ],
    'server/ecosystem.config.js': [
        ["contrôleurs", "contrleurs"]
    ],
    'server/middleware/firebaseValidation.js': [
        ["Schéma", "Schma"],
        ["activé", "activ"],
        ["Données", "Donnes"]
    ],
    'server/middleware/userValidation.js': [
        ["caractères", "caractres"],
        ["dépasser", "dpasser"],
        ["spécial", "spcial"],
        ["oublié", "oubli"],
        ["réinitialisation", "rinitialisation"]
    ],
    'server/routes/userRoutes.js': [
        ["Mettez à jour", "Mettez  jour"],
        ["contrôleur", "contrleur"],
        ["gérer", "grer"],
        ["réinitialisation", "rinitialisation"]
    ],
    'server/utils/emailService.js': [
        ["Réinitialisation", "Rinitialisation"],
        ["réinitialisation", "rinitialisation"],
        ["demandé", "demand"],
        ["créer", "crer"],
        ["sécurité", "scurit"],
        ["équipe", "quipe"]
    ],
    'server/utils/errorHandler.js': [
        ["gérée", "gre"],
        ["complète", "complte"],
        ["autorisé", "autoris"],
        ["spécifique", "spcifique"],
        ["nécessaire", "ncessaire"],
        ["vérifié", "vrifi"]
    ],
    'server/utils/logger.js': [
        ["Crée", "Cre"],
        ["nécessaire", "ncessaire"]
    ],
    'UserPrivateRoute.jsx': [
        ["État", "tat"],
        ["vérifié", "vrifi"],
        ["Empêcher", "Empcher"],
        ["protégées", "protges"],
        ["authentifié", "authentifi"]
    ]
};

for (const [file, reverses] of Object.entries(scriptReplacesReverse)) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        for (const [search, replace] of reverses) {
            content = content.split(search).join(replace);
        }
        fs.writeFileSync(file, content, 'utf8');
    } catch (e) {
    }
}

// Now apply CORRECT replacements that include \uFFFD !!
const correctReplaces = {
    'axiosConfig.jsx': [
        ["Cr\uFFFDation", "Création"],
        ["requ\uFFFDtes", "requêtes"],
        ["g\uFFFDrer", "gérer"],
        ["r\uFFFDonse", "réponse"],
        ["autoris\uFFFD", "autorisé"],
        ["expir\uFFFD", "expiré"],
        ["d\uFFFDconnectez", "déconnectez"]
    ],
    'client/src/Composants/GoogleSignInButton.jsx': [
        ["Th\uFFFDme", "Thème"],
        ["coh\uFFFDrent", "cohérent"],
        ["r\uFFFDcup\uFFFDrati", "récupérati"],
        ["sp\uFFFDcifiques", "spécifiques"],
        ["annul\uFFFDe", "annulée"],
        ["bloqu\uFFFDe", "bloquée"],
        ["v\uFFFDrification", "vérification"],
        ["r\uFFFDonse", "réponse"]
    ],
    'client/src/Composants/Navbar.jsx': [
        ["apr\uFFFDs", "après"],
        ["r\uFFFDussi", "réussi"],
        ["r\uFFFDeussie", "réussie"],
        ["v\uFFFDrifier", "vérifier"],
        ["v\uFFFDrifi\uFFFD", "vérifié"],
        ["l'\uFFFDtat", "l'état"],
        ["donn\uFFFDes", "données"],
        ["\uFFFD jour", "à jour"]
    ],
    'client/src/Pages/ForgotPassword.jsx': [
        ["r\uFFFDinitialisation", "réinitialisation"],
        ["a \uFFFDt\uFFFD envoy\uFFFDe \uFFFD", "a été envoyée à"],
        ["\uFFFDt\uFFFD", "été"],
        ["envoy\uFFFDe", "envoyée"]
    ],
    'client/src/Pages/Menu.jsx': [
        ["apr\uFFFDs", "après"],
        ["v\uFFFDrification", "vérification"],
        ["r\uFFFDeussie", "réussie"],
        ["v\uFFFDrifier", "vérifier"],
        ["v\uFFFDrifi\uFFFD", "vérifié"],
        ["l'\uFFFDtat", "l'état"],
        ["donn\uFFFDes", "données"],
        ["\uFFFD jour", "à jour"]
    ],
    'server/ecosystem.config.js': [
        ["contr\uFFFDeurs", "contrôleurs"]
    ],
    'server/middleware/firebaseValidation.js': [
        ["Sch\uFFFDma", "Schéma"],
        ["activ\uFFFD", "activé"],
        ["Donn\uFFFDes", "Données"]
    ],
    'server/middleware/userValidation.js': [
        ["caract\uFFFDes", "caractères"],
        ["caract\uFFFDr", "caractèr"],
        ["d\uFFFDpasser", "dépasser"],
        ["sp\uFFFDcial", "spécial"],
        ["oubli\uFFFD", "oublié"],
        ["r\uFFFDinitialisation", "réinitialisation"]
    ],
    'server/routes/userRoutes.js': [
        ["Mettez \uFFFD jour", "Mettez à jour"],
        ["contr\uFFFDeur", "contrôleur"],
        ["g\uFFFDrer", "gérer"],
        ["r\uFFFDinitialisation", "réinitialisation"]
    ],
    'server/utils/emailService.js': [
        ["R\uFFFDinitialisation", "Réinitialisation"],
        ["r\uFFFDinitialisation", "réinitialisation"],
        ["demand\uFFFD", "demandé"],
        ["cr\uFFFDer", "créer"],
        ["s\uFFFDcurit\uFFFD", "sécurité"],
        ["\uFFFDquipe", "équipe"]
    ],
    'server/utils/errorHandler.js': [
        ["g\uFFFDr\uFFFDe", "gérée"],
        ["compl\uFFFDte", "complète"],
        ["autoris\uFFFD", "autorisé"],
        ["sp\uFFFDcifique", "spécifique"],
        ["n\uFFFDcessaire", "nécessaire"],
        ["v\uFFFDrifi\uFFFD", "vérifié"]
    ],
    'server/utils/logger.js': [
        ["Cr\uFFFDe", "Crée"],
        ["n\uFFFDcessaire", "nécessaire"]
    ],
    'UserPrivateRoute.jsx': [
        ["\uFFFDtat", "État"],
        ["v\uFFFDrifi\uFFFD", "vérifié"],
        ["Emp\uFFFDcher", "Empêcher"],
        ["prot\uFFFDg\uFFFDes", "protégées"],
        ["authentifi\uFFFD", "authentifié"]
    ]
};

for (const [file, replaces] of Object.entries(correctReplaces)) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        for (const [search, replace] of replaces) {
            if (content.includes(search)) {
                content = content.split(search).join(replace);
            }
        }
        fs.writeFileSync(file, content, 'utf8');
    } catch (e) {
    }
}

console.log('Reverse and correction applied.');
