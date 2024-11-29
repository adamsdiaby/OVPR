const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware pour vérifier si l'admin est un super_admin
const isSuperAdmin = roleCheck(['super_admin']);

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (admin.status === 'inactif') {
      return res.status(403).json({ message: 'Votre compte a été désactivé' });
    }

    // Mise à jour de la dernière connexion
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        nom: admin.nom,
        prenom: admin.prenom,
        permissions: admin.permissions,
        status: admin.status
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Vérifier le statut de l'admin
router.get('/status', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }
    res.json({ status: admin.status });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir la liste des administrateurs
router.get('/users', auth, isSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un nouvel administrateur
router.post('/users', auth, isSuperAdmin, async (req, res) => {
  try {
    const { email, password, nom, prenom, role, permissions } = req.body;

    // Vérifier si l'email existe déjà
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const admin = new Admin({
      email,
      password,
      nom,
      prenom,
      role,
      permissions,
      createdBy: req.user.id
    });

    await admin.save();
    res.status(201).json({ message: 'Administrateur créé avec succès' });
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un administrateur
router.put('/users/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const { email, password, nom, prenom, role, permissions } = req.body;
    const adminId = req.params.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }

    // Vérifier si l'email existe déjà pour un autre admin
    const existingAdmin = await Admin.findOne({ email, _id: { $ne: adminId } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    admin.email = email;
    admin.nom = nom;
    admin.prenom = prenom;
    admin.role = role;
    admin.permissions = permissions;

    if (password) {
      admin.password = password;
    }

    await admin.save();
    res.json({ message: 'Administrateur mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Changer le statut d'un administrateur
router.put('/users/:id/status', auth, isSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const adminId = req.params.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }

    // Empêcher la désactivation du dernier super admin
    if (admin.role === 'super_admin' && status === 'inactif') {
      const superAdminCount = await Admin.countDocuments({
        role: 'super_admin',
        status: 'actif'
      });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          message: 'Impossible de désactiver le dernier super administrateur'
        });
      }
    }

    admin.status = status;
    await admin.save();
    res.json({ message: 'Statut mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur changement statut:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un administrateur
router.delete('/users/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }

    // Empêcher la suppression du dernier super admin
    if (admin.role === 'super_admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          message: 'Impossible de supprimer le dernier super administrateur'
        });
      }
    }

    await Admin.findByIdAndDelete(adminId);
    res.json({ message: 'Administrateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
