const express = require('express');
const router = express.Router();
const signalementController = require('../controllers/signalementController');
const { verifyToken } = require('../middleware/auth');

// Routes pour les signalements
router.get('/all', verifyToken, signalementController.getSignalements); // Route admin pour tous les signalements
router.get('/user', verifyToken, signalementController.getUserSignalements); // Signalements de l'utilisateur connecté
router.get('/:id', verifyToken, signalementController.getSignalementById);
router.post('/', verifyToken, signalementController.createSignalement);
router.put('/:id/process', verifyToken, signalementController.processSignalement);

module.exports = router;
