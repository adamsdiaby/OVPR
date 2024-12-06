const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const User = require('../models/user'); // Ajouter cette ligne
const { verifyToken } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dashboardController = require('../controllers/dashboardController');

// Middleware pour vérifier si l'admin est un super_admin
const isSuperAdmin = roleCheck(['super_admin']);

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentative de connexion pour:', email);
    
    // Explicitement sélectionner le champ password
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      console.log('Admin non trouvé pour:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    console.log('Admin trouvé:', {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      passwordLength: admin.password?.length
    });

    const isMatch = await admin.comparePassword(password);
    console.log('Résultat de la comparaison du mot de passe:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (admin.status === 'inactif') {
      console.log('Compte inactif pour:', email);
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

    console.log('Connexion réussie pour:', email);
    
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
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});

// Vérification du token
router.get('/verify', verifyToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) {
            return res.status(401).json({ message: 'Admin non trouvé' });
        }
        res.json({ user: admin });
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        res.status(500).json({ message: 'Erreur lors de la vérification du token' });
    }
});

// Vérifier le statut de l'admin
router.get('/status', verifyToken, async (req, res) => {
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
router.get('/users', verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un nouvel administrateur
router.post('/users', verifyToken, isSuperAdmin, async (req, res) => {
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
router.put('/users/:id', verifyToken, isSuperAdmin, async (req, res) => {
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
router.put('/users/:id/status', verifyToken, isSuperAdmin, async (req, res) => {
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
router.delete('/users/:id', verifyToken, isSuperAdmin, async (req, res) => {
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

// Routes pour la gestion des utilisateurs
router.get('/users/all', verifyToken, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.get('/users/roles', verifyToken, async (req, res) => {
    try {
        const roles = await User.distinct('role');
        const usersPerRole = await Promise.all(
            roles.map(async (role) => ({
                role,
                count: await User.countDocuments({ role })
            }))
        );
        res.json(usersPerRole);
    } catch (error) {
        console.error('Erreur lors de la récupération des rôles:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.get('/users/suspended', verifyToken, async (req, res) => {
    try {
        const suspendedUsers = await User.find({ status: 'suspended' })
            .select('-password')
            .sort({ updatedAt: -1 });
        res.json(suspendedUsers);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs suspendus:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour mettre à jour le rôle d'un utilisateur
router.put('/users/:userId/role', verifyToken, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Routes du dashboard
router.get('/dashboard/notifications', verifyToken, dashboardController.getNotifications);
router.get('/dashboard/stats', verifyToken, dashboardController.getDashboardStats);
router.get('/dashboard/recent-activity', verifyToken, dashboardController.getRecentActivity);

module.exports = router;
