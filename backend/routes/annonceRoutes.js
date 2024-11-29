const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonceController');
const auth = require('../middleware/auth');

// Routes publiques (pas besoin d'authentification)
router.get('/', annonceController.getAnnonces);
router.get('/:id', annonceController.getAnnonceById);

// Routes protégées (nécessitent une authentification JWT)
router.get('/user/annonces', auth, annonceController.getUserAnnonces);
router.post('/', auth, annonceController.createAnnonce);
router.put('/:id', auth, annonceController.updateAnnonce);
router.delete('/:id', auth, annonceController.deleteAnnonce);

module.exports = router;
