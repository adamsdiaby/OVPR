const express = require('express');
const router = express.Router();
const signalementController = require('../controllers/signalementController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Toutes les routes de signalement nécessitent une authentification
// Routes pour utilisateurs authentifiés
router.post('/', auth, signalementController.createSignalement);
router.get('/user', auth, signalementController.getUserSignalements);

// Routes pour administrateurs uniquement
router.get('/', adminAuth, signalementController.getSignalements);
router.put('/:id/process', adminAuth, signalementController.processSignalement);

module.exports = router;
