const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

async function createDefaultAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB Atlas');

        // Vérifier si l'admin existe déjà
        const existingAdmin = await User.findOne({ email: 'admin@ovpr.com' });
        if (existingAdmin) {
            console.log('ℹ️ L\'administrateur existe déjà');
            process.exit(0);
        }

        // Créer l'admin
        const admin = new User({
            firstName: 'Admin',
            lastName: 'OVPR',
            email: 'admin@ovpr.com',
            password: 'admin123',
            phone: '0000000000',
            role: 'admin'
        });

        await admin.save();
        console.log('✅ Administrateur créé avec succès');
        console.log('Email: admin@ovpr.com');
        console.log('Mot de passe: admin123');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

createDefaultAdmin();
