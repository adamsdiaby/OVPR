const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

async function createNewAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB Atlas');

        // Créer un nouvel admin
        const admin = new User({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'superadmin@ovpr.com',
            password: 'SuperAdmin123!',
            phone: '0000000000',
            role: 'admin'
        });

        await admin.save();
        console.log('✅ Nouvel administrateur créé avec succès');
        console.log('Email: superadmin@ovpr.com');
        console.log('Mot de passe: SuperAdmin123!');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

createNewAdmin();
