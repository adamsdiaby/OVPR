const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['utilisateur', 'moderateur', 'admin', 'super_admin']
  },
  permissions: {
    annonces: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      validate: { type: Boolean, default: false }
    },
    signalements: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: false },
      process: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    utilisateurs: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      suspend: { type: Boolean, default: false }
    },
    statistiques: {
      read: { type: Boolean, default: false },
      export: { type: Boolean, default: false }
    }
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour la date de modification
roleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Role = mongoose.model('Role', roleSchema);

// Créer les rôles par défaut s'ils n'existent pas
const initializeRoles = async () => {
  const defaultRoles = [
    {
      name: 'utilisateur',
      description: 'Utilisateur standard avec des permissions de base',
      permissions: {
        annonces: {
          create: true,
          read: true,
          update: true,
          delete: true
        },
        signalements: {
          create: true,
          read: true
        }
      }
    },
    {
      name: 'moderateur',
      description: 'Modérateur avec des permissions de gestion de contenu',
      permissions: {
        annonces: {
          read: true,
          validate: true,
          delete: true
        },
        signalements: {
          read: true,
          process: true,
          delete: true
        },
        utilisateurs: {
          read: true,
          suspend: true
        }
      }
    },
    {
      name: 'admin',
      description: 'Administrateur avec des permissions étendues',
      permissions: {
        annonces: {
          create: true,
          read: true,
          update: true,
          delete: true,
          validate: true
        },
        signalements: {
          read: true,
          process: true,
          delete: true
        },
        utilisateurs: {
          create: true,
          read: true,
          update: true,
          delete: true,
          suspend: true
        },
        statistiques: {
          read: true,
          export: true
        }
      }
    },
    {
      name: 'super_admin',
      description: 'Super administrateur avec toutes les permissions',
      permissions: {
        annonces: {
          create: true,
          read: true,
          update: true,
          delete: true,
          validate: true
        },
        signalements: {
          create: true,
          read: true,
          process: true,
          delete: true
        },
        utilisateurs: {
          create: true,
          read: true,
          update: true,
          delete: true,
          suspend: true
        },
        statistiques: {
          read: true,
          export: true
        }
      }
    }
  ];

  for (const role of defaultRoles) {
    try {
      await Role.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Erreur lors de la création du rôle ${role.name}:`, error);
    }
  }
};

module.exports = {
  Role,
  initializeRoles
};
