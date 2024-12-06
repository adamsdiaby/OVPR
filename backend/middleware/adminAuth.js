const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // Vérifier le token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est un administrateur
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Erreur d\'authentification' });
  }
};

module.exports = adminAuth;
