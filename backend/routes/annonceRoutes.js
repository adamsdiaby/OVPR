const express = require('express');
const router = express.Router();
const Annonce = require('../models/Annonce');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const annonceController = require('../controllers/annonceController');
const { verifyToken } = require('../middleware/auth');

// Routes publiques (pas besoin d'authentification)
router.get('/', annonceController.getAnnonces);
router.get('/stats', annonceController.getAnnonceStats);
router.get('/:id', annonceController.getAnnonceById);

// Routes protégées (nécessitent une authentification JWT)
router.get('/user/annonces', verifyToken, annonceController.getUserAnnonces);
router.post('/', verifyToken, annonceController.createAnnonce);
router.put('/:id', verifyToken, annonceController.updateAnnonce);
router.delete('/:id', verifyToken, annonceController.deleteAnnonce);

// Routes administrateur
// Récupérer toutes les annonces (avec filtres)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const annonces = await Annonce.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'username email');

    const total = await Annonce.countDocuments(query);

    res.json({
      annonces,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les annonces en attente de validation
router.get('/admin/pending', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const annonces = await Annonce.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'username email');

    const total = await Annonce.countDocuments({ status: 'pending' });

    res.json({
      annonces,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approuver une annonce
router.post('/admin/:id/approve', adminAuth, async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    annonce.status = 'approved';
    annonce.moderatedAt = new Date();
    annonce.moderatedBy = req.user._id;
    await annonce.save();

    res.json({ message: 'Annonce approuvée avec succès', annonce });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rejeter une annonce
router.post('/admin/:id/reject', adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'La raison du rejet est requise' });
    }

    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    annonce.status = 'rejected';
    annonce.rejectionReason = reason;
    annonce.moderatedAt = new Date();
    annonce.moderatedBy = req.user._id;
    await annonce.save();

    res.json({ message: 'Annonce rejetée avec succès', annonce });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les signalements
router.get('/admin/reports', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('annonce')
      .populate('reportedBy', 'username email');

    const total = await Report.countDocuments();

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Traiter un signalement
router.post('/admin/reports/:id/process', adminAuth, async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!action || (action === 'reject' && !reason)) {
      return res.status(400).json({ message: 'Action et raison requises pour le rejet' });
    }

    const report = await Report.findById(req.params.id)
      .populate('annonce');
      
    if (!report) {
      return res.status(404).json({ message: 'Signalement non trouvé' });
    }

    report.status = action === 'approve' ? 'approved' : 'rejected';
    report.processedAt = new Date();
    report.processedBy = req.user._id;
    
    if (action === 'reject') {
      report.rejectionReason = reason;
    }

    await report.save();

    // Si le signalement est approuvé, on met à jour l'annonce
    if (action === 'approve' && report.annonce) {
      report.annonce.status = 'reported';
      await report.annonce.save();
    }

    res.json({ message: 'Signalement traité avec succès', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
