const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Annonce = require('../models/annonce');
const Admin = require('../models/admin');
const NotificationService = require('../services/notificationService');

// Middleware spécifique pour les forces de l'ordre
const lawEnforcementCheck = roleCheck(['police', 'gendarmerie']);

// Obtenir les statistiques
router.get('/stats', auth, lawEnforcementCheck, async (req, res) => {
  try {
    const stats = {
      totalCases: await Annonce.countDocuments({ type: 'found' }),
      activeCases: await Annonce.countDocuments({ type: 'found', status: 'active' }),
      resolvedCases: await Annonce.countDocuments({ type: 'found', status: 'resolved' }),
      pendingValidation: await Annonce.countDocuments({ type: 'found', status: 'pending' })
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// Recherche avancée
router.get('/search', auth, lawEnforcementCheck, async (req, res) => {
  try {
    const { q, type, status, date, location } = req.query;
    const query = { type: 'found' };

    if (q) {
      query.$or = [
        { description: new RegExp(q, 'i') },
        { location: new RegExp(q, 'i') },
        { reference: new RegExp(q, 'i') }
      ];
    }

    if (type) query.itemType = type;
    if (status) query.status = status;
    if (location) query.location = new RegExp(location, 'i');
    if (date) {
      const searchDate = new Date(date);
      query.createdAt = {
        $gte: searchDate,
        $lt: new Date(searchDate.setDate(searchDate.getDate() + 1))
      };
    }

    const annonces = await Annonce.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(annonces);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la recherche' });
  }
});

// Générer un rapport PDF
router.get('/report/:id', auth, lawEnforcementCheck, async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    // Ici, vous pouvez utiliser une bibliothèque comme PDFKit pour générer le PDF
    // Pour l'exemple, nous renvoyons juste un texte
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-${req.params.id}.pdf`);
    res.send('Contenu du rapport PDF'); // À remplacer par la génération réelle du PDF
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du rapport' });
  }
});

// Marquer un cas comme sensible
router.put('/:id/sensitive', auth, lawEnforcementCheck, async (req, res) => {
  try {
    const annonce = await Annonce.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          isSensitive: true,
          sensitiveReason: req.body.reason,
          sensitiveMarkedBy: req.admin._id
        }
      },
      { new: true }
    );

    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    // Notifier les administrateurs
    const admins = await Admin.find({ role: 'super_admin' });
    await NotificationService.createBroadcastNotification(
      admins.map(admin => admin._id),
      `Cas sensible marqué par ${req.admin.nom} ${req.admin.prenom}`,
      'high'
    );

    res.json(annonce);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// Ajouter une note à un cas
router.post('/:id/notes', auth, lawEnforcementCheck, async (req, res) => {
  try {
    const annonce = await Annonce.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            content: req.body.content,
            author: req.admin._id,
            visibility: req.body.visibility || 'law_enforcement'
          }
        }
      },
      { new: true }
    );

    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    res.json(annonce);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la note' });
  }
});

module.exports = router;
