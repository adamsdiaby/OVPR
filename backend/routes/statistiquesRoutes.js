const express = require('express');
const router = express.Router();
const statistiquesController = require('../controllers/statistiquesController');
const adminAuth = require('../middleware/adminAuth');

// Routes statistiques (protégées par authentification admin)
router.get('/', adminAuth, statistiquesController.getBasicStats);
router.get('/advanced', adminAuth, statistiquesController.getAdvancedStats);
router.get('/signalements/stats', adminAuth, statistiquesController.getSignalementStats);

module.exports = router;
