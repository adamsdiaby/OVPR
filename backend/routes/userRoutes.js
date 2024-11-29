const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Routes publiques (pas besoin d'authentification)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Routes protégées (nécessitent une authentification JWT)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;
