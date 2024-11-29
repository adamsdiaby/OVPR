const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Annonce = require('../models/annonce');
const Admin = require('../models/admin');

// Statistiques du tableau de bord principal
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [totalAnnonces, activeAnnonces, resolvedAnnonces, pendingValidation] = await Promise.all([
      Annonce.countDocuments(),
      Annonce.countDocuments({ status: 'active' }),
      Annonce.countDocuments({ status: 'resolved' }),
      Annonce.countDocuments({ status: 'pending' })
    ]);

    res.json({
      totalAnnonces,
      activeAnnonces,
      resolvedAnnonces,
      pendingValidation
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// Statistiques par catégorie
router.get('/categories', auth, async (req, res) => {
  try {
    const stats = await Annonce.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques par catégorie' });
  }
});

// Statistiques d'évolution dans le temps
router.get('/evolution', auth, async (req, res) => {
  try {
    const stats = await Annonce.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques d\'évolution' });
  }
});

// Statistiques de performance
router.get('/performance', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalResolved,
      averageResolutionTime,
      satisfactionRate
    ] = await Promise.all([
      Annonce.countDocuments({
        status: 'resolved',
        updatedAt: { $gte: thirtyDaysAgo }
      }),
      Annonce.aggregate([
        {
          $match: {
            status: 'resolved',
            updatedAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: {
              $avg: {
                $subtract: ['$updatedAt', '$createdAt']
              }
            }
          }
        }
      ]),
      Annonce.aggregate([
        {
          $match: {
            status: 'resolved',
            updatedAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: null,
            avgSatisfaction: { $avg: '$satisfaction' }
          }
        }
      ])
    ]);

    res.json({
      totalResolved,
      averageResolutionTime: averageResolutionTime[0]?.avgTime || 0,
      satisfactionRate: satisfactionRate[0]?.avgSatisfaction || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques de performance' });
  }
});

module.exports = router;
