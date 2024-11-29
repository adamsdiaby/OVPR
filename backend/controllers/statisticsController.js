const Annonce = require('../models/annonce');
const Signalement = require('../models/signalement');
const User = require('../models/user');
const excel = require('exceljs');

// Fonction utilitaire pour obtenir la date il y a X jours
const getDateXDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

// Statistiques de base
exports.getBasicStats = async (req, res) => {
    try {
        const stats = {
            lost: await Annonce.countDocuments({ type: 'perdu' }),
            stolen: await Annonce.countDocuments({ type: 'volé' }),
            found: await Annonce.countDocuments({ type: 'retrouvé' }),
            signals: await Signalement.countDocuments(),
            activeUsers: await User.countDocuments({ lastActive: { $gte: getDateXDaysAgo(30) } })
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
};

// Statistiques avancées
exports.getAdvancedStats = async (req, res) => {
    try {
        const { timeRange } = req.query;
        let startDate;

        switch (timeRange) {
            case 'week':
                startDate = getDateXDaysAgo(7);
                break;
            case 'month':
                startDate = getDateXDaysAgo(30);
                break;
            case 'year':
                startDate = getDateXDaysAgo(365);
                break;
            default:
                startDate = getDateXDaysAgo(30);
        }

        // Activité dans le temps
        const activityOverTime = await Annonce.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    annonces: { $sum: 1 },
                    signalements: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "signalement"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Distribution par catégorie
        const categoryDistribution = await Annonce.aggregate([
            {
                $group: {
                    _id: "$category",
                    value: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    value: 1,
                    _id: 0
                }
            }
        ]);

        // Distribution par région
        const regionDistribution = await Annonce.aggregate([
            {
                $group: {
                    _id: "$region",
                    value: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    value: 1,
                    _id: 0
                }
            }
        ]);

        // Activité des utilisateurs
        const userActivity = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    nouveaux: { $sum: 1 },
                    actifs: {
                        $sum: {
                            $cond: [
                                { $gte: ["$lastActive", getDateXDaysAgo(1)] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Taux de succès
        const totalAnnonces = await Annonce.countDocuments();
        const resolvedAnnonces = await Annonce.countDocuments({ status: 'résolu' });
        const successRate = [
            { name: 'Résolus', value: resolvedAnnonces },
            { name: 'En cours', value: totalAnnonces - resolvedAnnonces }
        ];

        // Statistiques supplémentaires
        const hourlyDistribution = await Annonce.aggregate([
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    hour: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        const responseData = {
            activityOverTime: activityOverTime.map(item => ({
                date: item._id,
                annonces: item.annonces,
                signalements: item.signalements
            })),
            categoryDistribution,
            regionDistribution,
            userActivity: userActivity.map(item => ({
                date: item._id,
                nouveaux: item.nouveaux,
                actifs: item.actifs
            })),
            successRate,
            hourlyDistribution
        };

        res.json(responseData);
    } catch (error) {
        console.error('Erreur statistiques avancées:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques avancées' });
    }
};

// Export des statistiques
exports.exportStats = async (req, res) => {
    try {
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Statistiques');

        // Configuration des colonnes
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Annonces', key: 'annonces', width: 10 },
            { header: 'Signalements', key: 'signalements', width: 12 },
            { header: 'Nouveaux Utilisateurs', key: 'nouveauxUtilisateurs', width: 20 },
            { header: 'Utilisateurs Actifs', key: 'utilisateursActifs', width: 18 }
        ];

        // Récupération des données
        const startDate = getDateXDaysAgo(30);
        const stats = await Annonce.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    annonces: { $sum: 1 },
                    signalements: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "signalement"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Ajout des données au worksheet
        stats.forEach(stat => {
            worksheet.addRow({
                date: stat._id,
                annonces: stat.annonces,
                signalements: stat.signalements,
                nouveauxUtilisateurs: 0, // À implémenter avec les données réelles
                utilisateursActifs: 0 // À implémenter avec les données réelles
            });
        });

        // Stylisation
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '6B46C1' }
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFF' } };

        // Envoi du fichier
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=statistiques.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Erreur export:', error);
        res.status(500).json({ message: 'Erreur lors de l\'export des statistiques' });
    }
};
