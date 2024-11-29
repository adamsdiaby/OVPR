const Annonce = require('../models/annonce');

// Créer une nouvelle annonce
exports.createAnnonce = async (req, res) => {
    try {
        const { title, description, price, location, category, images } = req.body;
        const annonce = new Annonce({
            title,
            description,
            price,
            location,
            category,
            images,
            userId: req.user.userId
        });

        await annonce.save();
        res.status(201).json({
            message: 'Annonce créée avec succès',
            annonce
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de l\'annonce', error: error.message });
    }
};

// Obtenir toutes les annonces
exports.getAnnonces = async (req, res) => {
    try {
        const { category, location, minPrice, maxPrice } = req.query;
        let query = { status: 'active' };

        if (category) query.category = category;
        if (location) query.location = location;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
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
        const { title, description, price, location, category, images } = req.body;
        const annonce = await Annonce.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée ou non autorisée' });
        }

        annonce.title = title;
        annonce.description = description;
        annonce.price = price;
        annonce.location = location;
        annonce.category = category;
        if (images) annonce.images = images;
        annonce.updatedAt = Date.now();

        await annonce.save();
        res.json({
            message: 'Annonce mise à jour avec succès',
            annonce
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

        await annonce.remove();
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
