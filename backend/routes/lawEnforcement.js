const express = require('express');
const router = express.Router();
const lawEnforcementController = require('../controllers/lawEnforcementController');
const annonceController = require('../controllers/annonceController');
const { verifyToken } = require('../middleware/auth');

// Middleware pour vérifier le rôle forces de l'ordre
const checkLawEnforcementRole = (req, res, next) => {
    const allowedRoles = ['police', 'gendarmerie'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
            message: 'Accès réservé aux forces de l\'ordre' 
        });
    }
    next();
};

// Obtenir les statistiques
router.get('/stats', verifyToken, checkLawEnforcementRole, lawEnforcementController.getStats);

// Obtenir les objets volés
router.get('/stolen', verifyToken, checkLawEnforcementRole, async (req, res) => {
    try {
        const annonces = await annonceController.findAnnoncesByStatus('stolen');
        res.json(annonces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Recherche avancée
router.get('/search', verifyToken, checkLawEnforcementRole, async (req, res) => {
    try {
        const { query, dateStart, dateEnd, location } = req.query;
        const filters = { status: 'stolen' };

        if (location) {
            filters.location = new RegExp(location, 'i');
        }

        if (dateStart || dateEnd) {
            filters.createdAt = {};
            if (dateStart) filters.createdAt.$gte = new Date(dateStart);
            if (dateEnd) filters.createdAt.$lte = new Date(dateEnd);
        }

        const annonces = await annonceController.findAnnoncesByFilters(filters);
        res.json(annonces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Marquer un cas comme sensible
router.put('/:id/sensitive', verifyToken, checkLawEnforcementRole, lawEnforcementController.markSensitive);

// Ajouter une note à un cas
router.post('/:id/notes', verifyToken, checkLawEnforcementRole, lawEnforcementController.addNote);

// Générer un rapport PDF
router.get('/report/:id', verifyToken, checkLawEnforcementRole, lawEnforcementController.generateReport);

module.exports = router;
