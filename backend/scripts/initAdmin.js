require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/admin');

const initSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ovpr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Vérifier si un super admin existe déjà
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('Un super administrateur existe déjà');
      process.exit(0);
    }

    // Créer le super admin par défaut
    const superAdmin = new Admin({
      email: 'admin@ovpr.fr',
      password: 'Admin@123',
      nom: 'Admin',
      prenom: 'Super',
      role: 'super_admin',
      status: 'actif',
      permissions: Admin.getDefaultPermissions('super_admin')
    });

    await superAdmin.save();
    console.log('Super administrateur créé avec succès');
    console.log('Email: admin@ovpr.fr');
    console.log('Mot de passe: Admin@123');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.disconnect();
  }
};

initSuperAdmin();
