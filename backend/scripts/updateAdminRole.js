const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

async function updateAdminRole() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB Atlas');

        const result = await User.updateOne(
            { email: 'admin@ovpr.com' },
            { 
                $set: { 
                    role: 'admin',
                    status: 'active'
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Rôle admin mis à jour avec succès');
        } else {
            console.log('ℹ️ Aucune modification nécessaire');
        }

        // Vérifier l'utilisateur mis à jour
        const admin = await User.findOne({ email: 'admin@ovpr.com' });
        console.log('État actuel de l\'admin:', admin);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updateAdminRole();
