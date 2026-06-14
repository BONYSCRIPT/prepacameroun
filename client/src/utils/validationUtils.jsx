// validationUtils.js

// Validate username
export const validateUsername = (username) => {
    console.log('Validating username:', username);
    if (!username) return "Le nom d'utilisateur est requis";
    if (username.length < 3 || username.length > 30) return "Le nom d'utilisateur doit contenir entre 3 et 30 caractères";
    return "";
};

// Validate email
export const validateEmail = (email) => {
    console.log('Validating email:', email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) return "L'email est requis";
    if (!emailRegex.test(email)) return "Format d'email invalide";
    return "";
};

// Validate password
export const validatePassword = (password) => {
    console.log('Validating password');
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!password) return "Le mot de passe est requis";
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
    if (!passwordRegex.test(password)) return "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial";
    return "";
};

// Validate password confirmation
export const validateConfirmPassword = (password, confirmPassword) => {
    console.log('Validating password confirmation');
    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas";
    return "";
};

// Validate role
export const validateRole = (role) => {
    console.log('Validating role:', role);
    if (!['admin', 'super_admin'].includes(role)) return "Le rôle doit être soit 'admin' soit 'super_admin'";
    return "";
};

// Validate admin keys
export const validateAdminKey = (key) => {
    console.log('Validating admin key');
    if (!key) return "La clé d'administration est requise";
    return "";
};

// Validate all fields
export const validateForm = (formData) => {
    console.log('Validating entire form:', formData);
    const errors = {};
    errors.username = validateUsername(formData.username);
    errors.email = validateEmail(formData.email);
    errors.password = validatePassword(formData.password);
    errors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    errors.role = validateRole(formData.role);
    errors.adminKey1 = validateAdminKey(formData.adminKey1);
    errors.adminKey2 = validateAdminKey(formData.adminKey2);
    console.log('Form validation errors:', errors);
    return errors;
};

// Validate individual field
export const validateField = (fieldName, value, formData) => {
    console.log(`Validating field: ${fieldName}, value: ${fieldName === 'password' ? '[HIDDEN]' : value}`);
    let error = '';
    switch(fieldName) {
        case 'username':
            error = validateUsername(value);
            break;
        case 'email':
            error = validateEmail(value);
            break;
        case 'password':
            error = validatePassword(value);
            break;
        case 'confirmPassword':
            error = validateConfirmPassword(formData.password, value);
            break;
        case 'role':
            error = validateRole(value);
            break;
        case 'adminKey1':
        case 'adminKey2':
            error = validateAdminKey(value);
            break;
        default:
            console.warn(`Unknown field: ${fieldName}`);
    }
    console.log(`Validation result for ${fieldName}:`, error || 'Valid');
    return error;
};
