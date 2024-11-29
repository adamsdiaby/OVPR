const Signalement = require('../models/signalement');
const Annonce = require('../models/annonce');

// Créer un nouveau signalement
exports.createSignalement = async (req, res) => {
    try {
        const { annonceId, reason, description } = req.body;

        // Vérifier si l'annonce existe
        const annonce = await Annonce.findById(annonceId);
        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        const signalement = new Signalement({
            annonceId,
            userId: req.user.userId,
            reason,
            description
        });

        await signalement.save();

        // Mettre à jour le statut de l'annonce
        annonce.status = 'signaled';
        await annonce.save();

        res.status(201).json({
            message: 'Signalement créé avec succès',
            signalement
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du signalement', error: error.message });
    }
};

// Obtenir tous les signalements (pour les admins)
exports.getSignalements = async (req, res) => {
    try {
        const signalements = await Signalement.find()
            .populate('userId', 'firstName lastName email')
            .populate('annonceId')
            .sort({ createdAt: -1 });

        res.json(signalements);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des signalements', error: error.message });
    }
};

// Traiter un signalement (pour les admins)
exports.processSignalement = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const signalement = await Signalement.findById(req.params.id);

        if (!signalement) {
            return res.status(404).json({ message: 'Signalement non trouvé' });
        }

        signalement.status = status;
        signalement.adminComment = adminComment;
        signalement.resolvedAt = Date.now();

        await signalement.save();

        // Si le signalement est résolu, mettre à jour le statut de l'annonce
        if (status === 'resolved') {
            const annonce = await Annonce.findById(signalement.annonceId);
            if (annonce) {
                annonce.status = 'inactive';
                await annonce.save();
            }
        }

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
        const signalements = await Signalement.find({ userId: req.user.userId })
            .populate('annonceId')
            .sort({ createdAt: -1 });

        res.json(signalements);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des signalements', error: error.message });
    }
};
