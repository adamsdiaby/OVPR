const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const { verifyToken } = require('../middleware/auth');

// Récupérer toutes les notifications de l'admin connecté
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
});

// Récupérer le nombre de notifications non lues
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du comptage des notifications' });
  }
});

// Marquer une notification comme lue
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    res.json({ message: 'Notification marquée comme lue', notification });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification' });
  }
});

// Marquer toutes les notifications comme lues
router.put('/mark-all-read', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des notifications' });
  }
});

// Supprimer une notification (super admin uniquement)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la notification' });
  }
});

// Créer une notification (pour les tests et les admins)
router.post('/', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.createNotification({
      ...req.body,
      recipient: req.body.recipient || req.user.id
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la notification' });
  }
});

module.exports = router;
