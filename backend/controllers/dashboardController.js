const Admin = require('../models/admin');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const Signalement = require('../models/signalement');

exports.getNotifications = async (req, res) => {
    try {
        // Pour l'instant, retournons des notifications fictives
        const notifications = [
            {
                id: 1,
                type: 'info',
                message: 'Bienvenue sur le tableau de bord OVPR',
                date: new Date(),
                read: false
            }
        ];
        res.json({ notifications });
    } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        // Récupérer les vraies statistiques de la base de données
        const totalAnnonces = await Annonce.countDocuments();
        const activeAnnonces = await Annonce.countDocuments({ status: 'active' });
        const totalUsers = await User.countDocuments();
        const totalSignalements = await Signalement.countDocuments();
        
        const statistics = {
            totalAnnonces,
            activeAnnonces,
            totalUsers,
            totalSignalements,
            recentActivity: {
                newAnnonces: await Annonce.countDocuments({
                    createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
                }),
                newUsers: await User.countDocuments({
                    createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
                }),
                newSignalements: await Signalement.countDocuments({
                    createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
                })
            }
        };
        
        res.json({ statistics });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const recentAnnonces = await Annonce.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title status createdAt');

        const recentSignalements = await Signalement.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('annonceId', 'title')
            .select('type status createdAt');

        res.json({
            recentAnnonces,
            recentSignalements
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des activités récentes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des activités récentes' });
    }
};
