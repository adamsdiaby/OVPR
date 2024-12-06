const Annonce = require('../models/Annonce');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuration de Multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/annonces');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Seules les images au format JPG, JPEG ou PNG sont autorisées'));
    }
}).array('images', 5);

// Créer une nouvelle annonce
exports.createAnnonce = async (req, res) => {
    try {
        upload(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: 'Erreur lors de l\'upload des images', error: err.message });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }

            const {
                title,
                description,
                status,
                location,
                category,
                contact,
                price,
                currency,
                specificFields
            } = req.body;

            const images = req.files ? req.files.map(file => file.path) : [];

            const annonce = new Annonce({
                title,
                description,
                status,
                location,
                category,
                contact,
                price,
                currency,
                specificFields: JSON.parse(specificFields || '{}'),
                images,
                userId: req.user.userId
            });

            await annonce.save();
            res.status(201).json({
                message: 'Annonce créée avec succès',
                annonce
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de l\'annonce', error: error.message });
    }
};

// Obtenir toutes les annonces
exports.getAnnonces = async (req, res) => {
    try {
        const { category, location, status, search } = req.query;
        let query = {};

        if (category) query.category = category;
        if (location) query.location = { $regex: location, $options: 'i' };
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const annonces = await Annonce.find(query)
            .populate('userId', 'firstName lastName phone')
            .sort({ createdAt: -1 });

        res.json(annonces);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des annonces', error: error.message });
    }
};

// Obtenir une annonce par ID
exports.getAnnonceById = async (req, res) => {
    try {
        const annonce = await Annonce.findById(req.params.id)
            .populate('userId', 'firstName lastName phone');
        
        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }
        
        res.json(annonce);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'annonce', error: error.message });
    }
};

// Mettre à jour une annonce
exports.updateAnnonce = async (req, res) => {
    try {
        upload(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: 'Erreur lors de l\'upload des images', error: err.message });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }

            const annonce = await Annonce.findOne({ _id: req.params.id, userId: req.user.userId });

            if (!annonce) {
                return res.status(404).json({ message: 'Annonce non trouvée ou non autorisée' });
            }

            const {
                title,
                description,
                status,
                location,
                category,
                contact,
                price,
                currency,
                specificFields,
                existingImages
            } = req.body;

            // Gérer les images existantes et nouvelles
            let images = [];
            if (existingImages) {
                images = JSON.parse(existingImages);
            }
            if (req.files) {
                images = [...images, ...req.files.map(file => file.path)];
            }

            // Supprimer les anciennes images qui ne sont plus utilisées
            const imagesToDelete = annonce.images.filter(img => !images.includes(img));
            for (const img of imagesToDelete) {
                try {
                    await fs.unlink(img);
                } catch (error) {
                    console.error('Erreur lors de la suppression de l\'image:', error);
                }
            }

            // Mettre à jour l'annonce
            Object.assign(annonce, {
                title,
                description,
                status,
                location,
                category,
                contact,
                price,
                currency,
                specificFields: JSON.parse(specificFields || '{}'),
                images
            });

            await annonce.save();
            res.json({
                message: 'Annonce mise à jour avec succès',
                annonce
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'annonce', error: error.message });
    }
};

// Supprimer une annonce
exports.deleteAnnonce = async (req, res) => {
    try {
        const annonce = await Annonce.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée ou non autorisée' });
        }

        // Supprimer les images associées
        for (const img of annonce.images) {
            try {
                await fs.unlink(img);
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'image:', error);
            }
        }

        await annonce.deleteOne();
        res.json({ message: 'Annonce supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'annonce', error: error.message });
    }
};

// Obtenir les annonces d'un utilisateur
exports.getUserAnnonces = async (req, res) => {
    try {
        const annonces = await Annonce.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });
        res.json(annonces);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des annonces', error: error.message });
    }
};

// Obtenir les statistiques des annonces
exports.getAnnonceStats = async (req, res) => {
    try {
        const stats = await Annonce.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const categoryStats = await Annonce.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentAnnonces = await Annonce.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'firstName lastName');

        res.json({
            statusStats: stats,
            categoryStats,
            recentAnnonces
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
    }
};

// Routes administrateur
exports.getAllAnnoncesAdmin = async (req, res) => {
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
};

exports.getPendingAnnonces = async (req, res) => {
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
};

exports.approveAnnonce = async (req, res) => {
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
};

exports.rejectAnnonce = async (req, res) => {
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
};

exports.getReports = async (req, res) => {
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
};

exports.processReport = async (req, res) => {
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
};

// Méthodes utilitaires pour les autres contrôleurs
exports.updateAnnonceStatus = async (annonceId, newStatus) => {
    try {
        const annonce = await Annonce.findByIdAndUpdate(
            annonceId,
            { status: newStatus },
            { new: true }
        );
        return annonce;
    } catch (error) {
        throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
};

exports.findAnnonceById = async (annonceId) => {
    try {
        const annonce = await Annonce.findById(annonceId);
        return annonce;
    } catch (error) {
        throw new Error(`Erreur lors de la recherche de l'annonce: ${error.message}`);
    }
};

exports.findAnnoncesByStatus = async (status) => {
    try {
        const annonces = await Annonce.find({ status })
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });
        return annonces;
    } catch (error) {
        throw new Error(`Erreur lors de la recherche des annonces: ${error.message}`);
    }
};

// Méthode pour rechercher des annonces avec des filtres
exports.findAnnoncesByFilters = async (filters) => {
    try {
        const annonces = await Annonce.find(filters)
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });
        return annonces;
    } catch (error) {
        throw new Error(`Erreur lors de la recherche des annonces: ${error.message}`);
    }
};
