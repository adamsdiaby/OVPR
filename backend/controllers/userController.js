const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Inscription
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Créer un nouvel utilisateur
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phone
        });

        await user.save();

        // Créer le token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
    }
};

// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
    }
};

// Obtenir le profil utilisateur
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
    }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { firstName, lastName, phone },
            { new: true }
        ).select('-password');

        res.json({
            message: 'Profil mis à jour avec succès',
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
    }
};
