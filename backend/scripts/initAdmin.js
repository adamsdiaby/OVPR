require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/admin');

const defaultPermissions = {
  annonces: {
    create: true,
    read: true,
    update: true,
    delete: true
  },
  signalements: {
    create: true,
    read: true,
    update: true,
    delete: true
  },
  admins: {
    create: true,
    read: true,
    update: true,
    delete: true
  }
};

const initSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ovpr');

    // Supprimer l'admin existant pour le recréer
    await Admin.deleteOne({ email: 'admin@ovpr.fr' });
    console.log('Ancien admin supprimé');

    // Créer le super admin par défaut avec le mot de passe non hashé
    const superAdmin = new Admin({
      email: 'admin@ovpr.fr',
      password: 'Admin@123', // Le hook pre-save va hasher le mot de passe
      nom: 'Admin',
      prenom: 'Super',
      role: 'super_admin',
      status: 'actif',
      permissions: defaultPermissions
    });

    await superAdmin.save();
    console.log('Super administrateur créé avec succès');
    console.log('Email: admin@ovpr.fr');
    console.log('Mot de passe: Admin@123');

    // Vérifier que l'admin a été créé correctement
    const createdAdmin = await Admin.findOne({ email: 'admin@ovpr.fr' }).select('+password');
    console.log('Vérification de l\'admin créé:', {
      id: createdAdmin._id,
      email: createdAdmin.email,
      role: createdAdmin.role,
      passwordLength: createdAdmin.password?.length
    });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.disconnect();
  }
};

initSuperAdmin();
