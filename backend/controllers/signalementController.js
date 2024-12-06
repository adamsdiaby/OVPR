const Signalement = require('../models/signalement');
const NotificationService = require('../services/notificationService');
const annonceController = require('./annonceController');

// Créer un nouveau signalement
exports.createSignalement = async (req, res) => {
    try {
        const { annonceId, reason, description } = req.body;

        // Vérifier si l'annonce existe via le contrôleur
        const annonce = await annonceController.findAnnonceById(annonceId);
        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        const signalement = new Signalement({
            annonce: annonceId,
            reportedBy: req.user._id,
            reason,
            description
        });

        await signalement.save();

        // Mettre à jour le statut via le contrôleur
        await annonceController.updateAnnonceStatus(annonceId, 'reported');

        // Notifier les administrateurs
        await NotificationService.createBroadcastNotification(
            'admin',
            `Nouveau signalement pour l'annonce ${annonceId}`,
            'high'
        );

        res.status(201).json(signalement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir tous les signalements (pour les admins)
exports.getSignalements = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const signalements = await Signalement.find()
            .populate('reportedBy', 'firstName lastName email')
            .populate('annonce')
            .sort({ createdAt: -1 });

        res.json(signalements);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des signalements', error: error.message });
    }
};

// Obtenir un signalement par son ID
exports.getSignalementById = async (req, res) => {
    try {
        const signalement = await Signalement.findById(req.params.id)
            .populate('reportedBy', 'firstName lastName email')
            .populate('annonce');

        if (!signalement) {
            return res.status(404).json({ message: 'Signalement non trouvé' });
        }

        // Vérifier que l'utilisateur est admin ou propriétaire du signalement
        if (!req.user.isAdmin && signalement.reportedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        res.json(signalement);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du signalement', error: error.message });
    }
};

// Traiter un signalement (pour les admins)
exports.processSignalement = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const { status, comment } = req.body;
        const signalement = await Signalement.findById(req.params.id);

        if (!signalement) {
            return res.status(404).json({ message: 'Signalement non trouvé' });
        }

        signalement.status = status;
        signalement.adminComment = comment;
        signalement.processedBy = req.user.id;
        signalement.processedAt = new Date();
        await signalement.save();

        // Mettre à jour le statut de l'annonce si nécessaire
        if (status === 'accepted') {
            await annonceController.updateAnnonceStatus(signalement.annonce, 'removed');
        }

        // Notifier l'utilisateur qui a fait le signalement
        await NotificationService.createNotification({
            type: 'SIGNALEMENT_PROCESSED',
            recipient: signalement.reportedBy,
            data: {
                signalementId: signalement._id,
                status: status
            }
        });

        res.json({
            message: 'Signalement traité avec succès',
            signalement
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du traitement du signalement', error: error.message });
    }
};

// Obtenir les signalements d'un utilisateur
exports.getUserSignalements = async (req, res) => {
    try {
        const signalements = await Signalement.find({ reportedBy: req.user.id })
            .populate('annonce')
            .sort({ createdAt: -1 });

        res.json(signalements);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des signalements', error: error.message });
    }
};
