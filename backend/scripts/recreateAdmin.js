const mongoose = require('mongoose');
const Admin = require('../models/admin');
require('dotenv').config();

const recreateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'admin@ovpr.fr';
        
        // Supprimer l'admin existant
        await Admin.deleteOne({ email });

        // Créer un nouvel admin
        const admin = new Admin({
            email,
            password: 'Admin@123',
            nom: 'Admin',
            prenom: 'Super',
            role: 'super_admin',
            status: 'actif',
            permissions: {
                annonces: {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    validate: true
                },
                signalements: {
                    read: true,
                    process: true,
                    delete: true
                },
                statistiques: {
                    read: true,
                    export: true
                },
                admins: {
                    create: true,
                    read: true,
                    update: true,
                    delete: true
                },
                alertes: {
                    create: true,
                    read: true,
                    update: true,
                    broadcast: true
                },
                biens: {
                    recherche: true,
                    declaration: true,
                    modification: true
                }
            }
        });

        await admin.save();

        console.log('Admin recréé avec succès');
        console.log('Email:', email);
        console.log('Mot de passe:', 'Admin@123');

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await mongoose.connection.close();
    }
};

recreateAdmin();
