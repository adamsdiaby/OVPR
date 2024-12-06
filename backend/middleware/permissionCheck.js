const Admin = require('../models/admin');

const permissionCheck = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.user.id).select('+permissions');
      
      if (!admin) {
        return res.status(404).json({ message: 'Administrateur non trouvé' });
      }

      if (admin.status !== 'actif') {
        return res.status(403).json({ message: 'Votre compte n\'est pas actif' });
      }

      // Super admin a toutes les permissions
      if (admin.role === 'super_admin') {
        return next();
      }

      // Vérifier si l'admin a toutes les permissions requises
      const hasAllPermissions = requiredPermissions.every(permission => 
        admin.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          message: 'Vous n\'avez pas les permissions nécessaires pour cette action'
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification des permissions:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la vérification des permissions' });
    }
  };
};

module.exports = permissionCheck;
