const bcrypt = require('bcryptjs');

const defaultAdmin = {
    email: 'admin@ovpr.fr',
    password: 'Admin@123',
    role: 'super_admin',
    nom: 'Admin',
    prenom: 'System',
    status: 'actif'
};

// Hash du mot de passe par défaut
const hashPassword = async () => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(defaultAdmin.password, salt);
};

module.exports = { defaultAdmin, hashPassword };
