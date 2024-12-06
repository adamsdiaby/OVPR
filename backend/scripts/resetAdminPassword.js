const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');
require('dotenv').config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'admin@ovpr.fr';
        const newPassword = 'Admin@123';

        // Trouver l'admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.error('Admin non trouvé');
            return;
        }

        // Hasher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Mettre à jour le mot de passe et le statut
        admin.password = hashedPassword;
        admin.status = 'actif';
        admin.role = 'super_admin';

        await admin.save();

        console.log('Mot de passe admin réinitialisé avec succès');
        console.log('Email:', email);
        console.log('Nouveau mot de passe:', newPassword);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await mongoose.connection.close();
    }
};

resetAdminPassword();
