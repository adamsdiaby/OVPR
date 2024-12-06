const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const verifyToken = async (req, res, next) => {
    try {
        console.log('Vérification du token...');
        console.log('Headers:', req.headers);
        
        // Vérifier le token
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Token extrait:', token);
        
        if (!token) {
            console.log('Pas de token trouvé');
            return res.status(401).json({ message: 'Token manquant' });
        }

        // Décoder le token
        console.log('Décodage du token avec secret:', process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token décodé:', decoded);
        
        // Récupérer l'admin avec ses permissions
        const admin = await Admin.findById(decoded.id).select('+permissions');
        console.log('Admin trouvé:', admin ? 'Oui' : 'Non');
        
        if (!admin) {
            console.log('Admin non trouvé pour ID:', decoded.id);
            return res.status(404).json({ message: 'Administrateur non trouvé' });
        }

        if (admin.status !== 'actif') {
            console.log('Compte admin non actif. Status:', admin.status);
            return res.status(403).json({ message: 'Compte désactivé' });
        }

        // Ajouter les informations de l'admin à la requête
        req.user = {
            id: admin._id,
            role: admin.role,
            permissions: admin.permissions,
            email: admin.email,
            nom: admin.nom,
            prenom: admin.prenom,
            status: admin.status
        };

        console.log('Authentification réussie pour:', admin.email);
        next();
    } catch (error) {
        console.error('Erreur d\'authentification détaillée:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token invalide' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré' });
        }
        
        res.status(500).json({ message: 'Erreur lors de l\'authentification' });
    }
};

module.exports = {
    verifyToken
};
