const mongoose = require('mongoose');
const { defaultAdmin, hashPassword } = require('../config/defaultAdmin');
const Admin = require('../models/admin');
require('dotenv').config();

const createDefaultAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Vérifier si l'admin existe déjà
        const existingAdmin = await Admin.findOne({ email: defaultAdmin.email });
        if (existingAdmin) {
            console.log('L\'administrateur par défaut existe déjà');
            return;
        }

        // Créer le nouvel admin
        const hashedPassword = await hashPassword();
        const admin = new Admin({
            email: defaultAdmin.email,
            password: hashedPassword,
            role: defaultAdmin.role
        });

        await admin.save();
        console.log('Administrateur par défaut créé avec succès');

    } catch (error) {
        console.error('Erreur lors de la création de l\'admin:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createDefaultAdmin();
