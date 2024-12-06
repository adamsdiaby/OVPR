const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Route pour obtenir les statistiques des utilisateurs
router.get('/users/stats', auth, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const suspendedUsers = await User.countDocuments({ status: 'suspended' });
        const adminUsers = await User.countDocuments({ role: 'admin' });

        res.json({
            total: totalUsers,
            active: activeUsers,
            suspended: suspendedUsers,
            admins: adminUsers
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
});

// Route pour obtenir tous les utilisateurs
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
});

// Route pour mettre à jour le statut d'un utilisateur
router.put('/users/:userId/status', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { status },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
});

// Route pour obtenir les utilisateurs suspendus
router.get('/users/suspended', auth, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ status: 'suspended' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs suspendus" });
    }
});

module.exports = router;
