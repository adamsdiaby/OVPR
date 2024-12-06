const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Role = require('../../models/Role');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const mongoose = require('mongoose');

// Middleware pour vérifier les permissions d'admin
router.use(verifyToken, isAdmin);

// Récupérer tous les utilisateurs avec pagination et filtres
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status, 
      role 
    } = req.query;

    const query = {};
    
    // Appliquer les filtres
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les statistiques des utilisateurs
router.get('/stats', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'actif'] }, 1, 0] 
            }
          },
          suspended: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'suspendu'] }, 1, 0] 
            }
          },
          admins: { 
            $sum: { 
              $cond: [{ $in: ['$role', ['admin', 'super_admin']] }, 1, 0] 
            }
          }
        }
      }
    ]);

    res.json(stats[0] || { total: 0, active: 0, suspended: 0, admins: 0 });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les utilisateurs suspendus
router.get('/suspended', async (req, res) => {
  try {
    const suspendedUsers = await User.find({ status: 'suspendu' })
      .select('-password')
      .populate('suspendedBy', 'nom prenom')
      .sort({ suspensionDate: -1 });

    res.json(suspendedUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs suspendus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les rôles et permissions
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour les permissions d'un rôle
router.put('/roles/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      { $set: { permissions } },
      { new: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ message: 'Rôle non trouvé' });
    }

    res.json(updatedRole);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des permissions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Suspendre un utilisateur
router.put('/:userId/suspend', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          status: 'suspendu',
          suspensionDate: new Date(),
          suspensionReason: reason,
          suspendedBy: req.user._id
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la suspension:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Réactiver un utilisateur
router.put('/:userId/reactivate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { note } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          status: 'actif',
          reactivationDate: new Date(),
          reactivationNote: note,
          reactivatedBy: req.user._id
        },
        $unset: {
          suspensionDate: '',
          suspensionReason: '',
          suspendedBy: ''
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la réactivation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour le statut d'un utilisateur
router.put('/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { status } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
