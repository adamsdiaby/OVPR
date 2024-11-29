const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB Atlas');

        const admin = await User.findOne({ email: 'admin@ovpr.com' });
        if (admin) {
            console.log('✅ Admin trouvé dans la base de données:');
            console.log({
                id: admin._id,
                email: admin.email,
                role: admin.role,
                firstName: admin.firstName,
                lastName: admin.lastName
            });
        } else {
            console.log('❌ Aucun admin trouvé avec cet email');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkAdmin();
