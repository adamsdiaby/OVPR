const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur et inclure explicitement le mot de passe et le rôle
        const user = await User.findOne({ email }).select('+password +role');
        
        if (!user) {
            console.log('❌ Utilisateur non trouvé:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier si l'utilisateur est un admin
        if (user.role !== 'admin') {
            console.log('❌ Tentative de connexion non-admin:', email);
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('❌ Mot de passe invalide pour:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer le token avec le rôle
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role // Inclure explicitement le rôle dans le token
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Connexion admin réussie:', {
            userId: user._id,
            email: user.email,
            role: user.role
        });

        // Retourner la réponse
        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
};
