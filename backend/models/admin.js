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
    }
});

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
        select: false
    },
    nom: {
        type: String,
        required: true,
        trim: true
    },
    prenom: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'moderateur'],
        default: 'moderateur'
    },
    status: {
        type: String,
        enum: ['actif', 'inactif', 'suspendu'],
        default: 'actif'
    },
    permissions: {
        type: permissionSchema,
        select: false,
        default: () => ({})
    },
    lastLogin: {
        type: Date
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

// Hook pre-save pour hasher le mot de passe
adminSchema.pre('save', async function(next) {
    // Ne hasher le mot de passe que s'il a été modifié et n'est pas déjà hashé
    if (this.isModified('password') && !this.password.startsWith('$2')) {
        console.log('Hashage du mot de passe dans le hook pre-save');
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});

// Méthode pour vérifier le mot de passe
adminSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Comparaison des mots de passe:');
        console.log('- Mot de passe candidat (longueur):', candidatePassword?.length);
        console.log('- Hash stocké (longueur):', this.password?.length);
        
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('- Résultat de la comparaison:', isMatch);
        
        return isMatch;
    } catch (error) {
        console.error('Erreur dans comparePassword:', error);
        throw new Error('Erreur lors de la comparaison des mots de passe');
    }
};

// Méthode pour vérifier une permission spécifique
adminSchema.methods.hasPermission = function(action, resource) {
    if (this.role === 'super_admin') return true;
    return this.permissions?.[resource]?.[action] === true;
};

// Méthode pour vérifier plusieurs permissions
adminSchema.methods.hasPermissions = function(requiredPermissions) {
    if (this.role === 'super_admin') return true;
    return requiredPermissions.every(({ action, resource }) => 
        this.hasPermission(action, resource)
    );
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
