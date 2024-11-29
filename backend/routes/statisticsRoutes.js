const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const authMiddleware = require('../middleware/auth');

// Routes protégées par authentification
router.use(authMiddleware);

// Statistiques de base
router.get('/', statisticsController.getBasicStats);

// Statistiques avancées
router.get('/advanced', statisticsController.getAdvancedStats);

// Export des statistiques
router.get('/export', statisticsController.exportStats);

module.exports = router;
