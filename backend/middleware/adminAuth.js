const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
    try {
        // Vérifier si le header Authorization est présent
        if (!req.headers.authorization) {
            console.log('❌ Token manquant');
            return res.status(401).json({ message: 'Token manquant' });
        }

        // Extraire et vérifier le token
        const token = req.headers.authorization.split(' ')[1];
        console.log('🔑 Token reçu:', token);
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🔓 Token décodé:', decodedToken);

        // Vérifier si le rôle est présent dans le token
        if (!decodedToken.role || decodedToken.role !== 'admin') {
            console.log('❌ Rôle non autorisé:', decodedToken.role);
            return res.status(403).json({ message: 'Accès non autorisé - Rôle invalide' });
        }

        // Vérifier si l'utilisateur existe toujours en base
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            console.log('❌ Utilisateur non trouvé:', decodedToken.userId);
            return res.status(403).json({ message: 'Utilisateur non trouvé' });
        }

        console.log('👤 Utilisateur trouvé:', user);

        if (user.role !== 'admin') {
            console.log('❌ Utilisateur non admin:', user.role);
            return res.status(403).json({ message: 'Accès non autorisé - Utilisateur non admin' });
        }

        // Tout est OK, on continue
        req.user = {
            userId: decodedToken.userId,
            role: decodedToken.role
        };
        console.log('✅ Authentification réussie pour:', req.user);
        next();
    } catch (error) {
        console.error('❌ Erreur d\'authentification:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token invalide' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré' });
        }
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
