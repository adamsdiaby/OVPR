const mongoose = require('mongoose');
const Admin = require('../models/admin');
require('dotenv').config();

const verifyAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'admin@ovpr.fr';
        
        // Trouver l'admin et afficher ses informations
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.error('Admin non trouvé');
            return;
        }

        console.log('Informations admin trouvées:');
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('Status:', admin.status);
        console.log('Password Hash:', admin.password);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await mongoose.connection.close();
    }
};

verifyAdmin();
