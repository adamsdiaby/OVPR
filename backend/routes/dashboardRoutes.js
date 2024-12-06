const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Routes protégées par authentification et rôle admin
router.use(auth);
router.use(isAdmin);

// Route pour obtenir les notifications
router.get('/notifications', dashboardController.getNotifications);

// Route pour obtenir les statistiques du dashboard
router.get('/stats', dashboardController.getDashboardStats);

// Route pour obtenir les activités récentes
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
