const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Routes publiques (pas besoin d'authentification)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Routes protégées (nécessitent une authentification JWT)
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);

module.exports = router;
