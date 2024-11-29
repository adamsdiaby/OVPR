const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const permissionSchema = new mongoose.Schema({
  annonces: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    validate: { type: Boolean, default: false }
  },
  signalements: {
    read: { type: Boolean, default: true },
    process: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  },
  statistiques: {
    read: { type: Boolean, default: true },
    export: { type: Boolean, default: false }
  },
  admins: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  },
  alertes: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    broadcast: { type: Boolean, default: false }
  },
  biens: {
    recherche: { type: Boolean, default: true },
    declaration: { type: Boolean, default: false },
    modification: { type: Boolean, default: false }
  }
});

const actionLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  statut: {
    type: String,
    enum: ['en_attente', 'validé', 'rejeté'],
    default: 'en_attente'
  },
  validePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  dateValidation: Date,
  commentaire: String
}, { timestamps: true });

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderateur', 'police', 'gendarmerie'],
    default: 'moderateur'
  },
  permissions: {
    type: permissionSchema,
    default: () => ({})
  },
  status: {
    type: String,
    enum: ['actif', 'inactif', 'en_attente'],
    default: 'en_attente'
  },
  serviceId: {
    type: String,
    required: function() {
      return this.role === 'police' || this.role === 'gendarmerie';
    }
  },
  matricule: {
    type: String,
    required: function() {
      return this.role === 'police' || this.role === 'gendarmerie';
    }
  },
  unite: {
    type: String,
    required: function() {
      return this.role === 'police' || this.role === 'gendarmerie';
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastLogin: {
    type: Date
  },
  actionsLog: [actionLogSchema],
  actionsRequiringValidation: [{
    type: {
      type: String,
      enum: ['annonce_deletion', 'admin_creation', 'permission_change', 'alerte_broadcast']
    },
    targetId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ['en_attente', 'approuve', 'rejete'],
      default: 'en_attente'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Middleware pour hasher le mot de passe avant la sauvegarde
adminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Méthode pour vérifier le mot de passe
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour vérifier les permissions
adminSchema.methods.hasPermission = function(action, resource) {
  if (this.role === 'super_admin') return true;
  return this.permissions[resource]?.[action] === true;
};

// Méthode pour vérifier si une action nécessite une validation
adminSchema.methods.requiresValidation = function(action) {
  const criticalActions = [
    'annonce_deletion',
    'admin_creation',
    'permission_change',
    'alerte_broadcast'
  ];
  return this.role !== 'super_admin' && criticalActions.includes(action);
};

// Méthode pour journaliser une action
adminSchema.methods.logAction = async function(action, details) {
  this.actionsLog.push({
    action,
    details,
    statut: this.requiresValidation(action) ? 'en_attente' : 'validé'
  });
  await this.save();
};

// Méthode pour obtenir les permissions par défaut selon le rôle
adminSchema.statics.getDefaultPermissions = function(role) {
  const permissions = {
    moderateur: {
      annonces: { read: true, update: true },
      signalements: { read: true },
      statistiques: { read: true },
      biens: { recherche: true }
    },
    admin: {
      annonces: { create: true, read: true, update: true, validate: true },
      signalements: { read: true, process: true },
      statistiques: { read: true, export: true },
      admins: { read: true },
      alertes: { read: true, create: true },
      biens: { recherche: true, declaration: true }
    },
    police: {
      biens: { recherche: true, declaration: true },
      alertes: { read: true, create: true },
      signalements: { read: true, process: true }
    },
    gendarmerie: {
      biens: { recherche: true, declaration: true },
      alertes: { read: true, create: true },
      signalements: { read: true, process: true }
    },
    super_admin: {
      annonces: { create: true, read: true, update: true, delete: true, validate: true },
      signalements: { read: true, process: true, delete: true },
      statistiques: { read: true, export: true },
      admins: { create: true, read: true, update: true, delete: true },
      alertes: { create: true, read: true, update: true, broadcast: true },
      biens: { recherche: true, declaration: true, modification: true }
    }
  };
  return permissions[role] || permissions.moderateur;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
