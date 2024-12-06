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
            ...defaultAdmin,
            password: hashedPassword,
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
        console.log('Administrateur par défaut créé avec succès');
        console.log('Email:', defaultAdmin.email);
        console.log('Mot de passe:', defaultAdmin.password);

    } catch (error) {
        console.error('Erreur lors de la création de l\'admin:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createDefaultAdmin();
