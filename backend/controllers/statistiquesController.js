const Annonce = require('../models/annonce');
const Signalement = require('../models/signalement');
const User = require('../models/user');

// Statistiques de base
exports.getBasicStats = async (req, res) => {
    try {
        const stats = {
            totalAnnonces: await Annonce.countDocuments(),
            totalUsers: await User.countDocuments(),
            totalSignalements: await Signalement.countDocuments(),
            annoncesByStatus: {
                active: await Annonce.countDocuments({ status: 'active' }),
                inactive: await Annonce.countDocuments({ status: 'inactive' }),
                pending: await Annonce.countDocuments({ status: 'pending' })
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Erreur statistiques:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
};

// Statistiques détaillées des signalements
exports.getSignalementStats = async (req, res) => {
    try {
        const stats = {
            total: await Signalement.countDocuments(),
            byStatus: {
                pending: await Signalement.countDocuments({ status: 'pending' }),
                processed: await Signalement.countDocuments({ status: 'processed' }),
                rejected: await Signalement.countDocuments({ status: 'rejected' })
            },
            byReason: await Signalement.aggregate([
                { $group: { _id: "$reason", count: { $sum: 1 } } }
            ])
        };

        res.json(stats);
    } catch (error) {
        console.error('Erreur statistiques signalements:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
};

// Statistiques avancées
exports.getAdvancedStats = async (req, res) => {
    try {
        const timeRange = req.query.timeRange || 'month';
        let dateFilter = {};
        
        // Calculer la date de début selon la plage de temps
        const now = new Date();
        if (timeRange === 'month') {
            dateFilter = { 
                createdAt: { 
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1) 
                }
            };
        } else if (timeRange === 'week') {
            const lastWeek = new Date(now.setDate(now.getDate() - 7));
            dateFilter = { createdAt: { $gte: lastWeek } };
        }

        const stats = {
            annonces: {
                total: await Annonce.countDocuments(dateFilter),
                byCategory: await Annonce.aggregate([
                    { $match: dateFilter },
                    { $group: { _id: "$category", count: { $sum: 1 } } }
                ]),
                byLocation: await Annonce.aggregate([
                    { $match: dateFilter },
                    { $group: { _id: "$location", count: { $sum: 1 } } }
                ])
            },
            users: {
                total: await User.countDocuments(dateFilter),
                active: await User.countDocuments({ ...dateFilter, status: 'active' })
            },
            signalements: {
                total: await Signalement.countDocuments(dateFilter),
                byStatus: await Signalement.aggregate([
                    { $match: dateFilter },
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ])
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Erreur statistiques avancées:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques avancées" });
    }
};
