const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

async function createAdminWithRole() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB Atlas');

        // Supprimer l'ancien admin s'il existe
        await User.deleteOne({ email: 'admin@ovpr.com' });

        // Créer un nouvel admin avec le rôle explicite
        const admin = new User({
            firstName: 'Admin',
            lastName: 'OVPR',
            email: 'admin@ovpr.com',
            password: 'admin123',
            phone: '0000000000',
            role: 'admin'
        });

        await admin.save();
        
        // Vérifier que l'admin a été créé avec le bon rôle
        const createdAdmin = await User.findOne({ email: 'admin@ovpr.com' }).select('+role');
        console.log('✅ Administrateur créé avec succès');
        console.log('Email: admin@ovpr.com');
        console.log('Mot de passe: admin123');
        console.log('Rôle:', createdAdmin.role);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

createAdminWithRole();
