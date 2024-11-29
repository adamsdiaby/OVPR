const Admin = require('../models/admin');

const roleCheck = (roles) => {
  return async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.user.id);
      
      if (!admin) {
        return res.status(404).json({ message: 'Administrateur non trouvé' });
      }

      if (admin.status !== 'actif') {
        return res.status(403).json({ message: 'Votre compte n\'est pas actif' });
      }

      if (!roles.includes(admin.role)) {
        return res.status(403).json({
          message: 'Vous n\'avez pas les permissions nécessaires pour cette action'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
};

module.exports = roleCheck;
